# Railway Deployment Guide

## 📋 Overview
Deploy Reacher MVP to Railway (fastest production setup, free tier available).

**Time Required:** 15-20 minutes  
**Cost:** Free tier or ~$5-15/month for production

---

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click **"Start Project"**
3. Sign up with GitHub or email
4. Allow Railway to access your GitHub account

---

## Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Choose your repository: `christson2/Reacher-MVP`
4. Select branch: `main` or `master`

---

## Step 3: Configure Environment Variables

### 3.1 Set Secrets
In Railway dashboard, go to **Settings** → **Variables**:

```
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.xxxxx.supabase.co:5432/postgres?sslmode=require
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Auth
JWT_SECRET=your_random_secret_key
JWT_EXPIRY=24h

# Environment
NODE_ENV=production

# Ports
AUTH_SERVICE_PORT=8001
USER_SERVICE_PORT=8002
PRODUCT_SERVICE_PORT=8003
PROVIDER_SERVICE_PORT=8004
TRUST_SERVICE_PORT=8005
MESSAGE_SERVICE_PORT=8006
NOTIFICATION_SERVICE_PORT=8007
GATEWAY_PORT=8000

# API URLs
NEXT_PUBLIC_API_URL=https://your-railway-domain.up.railway.app
FRONTEND_URL=https://your-railway-domain.up.railway.app
```

---

## Step 4: Deploy Auth Service

### 4.1 Create Service
1. Click **"Add Service"**
2. Select **"Docker"**
3. Create `Dockerfile` in `backend/auth-service/`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 8001

CMD ["node", "src/index.js"]
```

4. Push to GitHub (commit and push)

### 4.2 Configure Service
In Railway:
1. Select **Auth Service** from project
2. Go to **Deployments** tab
3. Set **Build command**: `npm install`
4. Set **Start command**: `npm start`
5. Set **PORT environment variable** to `8001`

---

## Step 5: Deploy User Service

Repeat Step 4 for User Service:
1. Create `Dockerfile` in `backend/user-service/`
2. Change PORT to `8002`
3. Deploy

---

## Step 6: Deploy All Services

Repeat for:
- Product Service (PORT: 8003)
- Provider Service (PORT: 8004)
- Trust Service (PORT: 8005)
- Message Service (PORT: 8006)
- Notification Service (PORT: 8007)

---

## Step 7: Deploy Gateway

Create `gateway/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 8000

CMD ["node", "src/index.js"]
```

Configure:
- PORT: 8000
- Update service URLs to use Railway domains

---

## Step 8: Deploy Frontend (Next.js)

1. Create `vercel.json` in `frontend/` directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

2. Or deploy on Vercel separately:
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repo
   - Set environment variables
   - Deploy (1 click)

---

## Step 9: Configure Custom Domain

### Option A: Use Railway Domain
Railway provides free domains like: `reacher-mvp.up.railway.app`

### Option B: Use Custom Domain
1. In Railway, go to **Settings** → **Custom Domain**
2. Add your domain (e.g., `api.reacher.app`)
3. Follow DNS configuration instructions
4. Update environment variables with new domain

---

## Step 10: Verify Deployment

### Test Health Endpoints
```bash
# Auth Service
curl https://your-railway-domain.up.railway.app/health

# Product Service
curl https://your-railway-domain.up.railway.app/health
```

### Monitor Logs
1. In Railway dashboard, click on each service
2. Go to **Logs** tab
3. Watch for errors during startup

### Test Signup
```bash
curl -X POST https://your-railway-domain.up.railway.app/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

---

## Step 11: Enable Auto-Deployment

1. In Railway project settings
2. Enable **GitHub Integration**
3. Select **Auto-deploy on push to main**
4. Now, every git push auto-deploys!

---

## Step 12: Monitor Performance

### Railway Metrics
1. Click on each service in dashboard
2. View **Metrics** tab:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Set Up Alerts
1. Go to **Settings** → **Alerts**
2. Create alert for:
   - High memory usage (>500MB)
   - High CPU usage (>80%)
   - Deployment failures
   - High error rate (>5%)

---

## Step 13: Set Up Database Backups

### Automatic Backups (via Supabase)
1. Log in to Supabase
2. Go to **Settings** → **Backups**
3. Enable **Automated backups**
4. Choose retention: 7 or 30 days

### Manual Backup
```bash
# In Railway terminal or local:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Service Won't Start
**Check logs:**
1. Go to service → **Logs** tab
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Wrong database URL
   - Port already in use

**Fix:**
- Update variables in Railway dashboard
- Re-deploy: Click **Redeploy** button
- Check 2-3 minutes for auto-restart

### Database Connection Error
**Error:** `ECONNREFUSED`

**Solution:**
1. Verify DATABASE_URL is set correctly
2. Check Supabase credentials are correct
3. Ensure postgres.*.supabase.co is used, not localhost

### Deployment Timeout
**Issue:** Build takes too long

**Fix:**
1. Optimize package.json (remove unused dependencies)
2. Use `npm ci --only=production` (not `npm install`)
3. Consider using Docker image layer caching

### Memory Issues
**Error:** `SIGKILL` or service crashes

**Fix:**
1. Upgrade Railway plan (more RAM)
2. Optimize Node.js: `NODE_OPTIONS=--max-old-space-size=256`
3. Clear logs/cache: Re-deploy

---

## Useful Railway Commands

```bash
# View logs (if SSH access enabled)
railway logs

# Restart service
railway restart

# View status
railway status

# Redeploy
railway up
```

---

## Production Checklist

- [ ] All 7 services deployed
- [ ] Environment variables configured
- [ ] Database connected and schema created
- [ ] Health checks passing (all 7 endpoints)
- [ ] Test signup/login working
- [ ] Test product creation/search
- [ ] Frontend connected to API
- [ ] Custom domain configured
- [ ] SSL/HTTPS enabled (automatic)
- [ ] Monitoring/alerts set up
- [ ] Backups configured
- [ ] Error logging enabled (Sentry if needed)
- [ ] Performance optimized
- [ ] Security policies reviewed

---

## Costs

**Railway Pricing (as of Dec 2024):**
- Free tier: $5 credit/month
- Pay-as-you-go: ~$0.001/hour per CPU/GB
- Typical MVP cost: $5-15/month

**Supabase Pricing:**
- Free tier: Sufficient for MVP
- Pro: $25/month for production workloads

**Total Cost:** $5-25/month for production

---

## Next Steps

1. ✅ Set up Supabase (if not done)
2. ✅ Create Railway account
3. ✅ Deploy all services
4. ✅ Configure custom domain
5. ✅ Update frontend API URL
6. ✅ Test production flow
7. ✅ Monitor for 24 hours
8. ✅ Announce to beta users!

---

## Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Railway Status:** https://status.railway.app

---

**You're now running on production!** 🚀
