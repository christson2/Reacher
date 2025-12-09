# 🚀 RAILWAY DEPLOYMENT - START HERE

Welcome! You're about to deploy Reacher MVP to production. This is your starting point.

---

## 📖 What You'll Need

- GitHub account (to deploy from repo)
- Credit card (for Railway & Supabase - though free tiers suffice)
- 1.5-2 hours of uninterrupted time
- 4 terminals/browser windows open simultaneously

---

## 🎯 Three Simple Files to Guide You

I've created 3 files to make deployment super easy:

### 1️⃣ **RAILWAY_ENV_CHECKLIST.md**
   - Collect all Supabase credentials
   - Generate JWT secret
   - Track what you've gathered
   - **Do this first!**

### 2️⃣ **RAILWAY_DEPLOYMENT_ACTION_PLAN.md**
   - Step-by-step instructions for deployment
   - 7 phases with clear actions
   - Includes troubleshooting
   - **Follow this for detailed steps**

### 3️⃣ **RAILWAY_DEPLOYMENT_TRACKER.md**
   - Track your progress through each phase
   - Checkboxes for every task
   - Phase timelines
   - **Use this to stay organized**

---

## ⏱️ Timeline Overview

```
Phase 1: Supabase Setup         ~20 minutes
Phase 2: Railway Account        ~10 minutes
Phase 3: Deploy Services        ~35-45 minutes
Phase 4: Deploy Frontend        ~15 minutes
Phase 5: Verify Everything      ~10 minutes
─────────────────────────────────────────────
TOTAL TIME                       ~1.5-2 hours
```

---

## 🚀 Quick Start (Next 5 Minutes)

### Do This RIGHT NOW:

1. **Open RAILWAY_ENV_CHECKLIST.md** in your editor
   - This is your credentials gathering checklist
   
2. **Keep these 3 windows open:**
   - Supabase Dashboard (https://supabase.com)
   - Railway Dashboard (https://railway.app)
   - This guide (in text editor)

3. **Have these ready:**
   - GitHub login
   - Credit card (for account verification)
   - 30+ character password for Supabase

---

## 📋 Detailed Instructions Below

### STEP 1: Create Supabase Project (20 min)

**Open:** https://supabase.com

1. Click "Start your project"
2. Sign up/login with GitHub
3. Click "New Project"
4. Enter:
   - Name: `reacher-mvp`
   - Password: Generate strong one (SAVE IT!)
   - Region: Closest to your users
5. Wait 1-2 minutes for setup
6. Go to Settings → API
   - Copy: `SUPABASE_URL`
   - Copy: `SUPABASE_ANON_KEY`
   - Copy: `SUPABASE_SERVICE_ROLE_KEY`
7. Go to Settings → Database
   - Copy: `Host`, `Port`, `User`, `Password`
8. **Build DATABASE_URL:**
   ```
   postgresql://postgres:PASSWORD@HOST:5432/postgres?sslmode=require
   ```
9. Run database schema:
   - Go to SQL Editor
   - Copy all contents from: `db/supabase-schema.sql`
   - Paste into editor
   - Click "Run"
   - Wait for completion (~5 seconds)
10. **Record everything in RAILWAY_ENV_CHECKLIST.md**

✅ Phase 1 done! Mark in RAILWAY_DEPLOYMENT_TRACKER.md

---

### STEP 2: Create Railway Account (10 min)

**Open:** https://railway.app

1. Click "Start Project"
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub"
5. Select "christson2/Reacher-MVP"
6. Railway starts deployment

**Now add Environment Variables:**
1. Click "Settings" (top right)
2. Go to "Variables" tab
3. Add ALL these variables:

```
# From Supabase (Step 1)
DATABASE_URL = [your connection string]
SUPABASE_URL = [from API settings]
SUPABASE_ANON_KEY = [from API settings]
SUPABASE_SERVICE_ROLE_KEY = [from API settings]

# Generate new
JWT_SECRET = [run: openssl rand -base64 32]
JWT_EXPIRY = 24h

# Standard
NODE_ENV = production

# Service Ports
AUTH_SERVICE_PORT = 8001
USER_SERVICE_PORT = 8002
PRODUCT_SERVICE_PORT = 8003
PROVIDER_SERVICE_PORT = 8004
TRUST_SERVICE_PORT = 8005
MESSAGE_SERVICE_PORT = 8006
NOTIFICATION_SERVICE_PORT = 8007
GATEWAY_PORT = 8000

# API URLs (update with your Railway domain later)
NEXT_PUBLIC_API_URL = https://YOUR_PROJECT.up.railway.app
FRONTEND_URL = https://YOUR_PROJECT.up.railway.app
```

✅ Phase 2 done! Mark in RAILWAY_DEPLOYMENT_TRACKER.md

---

### STEP 3: Deploy 7 Services (35-45 min)

**For EACH service, in Railway:**

1. Click "Add Service"
2. Select "From GitHub"
3. Choose path: `backend/SERVICE-NAME`
4. Click "Deploy"
5. Wait for "Running" status (3-5 min each)

**Services in order:**
- `backend/auth-service` 
- `backend/user-service`
- `backend/product-service`
- `backend/provider-service`
- `backend/trust-service`
- `backend/message-service`
- `backend/notification-service`

**After each deploys, test:**
```bash
curl https://YOUR_RAILWAY_DOMAIN/auth/health
```

Should return: `{"status":"ok"}`

✅ Phase 3 done! Mark in RAILWAY_DEPLOYMENT_TRACKER.md

---

### STEP 4: Deploy Frontend (15 min)

**Option A: Vercel (Recommended)**

1. Go to https://vercel.com
2. Click "Add New Project"
3. "Import from GitHub" → Reacher-MVP
4. Set root directory: `frontend`
5. Add env var:
   ```
   NEXT_PUBLIC_API_URL = https://YOUR_RAILWAY_DOMAIN.up.railway.app
   ```
6. Click "Deploy"
7. Wait 2-3 minutes

**Your frontend is live at:** `https://YOUR_VERCEL_DOMAIN.vercel.app`

**Option B: Railway**
- Add service from `frontend/`
- Build command: `npm run build`
- Start command: `npm start`
- PORT: `3000`

✅ Phase 4 done! Mark in RAILWAY_DEPLOYMENT_TRACKER.md

---

### STEP 5: Verify Everything (10 min)

**Test all health endpoints:**

```bash
# Replace YOUR_DOMAIN with actual Railway domain
DOMAIN="https://YOUR_DOMAIN.up.railway.app"

curl $DOMAIN/auth/health     # Should be ✓
curl $DOMAIN/user/health     # Should be ✓
curl $DOMAIN/product/health  # Should be ✓
# ... etc for all 7 services
```

**Test signup:**
```bash
curl -X POST https://YOUR_DOMAIN/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

**Test in browser:**
- Go to: `https://YOUR_VERCEL_DOMAIN.vercel.app`
- Should see Reacher MVP landing page
- Should be able to click signup/login

✅ Phase 5 done! Mark in RAILWAY_DEPLOYMENT_TRACKER.md

---

## 🎉 SUCCESS!

If you made it here:
- ✅ All 7 services running
- ✅ Frontend deployed
- ✅ Database connected
- ✅ Authentication working
- ✅ **You're live! 🚀**

---

## 📝 Detailed Guide

For **step-by-step detailed instructions**, see:
→ `RAILWAY_DEPLOYMENT_ACTION_PLAN.md`

For **environment variable collection**, see:
→ `RAILWAY_ENV_CHECKLIST.md`

For **progress tracking**, see:
→ `RAILWAY_DEPLOYMENT_TRACKER.md`

---

## 🆘 If Something Goes Wrong

### Most Common Issues:

**1. "Connection refused" error**
- Check DATABASE_URL is correct
- Verify Supabase is online
- Ensure `postgres.XXXXX.supabase.co` not `localhost`

**2. Service won't deploy**
- Check logs in Railway
- Verify all env variables are set
- Ensure Dockerfile exists in service directory

**3. Frontend can't reach API**
- Check NEXT_PUBLIC_API_URL matches actual domain
- Verify all 7 services are running
- Check CORS is configured

**For more:** See RAILWAY_DEPLOYMENT_ACTION_PLAN.md → Troubleshooting

---

## 📞 Resources

- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- GitHub: https://github.com/christson2/Reacher-MVP

---

## ✨ You've Got This!

This deployment is straightforward and well-documented. Follow the steps above, and you'll be live in 1-2 hours.

**Remember:**
- Save all credentials securely
- Don't share JWT_SECRET
- Monitor logs for errors
- Test each service before moving on
- Have fun with your launch! 🎉

---

## 🚀 Next: Open RAILWAY_ENV_CHECKLIST.md and start collecting credentials!

Good luck! 🚀
