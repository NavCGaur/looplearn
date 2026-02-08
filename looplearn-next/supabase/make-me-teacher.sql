-- Run this in Supabase SQL Editor to make yourself a teacher
-- Replace with your email
UPDATE profiles
SET role = 'teacher'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@gmail.com');

-- Verify
SELECT * FROM profiles;
