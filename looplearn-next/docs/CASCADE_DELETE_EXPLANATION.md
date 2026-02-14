# CASCADE DELETE and RLS Policies - Complete Explanation

## The Problem

You asked: **"Are related answers and options getting deleted too?"**

**Short Answer:** They SHOULD be, but they WON'T be until you add DELETE policies to ALL tables.

## Why CASCADE DELETE Wasn't Working

### The Database Schema Has CASCADE Rules ✅
```sql
-- question_options table
question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE

-- fillblank_answers table  
question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE

-- user_progress table
question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE
```

### BUT Row Level Security (RLS) Blocks It ❌

Here's what happens when you try to delete a question:

1. **You delete a question** → RLS checks: "Does this user have DELETE permission on questions?"
2. **PostgreSQL tries to CASCADE delete** → RLS checks: "Does this user have DELETE permission on question_options?"
3. **RLS says NO** → CASCADE delete is **BLOCKED**
4. **PostgreSQL aborts the entire operation** → Nothing gets deleted!

## The Solution

You need DELETE policies on **ALL 4 tables**:

### 1. `questions` table
- Teachers can delete their own questions
- Admins can delete any questions

### 2. `question_options` table  
- Allow deletion when the parent question is being deleted by its creator/admin

### 3. `fillblank_answers` table
- Allow deletion when the parent question is being deleted by its creator/admin

### 4. `user_progress` table
- Allow deletion when the parent question is being deleted by its creator/admin
- OR when users delete their own progress

## How to Fix It

### Run the Complete Migration

Execute `supabase/add-delete-policy.sql` in your Supabase SQL Editor.

This file now contains DELETE policies for **all 4 tables**.

### Verify It Worked

After running the migration, execute this query:

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE cmd = 'DELETE'
  AND tablename IN ('questions', 'question_options', 'fillblank_answers', 'user_progress')
ORDER BY tablename;
```

You should see **4 DELETE policies** (one for each table).

## What Happens After the Fix

When you delete a question:

```
1. DELETE FROM questions WHERE id = 'xxx'
   ✅ RLS checks: User created this question → ALLOWED
   
2. PostgreSQL CASCADE deletes from question_options
   ✅ RLS checks: User owns parent question → ALLOWED
   
3. PostgreSQL CASCADE deletes from fillblank_answers
   ✅ RLS checks: User owns parent question → ALLOWED
   
4. PostgreSQL CASCADE deletes from user_progress
   ✅ RLS checks: User owns parent question → ALLOWED
   
✅ SUCCESS: Question and ALL related data deleted!
```

## Testing the Fix

1. **Before Delete**: Run `test-cascade-delete.sql` to see current counts
2. **Delete a Question**: Use the UI to delete a question
3. **After Delete**: Run the query again to verify counts decreased

Example:
```
BEFORE:  10 questions, 40 options, 5 fillblank answers, 25 progress records
DELETE:  1 question (with 4 options, 0 fillblank, 3 progress)
AFTER:   9 questions, 36 options, 5 fillblank answers, 22 progress records
```

## Summary

- ✅ **Database has CASCADE rules** (defined in schema)
- ❌ **RLS was blocking CASCADE** (no DELETE policies)
- ✅ **Solution: Add DELETE policies to all tables**
- ✅ **Now CASCADE will work properly**

**You MUST run the updated `add-delete-policy.sql` file for this to work!**
