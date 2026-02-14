-- ============================================
-- DIAGNOSTIC: Check RLS policies on questions table
-- ============================================
-- Run this to see what policies exist

-- 1. Check all policies on questions table
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'questions'
ORDER BY cmd;

-- 2. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'questions';

-- 3. Check a sample question to see who created it
SELECT 
  id,
  question_text,
  created_by,
  created_at
FROM questions
LIMIT 5;

-- 4. Check current user info
SELECT 
  auth.uid() as current_user_id,
  p.role as current_user_role
FROM profiles p
WHERE p.id = auth.uid();

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- You should see these policies:
-- - SELECT policy (for students)
-- - INSERT policy (for teachers)
-- - UPDATE policy (for teachers)
-- - DELETE policy (for teachers) <- THIS IS CRITICAL
--
-- If DELETE policy is missing, run: add-delete-policy.sql
