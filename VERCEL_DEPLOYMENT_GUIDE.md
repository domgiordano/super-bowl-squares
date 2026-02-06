# Vercel Deployment Guide

## 1. Environment Variables (Required)

Add these in your Vercel project settings (Settings → Environment Variables):

### **Supabase Configuration** (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these:**
- Go to your Supabase project dashboard
- Click "Settings" → "API"
- Copy the Project URL, anon/public key, and service_role key

### **SportsRadar API** (Required for live scores)
```
SPORTRADAR_API_KEY=your-sportradar-api-key
```

**Where to get this:**
- Sign up at https://developer.sportradar.com/
- Get a trial or paid API key for NFL stats

### **App URL** (Optional - only needed if you enable cron jobs later)
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 2. Supabase OAuth Redirect URLs (Required)

Add your Vercel deployment URL to Supabase's allowed redirect URLs:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add these URLs to "Redirect URLs":
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/*
   ```
3. Add to "Site URL":
   ```
   https://your-app.vercel.app
   ```

**Important:** Replace `your-app.vercel.app` with your actual Vercel domain.

---

## 3. Google Cloud Console OAuth Setup (Required)

Update your Google OAuth credentials to allow sign-in from your production domain:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   ```
   https://your-app.vercel.app
   ```
6. Under **Authorized redirect URIs**, add:
   ```
   https://<your-supabase-project-id>.supabase.co/auth/v1/callback
   ```

   **How to find your Supabase project ID:**
   - Your Supabase URL looks like: `https://abcdefghijklmnop.supabase.co`
   - The project ID is: `abcdefghijklmnop`

7. Click **Save**

**Important Notes:**
- The redirect URI goes to Supabase, NOT your Vercel app
- Supabase handles the OAuth flow and then redirects to your app
- Make sure to keep your localhost URIs for local development

---

## 4. Deploy to Vercel

### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to link/create project
```

### Option B: Via Git Integration
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Add environment variables (see section 1)
6. Click "Deploy"

---

## 5. After First Deployment

### Update Supabase with Production URL
Once deployed, update Supabase redirect URLs with your production domain:
```
https://your-actual-domain.vercel.app/auth/callback
```

### Test Authentication
1. Visit your deployed app
2. Try signing in with Google
3. Verify you're redirected back to the dashboard

### Test Score Updates
1. Create a game as admin
2. Click "Refresh" button in ScoreBoard
3. Verify scores update (during actual game time)

---

## 6. Database Migrations

Your Supabase database should already have all migrations applied from local development. If not:

```bash
# Link to production Supabase project
npx supabase link --project-ref your-production-project-ref

# Push migrations
npx supabase db push
```

---

## 7. Optional: Enable Automatic Score Updates (Pro Plan Only)

If you upgrade to Vercel Pro ($20/month), you can enable automatic score updates every 30 minutes:

1. Rename `vercel.json.pro-plan-only` to `vercel.json`
2. Add these environment variables:
   ```
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   CRON_SECRET=your-random-secret-string
   ```
3. Redeploy

---

## 8. Vercel Project Settings

### Recommended Settings:
- **Framework Preset**: Next.js
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node Version**: 18.x or higher

### Performance:
- **Edge Functions**: Not needed for this app
- **ISR**: Already configured via `revalidate` in data fetching

---

## 9. Custom Domain (Optional)

If you want to use your own domain:

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs to use custom domain

---

## 10. Troubleshooting

### "Error: Invalid redirect URL"
- Check Supabase redirect URLs include your Vercel domain
- Make sure to include `/auth/callback` path

### "Error: Invalid credentials"
- Verify all environment variables are set in Vercel
- Check for typos in keys

### "Score refresh not working"
- Verify SPORTRADAR_API_KEY is set
- Check API key is valid and has credits
- View Vercel logs (project → Deployments → click deployment → Runtime Logs)

### "Database connection failed"
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check Supabase project is not paused (free tier pauses after inactivity)

---

## 11. Monitoring

### View Logs:
- Vercel Dashboard → Your Project → Deployments
- Click on a deployment → "Runtime Logs" tab
- Filter by errors to debug issues

### Check Database:
- Supabase Dashboard → Database → SQL Editor
- Run queries to verify data is being created correctly

---

## Summary Checklist

- [ ] Set all environment variables in Vercel
- [ ] Update Supabase OAuth redirect URLs
- [ ] Deploy to Vercel
- [ ] Test Google authentication
- [ ] Test creating a group
- [ ] Test joining a group
- [ ] Test claiming squares
- [ ] Test score refresh button
- [ ] Verify payment tracking works
- [ ] (Optional) Add custom domain
- [ ] (Optional) Enable automatic score updates (Pro plan)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- SportsRadar Docs: https://developer.sportradar.com/
