# Google OAuth Setup Guide for Supabase

## Step 1: Enable Google Provider in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON**
5. You'll see two fields:
   - **Client ID** (from Google)
   - **Client Secret** (from Google)

## Step 2: Create Google OAuth Credentials

### A. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Name it: "LoopLearn" (or your preferred name)

### B. Enable Google+ API
1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

### C. Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: **LoopLearn**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Skip (click **Save and Continue**)
   - Test users: Skip (click **Save and Continue**)

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **LoopLearn Web Client**
   
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-supabase-project-url.supabase.co
   ```

6. **Authorized redirect URIs:**
   ```
   https://your-supabase-project-url.supabase.co/auth/v1/callback
   ```
   
   Replace `your-supabase-project-url` with your actual Supabase project URL
   (Example: `https://abcdefghijk.supabase.co/auth/v1/callback`)

7. Click **CREATE**

8. Copy the **Client ID** and **Client Secret**

## Step 3: Add Credentials to Supabase

1. Go back to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste:
   - **Client ID**: (from Google)
   - **Client Secret**: (from Google)
3. Click **Save**

## Step 4: Get Your Redirect URL

In Supabase, you'll see a **Callback URL (for OAuth)**. It looks like:
```
https://your-project.supabase.co/auth/v1/callback
```

Make sure this EXACT URL is in your Google OAuth **Authorized redirect URIs**.

## Step 5: Test

Once configured, users can sign in with Google! The app code is already set up to handle it.

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Make sure the redirect URI in Google Console EXACTLY matches the Supabase callback URL
- Include the `/auth/v1/callback` path
- Use `https://` (not `http://`)

**Error: "Access blocked"**
- Add your email as a test user in Google Cloud Console
- Or publish your OAuth consent screen (requires verification for production)

## For Production

When deploying to production (e.g., Vercel):
1. Add your production domain to Google OAuth:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Keep the same Supabase callback URL
2. No code changes needed!
