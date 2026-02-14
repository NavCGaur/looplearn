-- ============================================
-- TEST: Verify CASCADE DELETE works properly
-- ============================================
-- This tests if deleting a question also deletes related data

-- Step 1: Check current counts BEFORE delete
SELECT 
  'BEFORE DELETE' as status,
  (SELECT COUNT(*) FROM questions WHERE created_by = auth.uid()) as total_questions,
  (SELECT COUNT(*) FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE created_by = auth.uid())) as total_options,
  (SELECT COUNT(*) FROM fillblank_answers WHERE question_id IN (SELECT id FROM questions WHERE created_by = auth.uid())) as total_fillblank_answers,
  (SELECT COUNT(*) FROM user_progress WHERE question_id IN (SELECT id FROM questions WHERE created_by = auth.uid())) as total_progress_records;

-- Step 2: Find a test question to delete (pick one you created)
-- Replace 'YOUR_QUESTION_ID_HERE' with an actual question ID from your questions
SELECT 
  q.id,
  q.question_text,
  q.question_type,
  (SELECT COUNT(*) FROM question_options WHERE question_id = q.id) as option_count,
  (SELECT COUNT(*) FROM fillblank_answers WHERE question_id = q.id) as fillblank_count,
  (SELECT COUNT(*) FROM user_progress WHERE question_id = q.id) as progress_count
FROM questions q
WHERE q.created_by = auth.uid()
LIMIT 1;

-- Step 3: After running the app delete, check counts AFTER delete
-- Run this AFTER you delete a question through the UI
SELECT 
  'AFTER DELETE' as status,
  (SELECT COUNT(*) FROM questions WHERE created_by = auth.uid()) as total_questions,
  (SELECT COUNT(*) FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE created_by = auth.uid())) as total_options,
  (SELECT COUNT(*) FROM fillblank_answers WHERE question_id IN (SELECT id FROM questions WHERE created_by = auth.uid())) as total_fillblank_answers,
  (SELECT COUNT(*) FROM user_progress WHERE question_id IN (SELECT id FROM questions WHERE created_by = auth.uid())) as total_progress_records;

-- ============================================
-- IMPORTANT: Check if RLS is blocking CASCADE
-- ============================================
-- If CASCADE delete is being blocked by RLS, we need to check the policies

-- Check DELETE policies on related tables
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('question_options', 'fillblank_answers', 'user_progress')
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;

-- ============================================
-- EXPECTED BEHAVIOR:
-- ============================================
-- When you delete a question:
-- 1. The question row is deleted from 'questions' table
-- 2. CASCADE automatically deletes related rows from:
--    - question_options (all MCQ options for that question)
--    - fillblank_answers (all accepted answers for that question)
--    - user_progress (all student progress for that question)
--
-- If CASCADE is not working, it's likely because:
-- - RLS policies on child tables are blocking the cascade
-- - We need to add DELETE policies to those tables too
