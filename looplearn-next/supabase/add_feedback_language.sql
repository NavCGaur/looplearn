-- Add language preference to subjective_tests
-- Run in Supabase Dashboard > SQL Editor

ALTER TABLE subjective_tests
ADD COLUMN IF NOT EXISTS feedback_language TEXT NOT NULL DEFAULT 'english'
  CHECK (feedback_language IN ('english', 'hinglish'));
