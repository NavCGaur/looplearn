# LoopLearn - Quick Start Guide

## 🚀 Current Status
✅ Next.js 16 app initialized  
✅ All components built  
✅ Dev server running at http://localhost:3000  
⚠️ **Needs Supabase setup to be fully functional**

## 📋 Setup Steps

### 1. Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - **Name**: LoopLearnX
   - **Database Password**: Nayansh@2014
   - **Region**: Choose closest to you
4. Wait for project to initialize (~2 minutes)

### 2. Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click **Run**
5. Verify: Go to **Table Editor** → You should see 6 tables

### 3. Add Sample Data (Optional)

1. In SQL Editor, create new query
2. Copy contents of `supabase/seed.sql`
3. Run it
4. Verify: Check `questions` table has 6 sample questions

### 4. Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long JWT token)

### 5. Update Environment Variables

Edit `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

Save the file. Next.js will auto-restart.

### 6. Test the App

1. Visit http://localhost:3000
2. Click **"Try as Guest"**
3. Take a quiz!
4. Sign up to test persistent progress

## 🎯 What Works Right Now

### Without Supabase (Current State):
- ✅ Landing page loads
- ✅ UI components render
- ❌ Quiz won't load (no database)
- ❌ Auth won't work

### With Supabase:
- ✅ Full quiz functionality
- ✅ Guest mode (no signup required)
- ✅ User signup/login
- ✅ Progress tracking with SM-2
- ✅ Points system
- ✅ Fuzzy answer matching

## 🐛 Troubleshooting

**"Invalid supabaseUrl" error**:
- Make sure `.env.local` has valid URL format
- Restart dev server: `Ctrl+C` then `npm run dev`

**Quiz shows "No questions available"**:
- Run `supabase/seed.sql` to add sample questions
- Or create questions manually in Supabase Table Editor

**Auth not working**:
- Check Supabase → Authentication → Providers
- Email provider should be enabled by default

## 📁 Project Structure

```
looplearn-next/
├── supabase/
│   ├── schema.sql       ← Run this first
│   ├── seed.sql         ← Run this second
│   └── README.md        ← Detailed setup
├── src/
│   ├── app/
│   │   ├── page.tsx            ← Landing page
│   │   ├── quiz/page.tsx       ← Quiz page
│   │   ├── auth/               ← Login/Signup
│   │   └── actions/            ← Server Actions
│   ├── components/
│   │   ├── quiz/               ← Quiz UI components
│   │   └── ui/                 ← Shared components
│   ├── lib/
│   │   ├── supabase/           ← DB clients
│   │   ├── srs/algorithm.ts    ← SM-2 logic
│   │   └── utils/              ← Helpers
│   └── types/database.ts       ← TypeScript types
└── .env.local                  ← Your credentials
```

## 🎨 Features Implemented

- [x] Database schema (6 tables + materialized view)
- [x] Authentication (email/password)
- [x] Role-based access (Student/Teacher)
- [x] Quiz engine (MCQ + Fill-in-blank)
- [x] Spaced repetition (SM-2 algorithm)
- [x] Fuzzy answer matching (typo tolerance)
- [x] Formula rendering (LaTeX support)
- [x] Points system
- [x] Guest mode
- [x] Confetti celebrations

## 🔜 Next Steps (Optional)

1. **Dashboard** - User stats and progress charts
2. **Leaderboard** - Global and class rankings
3. **Streak Tracking** - Daily login rewards
4. **Teacher Portal** - Upload questions
5. **PWA** - Offline support
6. **Analytics** - GA4 integration

## 💡 Tips

- **Guest users** can take unlimited quizzes but progress isn't saved
- **Registered users** get spaced repetition and leaderboard access
- Questions adapt based on user's class standard
- Fuzzy matching accepts minor spelling mistakes

---

Need help? Check `supabase/README.md` for detailed database setup instructions.
