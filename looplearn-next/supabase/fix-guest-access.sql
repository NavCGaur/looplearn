-- Fix RLS policies to allow guest access to questions
-- Run this in Supabase SQL Editor

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Students read questions for their class or below" ON questions;

-- Create new policy that allows:
-- 1. Guests (unauthenticated) to read all active questions
-- 2. Students to read questions for their class or below
CREATE POLICY "Anyone can read active questions"
  ON questions FOR SELECT
  USING (
    is_active = true AND (
      -- Allow guests (no auth)
      auth.uid() IS NULL
      OR
      -- Allow authenticated users for their class level
      class_standard <= (
        SELECT class_standard FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Also update question_options policy for guests
DROP POLICY IF EXISTS "Users read options for active questions" ON question_options;

CREATE POLICY "Anyone can read options for active questions"
  ON question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = question_options.question_id 
      AND questions.is_active = true
    )
  );

-- Update fillblank_answers policy for guests
DROP POLICY IF EXISTS "Users read fillblank answers" ON fillblank_answers;

CREATE POLICY "Anyone can read fillblank answers"
  ON fillblank_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = fillblank_answers.question_id 
      AND questions.is_active = true
    )
  );

-- Verify the changes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('questions', 'question_options', 'fillblank_answers')
ORDER BY tablename, policyname;
