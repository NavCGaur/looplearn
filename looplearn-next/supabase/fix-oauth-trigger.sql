-- Fix the handle_new_user trigger to work with Google OAuth
-- Run this in Supabase SQL Editor

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function that handles Google OAuth users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile for email/password users (not OAuth)
  -- OAuth users will create their profile via the complete-profile page
  IF NEW.raw_app_meta_data->>'provider' = 'email' THEN
    INSERT INTO public.profiles (id, role, display_name)
    VALUES (
      NEW.id, 
      'student', 
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
