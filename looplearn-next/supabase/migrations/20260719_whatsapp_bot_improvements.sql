-- Migration: WhatsApp bot improvements
-- 1. Allow plan_id to be NULL in homework_submissions (for guest/freeform submissions)
-- 2. Add bot_reply_text column to whatsapp_submission_sessions

-- ── 1. Allow NULL plan_id in homework_submissions ────────────────────────────
-- Drop the NOT NULL constraint if it exists
ALTER TABLE homework_submissions
    ALTER COLUMN plan_id DROP NOT NULL;

-- Update unique constraint to only apply when plan_id is NOT NULL
-- (Postgres partial unique index allows this)
DO $$
BEGIN
    -- Drop existing unique constraint/index if present
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homework_submissions_plan_id_student_id_key'
    ) THEN
        ALTER TABLE homework_submissions
            DROP CONSTRAINT homework_submissions_plan_id_student_id_key;
    END IF;
END $$;

-- Create a partial unique index: unique per (plan_id, student_id) only when plan_id IS NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_homework_submissions_plan_student
    ON homework_submissions (plan_id, student_id)
    WHERE plan_id IS NOT NULL;

-- ── 2. Add bot_reply_text to whatsapp_submission_sessions ────────────────────
ALTER TABLE whatsapp_submission_sessions
    ADD COLUMN IF NOT EXISTS bot_reply_text TEXT;

-- Add index for quick lookup by student + completed
CREATE INDEX IF NOT EXISTS idx_wss_student_completed
    ON whatsapp_submission_sessions (student_id, status)
    WHERE status = 'completed';
