-- ============================================
-- COMPLETE FIX: Add DELETE policies for CASCADE to work
-- ============================================
-- This adds DELETE policies to ALL tables that need them
-- Run this entire file in your Supabase SQL Editor

-- ============================================
-- 1. QUESTIONS TABLE - Teachers delete own questions
-- ============================================
DROP POLICY IF EXISTS "Teachers delete own questions" ON questions;

CREATE POLICY "Teachers delete own questions"
  ON questions FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. QUESTION_OPTIONS TABLE - Allow CASCADE delete
-- ============================================
-- This policy allows deletion when the parent question is being deleted
DROP POLICY IF EXISTS "Allow cascade delete for question_options" ON question_options;

CREATE POLICY "Allow cascade delete for question_options"
  ON question_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = question_options.question_id
      AND (questions.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================
-- 3. FILLBLANK_ANSWERS TABLE - Allow CASCADE delete
-- ============================================
DROP POLICY IF EXISTS "Allow cascade delete for fillblank_answers" ON fillblank_answers;

CREATE POLICY "Allow cascade delete for fillblank_answers"
  ON fillblank_answers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = fillblank_answers.question_id
      AND (questions.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================
-- 4. USER_PROGRESS TABLE - Allow CASCADE delete
-- ============================================
-- This allows deletion when the parent question is deleted
-- OR when users delete their own progress
DROP POLICY IF EXISTS "Allow cascade delete for user_progress" ON user_progress;

CREATE POLICY "Allow cascade delete for user_progress"
  ON user_progress FOR DELETE
  USING (
    -- Users can delete their own progress
    user_id = auth.uid() OR
    -- Or when the question is being deleted by its creator/admin
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = user_progress.question_id
      AND (questions.created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================
-- VERIFY: Check all DELETE policies were created
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE cmd = 'DELETE'
  AND tablename IN ('questions', 'question_options', 'fillblank_answers', 'user_progress')
ORDER BY tablename;

-- ============================================
-- EXPECTED OUTPUT:
-- ============================================
-- You should see 4 DELETE policies:
-- 1. questions                -> Teachers delete own questions
-- 2. question_options         -> Allow cascade delete for question_options
-- 3. fillblank_answers        -> Allow cascade delete for fillblank_answers
-- 4. user_progress            -> Allow cascade delete for user_progress
