-- Add last_active_at column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill last_active_at from quiz_logs (if available)
-- This tries to find the latest quiz log for each user and update their profile
UPDATE profiles
SET last_active_at = subquery.latest_log
FROM (
    SELECT user_id, MAX(created_at) as latest_log
    FROM quiz_logs
    GROUP BY user_id
) AS subquery
WHERE profiles.id = subquery.user_id;
