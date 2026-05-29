-- ============================================================
-- LoopLearn: Three-Tier AI Tutor Memory System
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Enable pg_cron extension ─────────────────────────────
-- Required for nightly memory summarization job (runs inside DB — reliable)
-- Note: pg_cron must be enabled in Supabase Dashboard > Database > Extensions first
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ── 2. Tier 1 — Short-Term Conversational Window ─────────────
-- Stores the rolling per-student chat history (last N messages injected into prompt)
CREATE TABLE IF NOT EXISTS chat_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup: most recent messages per student for sliding window
CREATE INDEX IF NOT EXISTS idx_chat_messages_student_recent
    ON chat_messages(student_id, created_at DESC);

-- ── 3. Tier 2 — Mid-Term Personalized Learning Profile ───────
-- Stores distilled behavioral facts extracted from conversation history.
-- Updated nightly by pg_cron (see below). Fetched by primary key — zero latency penalty.
CREATE TABLE IF NOT EXISTS student_ai_memory (
    student_id          UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    learning_profile    TEXT,           -- Bullet-point facts: "Struggles with X, excels at Y"
    last_summarized_at  TIMESTAMPTZ DEFAULT NOW(),
    total_sessions      INT DEFAULT 0   -- Running count of tutoring interactions
);

-- ── 4. RLS Policies ──────────────────────────────────────────
ALTER TABLE chat_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_ai_memory   ENABLE ROW LEVEL SECURITY;

-- Students can only read their own messages
CREATE POLICY "Students read own chat history"
    ON chat_messages FOR SELECT
    USING (auth.uid() = student_id);

-- Teachers can read all chat history
CREATE POLICY "Teachers read all chat history"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- Service role (used by API with admin client) can do everything
-- (Bypasses RLS automatically with service_role key)

-- Teachers can read all student memory profiles
CREATE POLICY "Teachers read student memory"
    ON student_ai_memory FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- Students can read own memory profile
CREATE POLICY "Students read own memory"
    ON student_ai_memory FOR SELECT
    USING (auth.uid() = student_id);

-- ── 5. Helper Function: Get sliding window for a student ──────
-- Returns last N messages for injection into the Gemini prompt
CREATE OR REPLACE FUNCTION get_chat_window(p_student_id UUID, p_limit INT DEFAULT 6)
RETURNS TABLE (role TEXT, content TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT cm.role, cm.content, cm.created_at
    FROM (
        SELECT * FROM chat_messages
        WHERE student_id = p_student_id
        ORDER BY created_at DESC
        LIMIT p_limit
    ) cm
    ORDER BY cm.created_at ASC; -- Return in chronological order for prompt
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. Stale Memory Safety Net ───────────────────────────────
-- Returns true if a student's memory profile is stale (not summarized in 48h)
-- The hot path checks this and triggers inline mini-summary if stale
CREATE OR REPLACE FUNCTION is_memory_stale(p_student_id UUID)
RETURNS BOOLEAN AS $$
    SELECT (
        NOT EXISTS (SELECT 1 FROM student_ai_memory WHERE student_id = p_student_id)
        OR (
            SELECT last_summarized_at < NOW() - INTERVAL '48 hours'
            FROM student_ai_memory WHERE student_id = p_student_id
        )
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- ── 7. Cleanup Function: Prune old messages ──────────────────
-- Keeps the chat_messages table lean. Messages older than 90 days are archived/deleted.
-- Run manually or via pg_cron after deploying.
CREATE OR REPLACE FUNCTION prune_old_chat_messages()
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    DELETE FROM chat_messages
    WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 8. NOTE: Pruning is handled by Vercel Cron ──────────────────────────────
-- The function prune_old_chat_messages() above is called nightly from:
--   /api/cron/summarize-memory  (Vercel Cron, runs at 10 PM IST daily)
--
-- pg_cron is NOT required — it only works on Supabase Pro plan.
-- If you upgrade to Pro later, you can optionally enable it in:
--   Supabase Dashboard → Database → Extensions → pg_cron
-- And then run:
--   SELECT cron.schedule('prune-old-chat-messages', '0 21 * * *', $$SELECT prune_old_chat_messages()$$);

