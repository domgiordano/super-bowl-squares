# Quick Start Guide

Get your Super Bowl Squares app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Cloud account (for OAuth)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Visit [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Name it "super-bowl-squares"
4. Choose a region and create

### 3. Get Supabase Credentials

1. Go to Settings > API in your Supabase project
2. Copy the **Project URL** and **anon public key**

### 4. Setup Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Configure Google OAuth

**In Google Cloud Console:**
1. Create a new project
2. Go to APIs & Services > Credentials
3. Create OAuth 2.0 Client ID
4. Add redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret

**In Supabase:**
1. Go to Authentication > Providers
2. Enable Google
3. Paste Client ID and Secret
4. Save

### 6. Run Database Migrations

**Option 1 - Using Supabase CLI:**
```bash
# Install Supabase CLI (macOS)
brew install supabase/tap/supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

**Option 2 - Manual SQL:**
1. Open Supabase Dashboard > SQL Editor
2. Copy content from each file in `supabase/migrations/`
3. Run them in order (001, 002, 003, 004)

### 7. Enable Realtime

In Supabase Dashboard:
1. Go to Database > Replication
2. Enable realtime for these tables:
   - ✅ squares
   - ✅ games
   - ✅ presence

### 8. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Test It Out

1. **Sign In**: Click "Continue with Google"
2. **Create Group**: Click "Create Group"
3. **Invite Friend**: Copy the invite link
4. **Create Game**: Click "Create Game" in your group
5. **Open Game**: Click "Open for Selection"
6. **Claim Square**: Click any square to claim it
7. **Randomize**: Click "Randomize Numbers & Lock"

## Common Issues

### "Invalid login credentials"
- Make sure Google OAuth is configured in Supabase
- Check that redirect URI matches exactly

### "relation does not exist"
- Run all database migrations
- Check SQL Editor for errors

### Squares don't update in real-time
- Enable realtime on `squares` table
- Check browser console for errors

## What's Next?

- Deploy to Vercel: `vercel deploy`
- Add custom styling
- Invite friends to test
- Set up payment integration

## Need Help?

- 📖 [Full Setup Guide](SETUP_GUIDE.md)
- 📚 [README](README.md)
- 🎯 [Project Summary](PROJECT_SUMMARY.md)

---

**Total Setup Time:** ~15 minutes (including Supabase/Google setup)

Good luck with your Super Bowl pool! 🏈
