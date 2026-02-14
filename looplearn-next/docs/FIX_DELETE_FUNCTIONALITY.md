# Fix for Question Delete Functionality

## Problem
The delete functionality for teachers in `/teacher/questions` was not working. Questions were not being deleted from the database.

## Root Cause
The `questions` table had Row Level Security (RLS) enabled but was **missing a DELETE policy**. The schema only had:
- SELECT policy (for students to read questions)
- INSERT policy (for teachers to create questions)
- UPDATE policy (for teachers to update questions)
- ❌ **NO DELETE policy**

Without a DELETE policy, even though the application code was trying to delete questions, the database was rejecting the delete operations due to RLS.

## Solution

### 1. Added DELETE Policy (SQL Migration Required)
Run the SQL migration file: `supabase/add-delete-policy.sql`

This adds a DELETE policy that allows:
- Teachers to delete their own questions
- Admins to delete any questions

### 2. Improved Server Action (`src/app/actions/bank.ts`)
Enhanced the `deleteQuestions` function to:
- Verify user is a teacher/admin before attempting delete
- Return the count of deleted questions
- Provide better error messages
- Document that CASCADE delete handles related data

### 3. Better Error Handling (`src/components/teacher/question-bank-table.tsx`)
Improved the client-side delete handler to:
- Show detailed confirmation dialog explaining what will be deleted
- Display success message with count of deleted questions
- Show specific error messages instead of generic "Failed to delete"
- Log errors to console for debugging

## Database CASCADE Behavior
The database schema already has CASCADE DELETE configured for:
- `question_options` (MCQ answer options)
- `fillblank_answers` (Fill-in-the-blank accepted answers)
- `user_progress` (Student progress/SRS data)

When a question is deleted, all related data in these tables is **automatically deleted** by the database.

## How to Apply the Fix

### Step 1: Run the SQL Migration
Execute the SQL file in your Supabase SQL Editor:

\`\`\`bash
# Copy the contents of supabase/add-delete-policy.sql
# Paste into Supabase SQL Editor
# Run the query
\`\`\`

Or if you have Supabase CLI:

\`\`\`bash
supabase db execute --file supabase/add-delete-policy.sql
\`\`\`

### Step 2: Verify the Policy
After running the migration, verify the policy was created:

\`\`\`sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'questions';
\`\`\`

You should see a policy named "Teachers delete own questions" with cmd = 'DELETE'.

### Step 3: Test the Delete Functionality
1. Log in as a teacher
2. Go to `/teacher/questions`
3. Select one or more questions
4. Click the "Delete" button
5. Confirm the deletion
6. Verify the questions are deleted and the page refreshes

## Security Notes
- Teachers can only delete questions they created (`created_by = auth.uid()`)
- Admins can delete any questions
- The CASCADE delete ensures data integrity by removing all related records
- RLS policies prevent unauthorized deletions

## Files Modified
1. `src/app/actions/bank.ts` - Improved deleteQuestions function
2. `src/components/teacher/question-bank-table.tsx` - Better error handling
3. `supabase/add-delete-policy.sql` - New DELETE policy migration

## Testing Checklist
- [ ] SQL migration executed successfully
- [ ] DELETE policy visible in `pg_policies`
- [ ] Teachers can delete their own questions
- [ ] Admins can delete any questions
- [ ] Students cannot delete questions
- [ ] Related data (options, answers, progress) is deleted
- [ ] Success message shows correct count
- [ ] Error messages are helpful and specific
