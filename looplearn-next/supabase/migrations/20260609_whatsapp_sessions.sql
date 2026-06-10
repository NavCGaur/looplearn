-- ============================================================
-- LoopLearn: WhatsApp Submission Session Tracking
-- Run in Supabase SQL Editor or via Supabase CLI
-- ============================================================

CREATE TABLE IF NOT EXISTS whatsapp_submission_sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status      TEXT NOT NULL CHECK (status IN ('active', 'processing', 'needs_reupload', 'completed', 'failed')),
    pages       JSONB DEFAULT '[]', -- Array of: {"page": N, "path": "...", "status": "ok" | "cutoff" | "unreadable" | "poor_lighting" | "questions_only" | "answers_only", "reason": "..."}
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup of active/needs_reupload sessions per student
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_active
    ON whatsapp_submission_sessions(student_id)
    WHERE status IN ('active', 'needs_reupload');

-- Enable RLS
ALTER TABLE whatsapp_submission_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
CREATE POLICY "Students view own sessions"
    ON whatsapp_submission_sessions FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Teachers view all sessions"
    ON whatsapp_submission_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );
