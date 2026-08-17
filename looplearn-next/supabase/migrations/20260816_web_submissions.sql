-- ============================================================
-- Web Submissions Table
-- Stores homework submissions made via the /submit web page
-- (bypasses WhatsApp — students submit directly from browser)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.web_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Student info (freeform — no auth required)
    student_name    TEXT NOT NULL,
    class_standard  INTEGER NOT NULL CHECK (class_standard BETWEEN 1 AND 12),

    -- Submission metadata
    submission_type TEXT NOT NULL CHECK (submission_type IN ('dictation', 'homework')),
    image_path      TEXT,            -- Supabase Storage path (assignment-papers bucket)

    -- AI evaluation result (full JSON blob)
    ai_result       JSONB,

    -- Scores
    score           NUMERIC,         -- for dictation: net marks; for homework: total marks
    max_score       NUMERIC,         -- max possible marks (null for dictation)
    total_words     INTEGER,         -- dictation only: number of words evaluated

    -- Status
    status          TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'error')),
    error_message   TEXT            -- only populated if status = 'error'
);

-- Index for teacher dashboard queries
CREATE INDEX IF NOT EXISTS web_submissions_created_at_idx ON public.web_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS web_submissions_student_name_idx ON public.web_submissions (student_name);
CREATE INDEX IF NOT EXISTS web_submissions_class_idx ON public.web_submissions (class_standard);

-- Allow service role full access (we use service role key in the server action)
-- RLS is intentionally disabled here since submissions are public (no auth)
ALTER TABLE public.web_submissions DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.web_submissions IS
    'Homework photo submissions submitted via the public /submit web page. No auth required.';
