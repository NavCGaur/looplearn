# Supabase Database Setup Guide

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

## Step 2: Update Environment Variables
Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Run Schema Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Run the SQL script
4. Verify tables are created in Table Editor

## Step 4: Load Sample Data (Optional)
Run `supabase/seed.sql` to populate with sample questions

## Step 5: Set up Leaderboard Refresh (Optional)
For production, set up a cron job to refresh leaderboard:
```sql
-- Using pg_cron extension (enable in Supabase Dashboard → Database → Extensions)
SELECT cron.schedule(
  'refresh-leaderboard',
  '0 * * * *',  -- Every hour
  $$SELECT refresh_leaderboard()$$
);
```

## Verification Checklist
- [ ] All 6 tables created (profiles, questions, question_options, fillblank_answers, user_progress, leaderboard_cache)
- [ ] RLS policies enabled on all tables
- [ ] Indexes created successfully
- [ ] Trigger `on_auth_user_created` exists
- [ ] Can create a test user via Supabase Auth

## Testing the Setup
1. Create a test user in Supabase Dashboard → Authentication
2. Check that a profile was auto-created in `profiles` table
3. Insert a sample question
4. Verify RLS: Try querying as the test user

## Common Issues
- **RLS blocking queries**: Make sure you're authenticated when testing
- **Trigger not firing**: Check function exists and trigger is enabled
- **Leaderboard empty**: Run `SELECT refresh_leaderboard();` manually
