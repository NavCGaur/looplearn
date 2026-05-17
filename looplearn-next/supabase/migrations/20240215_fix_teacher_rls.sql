-- ==========================================
-- Fix Teacher RLS Policies
-- ==========================================

-- 1. Allow teachers to view ALL questions
-- (Previously they might have been restricted to only questions they created or no questions at all for SELECT)
DROP POLICY IF EXISTS "Teachers view all questions" ON questions;

CREATE POLICY "Teachers view all questions"
ON questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

-- 2. Ensure quiz_logs has RLS enabled and policies set
ALTER TABLE quiz_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own logs
DROP POLICY IF EXISTS "Users insert own logs" ON quiz_logs;

CREATE POLICY "Users insert own logs"
ON quiz_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own logs
DROP POLICY IF EXISTS "Users view own logs" ON quiz_logs;

CREATE POLICY "Users view own logs"
ON quiz_logs FOR SELECT
USING (auth.uid() = user_id);

-- Allow teachers/admins to view ALL logs
DROP POLICY IF EXISTS "Teachers view all logs" ON quiz_logs;

CREATE POLICY "Teachers view all logs"
ON quiz_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  )
);
