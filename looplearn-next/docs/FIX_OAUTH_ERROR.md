# Fix Google OAuth Error - Action Required

## 🔴 Error You're Seeing
```
Database error saving new user
```

This happens because the database trigger is trying to auto-create a profile for Google users, but it's failing.

## ✅ Solution

### Step 1: Fix the Database Trigger

1. Open Supabase Dashboard → **SQL Editor**
2. Copy the contents of `supabase/fix-oauth-trigger.sql`
3. Run it
4. This will update the trigger to NOT auto-create profiles for OAuth users

### Step 2: Test Google Login

1. Go to http://localhost:3000/auth/login
2. Click "Continue with Google"
3. Select your Google account
4. You should be redirected to `/auth/complete-profile`
5. Select your role (Student/Teacher) and class
6. Click "Complete Setup"
7. You should be redirected to `/quiz`

### Step 3: Verify in Database

Check Supabase → Table Editor → `profiles`
- Your Google user should now have a profile with the role and class you selected

## 🎯 What Changed

### Frontend (Simplified)
- ✅ **Login page**: Only Google button + Guest access
- ✅ **Signup page**: Only Google button
- ❌ **Removed**: Email/password forms

### Backend
- ✅ **Kept**: `getUser()`, `signOut()`
- ✅ **Kept**: `signInWithGoogle()` (OAuth action)
- ❌ **Removed**: `signUp()`, `signIn()` (email/password)

### Database
- ✅ **Updated**: `handle_new_user()` trigger
  - Now skips OAuth users
  - Only creates profiles for email/password users (if any exist)
  - OAuth users create profiles via `/auth/complete-profile`

## 🧪 Testing Checklist

- [ ] Run `supabase/fix-oauth-trigger.sql` in Supabase
- [ ] Clear browser cookies/cache
- [ ] Visit http://localhost:3000/auth/login
- [ ] Click "Continue with Google"
- [ ] Complete profile setup
- [ ] Take a quiz
- [ ] Check profile in Supabase database

## 🚨 If Still Getting Errors

1. **Check Supabase Logs**:
   - Dashboard → Logs → Auth
   - Look for detailed error messages

2. **Verify Google OAuth Setup**:
   - Redirect URI must be: `https://ehuebdfnhqmscbyjtzzo.supabase.co/auth/v1/callback`
   - Client ID and Secret must be correct

3. **Check RLS Policies**:
   - Make sure profiles table allows INSERT for authenticated users

## 📝 Files Modified

- `src/app/auth/login/page.tsx` - Simplified (Google only)
- `src/app/auth/signup/page.tsx` - Simplified (Google only)
- `src/app/actions/auth.ts` - Removed email/password functions
- `supabase/fix-oauth-trigger.sql` - Fixed trigger for OAuth

---

**Next Step**: Run the SQL fix and try Google login again! 🚀
