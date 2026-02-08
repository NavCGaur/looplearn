# Supabase Error Logging Fix

## Problem
The application was showing empty error objects `{}` in the console when Supabase queries failed. This made debugging impossible because we couldn't see what was actually wrong.

Example errors:
- `Error loading questions: {}`
- `Leaderboard error: {}`

## Root Cause
Supabase's PostgrestError objects don't serialize well with standard `console.error()` or `console.log()`. When you try to log them directly, you get an empty object because the error properties are not enumerable.

## Solution
Created utility functions to properly extract and log error details:

### Server-Side: `src/lib/utils/error-logger.ts`
```typescript
import { logSupabaseError } from '@/lib/utils/error-logger'

// Usage:
logSupabaseError('Context message', error)
```

### Client-Side: `src/lib/utils/client-error-logger.ts`
```typescript
import { logError } from '@/lib/utils/client-error-logger'

// Usage:
logError('Context message', error)
```

## Files Updated
1. **Server Actions:**
   - `src/app/actions/quiz.ts` - Question loading errors
   - `src/app/actions/leaderboard.ts` - Leaderboard errors
   - `src/app/actions/bank.ts` - Question bank errors

2. **Client Components:**
   - `src/components/guest/guest-quiz-setup.tsx` - Metadata loading errors
   - `src/components/quiz/quiz-client.tsx` - Quiz state errors

## What to Look For Now
With the improved error logging, you should now see detailed error information including:
- `message`: Human-readable error message
- `code`: Supabase error code (e.g., "PGRST116" for table not found)
- `details`: Additional error details
- `hint`: Supabase's suggestion for fixing the error

## Common Error Codes
- **PGRST116**: Relation (table/view) does not exist
  - Solution: Run migrations or create the missing table/view
- **42501**: Insufficient privileges
  - Solution: Check RLS policies or database permissions
- **42P01**: Undefined table
  - Solution: Ensure migrations have been run

## Next Steps
1. Check the browser console and terminal for the new detailed error messages
2. Look for the specific error code and message
3. Common issues to check:
   - Is the `leaderboard_cache` materialized view created?
   - Are there questions in the database?
   - Are RLS policies configured correctly?
   - Is the Supabase connection working?

## Testing
To test if the error logging is working:
1. Refresh the page or navigate to the quiz setup
2. Check the browser console (F12) for detailed error messages
3. Check the terminal running `npm run dev` for server-side errors
