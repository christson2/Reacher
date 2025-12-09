# Railway Deployment Action Plan

## Phase 1: Pre-Deployment Setup (Estimated: 20 minutes)

### Step 1.1: Create Supabase Project

**What to do:**
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub or email
4. Click "New Project"
5. Enter project details:
   - Name: `reacher-mvp` (or your choice)
   - Database Password: Generate and SAVE a strong password
   - Region: Choose closest to your users
6. Wait 1-2 minutes for setup

**What to save:**
```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
```
(Get these from Supabase Settings → API)

---

### Step 1.2: Initialize Database Schema

**What to do:**
1. In Supabase, go to "SQL Editor"
2. Click "New Query"
3. Copy entire contents of: `db/supabase-schema.sql`
4. Paste into the editor
5. Click "Run"
6. Wait ~5 seconds for completion

**What to verify:**
```sql
-- Run in SQL Editor:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected tables: users, profiles, products, providers, reviews, trust_scores, conversations, messages, notifications

---

### Step 1.3: Get Database Connection Details

**In Supabase, go to Settings → Database:**
```
DB_HOST = postgres.xxxxx.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = [the password you set]
```

**Build connection string:**
```
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.xxxxx.supabase.co:5432/postgres?sslmode=require
```

---

### Step 1.4: Generate JWT Secret

Run in terminal or use online generator:
```bash
openssl rand -base64 32
```

Save this value as `JWT_SECRET`

---

## Phase 2: Railway Setup (Estimated: 10 minutes)

### Step 2.1: Create Railway Account & Project

**What to do:**
1. Go to https://railway.app
2. Click "Start Project"
3. Sign in with GitHub
4. Click "New Project"
5. Select "Deploy from GitHub"
6. Select your Reacher-MVP repository
7. Railway will start deployment

**Save your project URL:**
```
https://YOUR_PROJECT_NAME.railway.app
```

---

### Step 2.2: Add Environment Variables to Railway

**In Railway Dashboard:**
1. Click "Settings" (top right)
2. Go to "Variables" tab
3. Add these variables (you collected them earlier):

```
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.xxxxx.supabase.co:5432/postgres?sslmode=require

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Authentication
JWT_SECRET=YOUR_GENERATED_SECRET
JWT_EXPIRY=24h

# Environment
NODE_ENV=production

# Service Ports (Railway auto-assigns, but set these)
AUTH_SERVICE_PORT=8001
USER_SERVICE_PORT=8002
PRODUCT_SERVICE_PORT=8003
PROVIDER_SERVICE_PORT=8004
TRUST_SERVICE_PORT=8005
MESSAGE_SERVICE_PORT=8006
NOTIFICATION_SERVICE_PORT=8007
GATEWAY_PORT=8000

# API Configuration
NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app
FRONTEND_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app
```

---

## Phase 3: Deploy Microservices (Estimated: 30-40 minutes)

Each service takes 3-5 minutes to deploy.

### Step 3.1: Deploy Auth Service

**In Railway Dashboard:**
1. Click "Add Service"
2. Select "From GitHub" → your Reacher-MVP repo
3. Select root/source path: `backend/auth-service`
4. Set environment variables (if not inherited from project):
   - Ensure `JWT_SECRET` is set
   - Ensure `DATABASE_URL` is set
5. Click "Deploy"
6. Wait for "Running" status (check Logs if needed)

**Test it:**
```bash
# Get the deployed URL from Railway
curl https://YOUR_RAILWAY_DOMAIN/auth/health
# Should return: {"status":"ok","service":"auth-service"}
```

### Step 3.2: Deploy User Service

**In Railway Dashboard:**
1. Click "Add Service" → "From GitHub"
2. Path: `backend/user-service`
3. Deploy
4. Wait for "Running" status

---

### Step 3.3-3.7: Deploy Remaining Services

Repeat for each (takes ~3-5 min each):
- Product Service: `backend/product-service`
- Provider Service: `backend/provider-service`
- Trust Service: `backend/trust-service`
- Message Service: `backend/message-service`
- Notification Service: `backend/notification-service`

---

## Phase 4: Deploy Frontend (Estimated: 15 minutes)

### Option A: Deploy to Vercel (Recommended)

**Why:** Better performance for Next.js, automatic deployment on git push

**What to do:**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Select "Import from GitHub"
4. Choose Reacher-MVP repo
5. Set root directory: `frontend`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app
   ```
7. Click "Deploy"
8. Wait 2-3 minutes for deployment

**Your frontend is now at:** `https://YOUR_PROJECT_NAME.vercel.app`

### Option B: Deploy to Railway (Alternative)

**What to do:**
1. In Railway, click "Add Service" → "From GitHub"
2. Path: `frontend`
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Set PORT: `3000`
6. Deploy

---

## Phase 5: Verify Everything Works (Estimated: 10 minutes)

### Step 5.1: Health Checks

Test each service is running:
```bash
# Auth
curl https://YOUR_RAILWAY_DOMAIN/auth/health

# User
curl https://YOUR_RAILWAY_DOMAIN/user/health

# Product
curl https://YOUR_RAILWAY_DOMAIN/product/health

# Other services...
# Should all return: {"status":"ok","service":"XXX-service"}
```

### Step 5.2: Test Authentication Flow

```bash
curl -X POST https://YOUR_RAILWAY_DOMAIN/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

Expected response: `{"success":true,"message":"User registered...","data":{"user_id":"...","email":"..."}}`

### Step 5.3: Test Frontend

Open in browser: `https://YOUR_VERCEL_DOMAIN` or `https://YOUR_RAILWAY_DOMAIN`

You should see the Reacher landing page!

---

## Phase 6: Custom Domain (Optional, Estimated: 10 minutes)

### If Using Custom Domain:

**In Railway:**
1. Go to your project
2. Click "Settings"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `api.reacher.app`)
5. Follow DNS configuration instructions
6. DNS propagates in 5-48 hours

**Update environment variables:**
```
NEXT_PUBLIC_API_URL=https://api.reacher.app
FRONTEND_URL=https://reacher.app
```

---

## Phase 7: Monitoring & Go-Live (Estimated: 5 minutes)

### Set Up Monitoring

**In Railway:**
1. Click on each service
2. Go to "Logs" tab
3. Watch for errors (should see none)
4. Monitor "Metrics" for CPU/Memory (should be normal)

### Check Supabase

1. Go to Supabase dashboard
2. Go to "SQL Editor"
3. Run: `SELECT COUNT(*) FROM users;`
4. Should match number of test users created

---

## Troubleshooting Guide

### Service Won't Deploy

**Error:** Deployment fails  
**Solution:**
1. Check Logs in Railway
2. Verify environment variables are set
3. Ensure Dockerfile exists
4. Check database connection string

### "Connection Refused"

**Error:** Services can't connect to database  
**Solution:**
1. Verify DATABASE_URL is set correctly
2. Check Supabase is online (https://status.supabase.com)
3. Ensure SSL mode is `require`
4. Verify hostname: `postgres.xxxxx.supabase.co` (not localhost!)

### 404 Errors

**Error:** Endpoints returning 404  
**Solution:**
1. Verify correct service is handling the route
2. Check API Gateway routing
3. Verify all 7 services are running

### Slow Response Times

**Error:** Requests taking >2 seconds  
**Solution:**
1. Check Supabase performance
2. Look for slow queries in Supabase Monitoring
3. Consider upgrading Supabase plan if needed

---

## Success Criteria

You've successfully deployed when:

✅ All 7 services show "Running" in Railway  
✅ Health checks return `{"status":"ok"}`  
✅ Can signup in browser  
✅ No errors in service logs  
✅ Response times < 1 second  
✅ Frontend loads at custom domain (if configured)  

---

## Next Steps After Deployment

1. **Monitor:** Watch logs for first hour
2. **Test:** Run complete signup → product creation flow
3. **Announce:** Tell beta users to check it out
4. **Iterate:** Gather feedback and plan features
5. **Scale:** Add more resources if needed

---

## Support & References

- **Railway Docs:** https://docs.railway.app
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Issues:** Create issue if stuck

---

**Estimated Total Time: 1.5 - 2 hours**

You're ready to deploy! Follow these steps in order and you'll be live. 🚀
