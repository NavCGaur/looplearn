-- ===========================================================
-- Fix: Re-apply RLS policies for guest tracking tables
-- Run this in the Supabase SQL editor
-- ===========================================================

-- Drop existing policies in case they exist but are broken
DROP POLICY IF EXISTS "Allow anonymous inserts into guest_sessions" ON public.guest_sessions;
DROP POLICY IF EXISTS "Allow reading own converted sessions" ON public.guest_sessions;
DROP POLICY IF EXISTS "Allow anonymous inserts into guest_quiz_logs" ON public.guest_quiz_logs;

-- Ensure RLS is enabled on both tables
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_quiz_logs ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (unauthenticated/anon) to INSERT into guest_sessions
CREATE POLICY "Allow anonymous inserts into guest_sessions"
    ON public.guest_sessions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow authenticated users to read their own converted sessions
CREATE POLICY "Allow reading own converted sessions"
    ON public.guest_sessions
    FOR SELECT
    USING (auth.uid() = converted_to_user_id);

-- Allow ANYONE to INSERT into guest_quiz_logs
CREATE POLICY "Allow anonymous inserts into guest_quiz_logs"
    ON public.guest_quiz_logs
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Verify (should show both policies listed)
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('guest_sessions', 'guest_quiz_logs')
ORDER BY tablename, cmd;
