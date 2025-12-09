# 🚀 Railway Deployment - Action Plan

## Current Status (Dec 9, 2025)

### ✅ Fixed
- **Frontend** - Now has proper Next.js setup with package.json, config, and pages
- **Frontend Build** - Should now build successfully

### ⚠️ Still Failing  
- **Auth Service** - Build issue (will check logs)

---

## Step 1: Verify Frontend Build Fix

In Railway dashboard:
1. Go to **reacher-frontend** service
2. Click **Trigger deploy** (redeploy)
3. Wait 2-3 minutes for build
4. Check **Build Logs** for success

**Expected:** Build completes successfully, shows "Deployment successful"

---

## Step 2: Fix Auth Service Build

If still failing:

1. Go to **reacher-auth-service** service
2. Click **Build Logs** tab
3. Look for error message
4. Common issues:
   - Missing dependencies
   - Wrong Node version
   - Port already in use

### Action: Check package.json

```bash
# In backend/auth-service/package.json
# Verify:
- "main": "src/index.js" ✓
- "scripts": { "start": "node src/index.js" } ✓
- All dependencies listed under "dependencies" ✓
```

---

## Step 3: Environment Variables Setup

In Railway **Settings** → **Variables**, add:

```
# Database
DATABASE_URL=postgresql://...@postgres.xxxxx.supabase.co:5432/postgres?sslmode=require

# Auth
JWT_SECRET=your_secret_key_here

# Environment
NODE_ENV=production

# Frontend URL
NEXT_PUBLIC_API_URL=https://your-railway-domain.up.railway.app
```

---

## Step 4: Deploy Each Service

**Order matters!** Deploy in this order:

1. **Auth Service** (5001)
   - Click "Trigger deploy"
   - Wait for "Running" status
   - Check logs for errors

2. **User Service** (5002)
   - Click "Trigger deploy"
   - Verify "Running"

3. **Product Service** (5003)
   - Click "Trigger deploy"
   - Verify "Running"

4. **Provider Service** (5004)
   - Click "Trigger deploy"
   - Verify "Running"

5. **Trust Service** (5005)
   - Click "Trigger deploy"
   - Verify "Running"

6. **Message Service** (5006)
   - Click "Trigger deploy"
   - Verify "Running"

7. **Notification Service** (5007)
   - Click "Trigger deploy"
   - Verify "Running"

---

## Step 5: Verify Services

### Check Health Endpoints

```bash
# After all services are running:
curl https://your-railway-domain/auth/health
curl https://your-railway-domain/user/health
curl https://your-railway-domain/product/health
```

### Expected Responses
```json
{ "status": "ok", "service": "auth-service" }
{ "status": "ok", "service": "user-service" }
{ "status": "ok", "service": "product-service" }
```

---

## Step 6: Configure Custom Domain

1. In Railway project
2. Go to **Settings** → **Custom Domain**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow DNS instructions
5. Wait for verification (5-10 minutes)

---

## Step 7: Test Production Flow

```bash
# Test signup
curl -X POST https://your-domain/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'

# Test login
curl -X POST https://your-domain/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## Common Issues & Fixes

### Build Fails: "Cannot find module"
**Solution:** Missing dependencies in package.json
```bash
npm install missing-package
git add package.json package-lock.json
git commit -m "add missing dependency"
git push
```

### Service Won't Start: "Port already in use"
**Solution:** Change PORT in environment
```
In Railway Settings:
PORT=5001 (or appropriate port)
```

### Database Connection Error
**Solution:** Verify DATABASE_URL
```
Check:
- URL is correct
- Password has no special chars (or is URL encoded)
- Supabase database is running
- Firewall allows connections
```

### Deployment Timeout
**Solution:** Optimize build
```bash
# Remove unused dependencies
npm prune --production

# Reduce bundle size
npm audit
```

---

## Success Checklist

- [ ] Frontend builds successfully
- [ ] Frontend loads at domain
- [ ] Auth service running
- [ ] User service running
- [ ] Product service running
- [ ] Provider service running
- [ ] Trust service running
- [ ] Message service running
- [ ] Notification service running
- [ ] Health checks passing
- [ ] Signup works
- [ ] Login works
- [ ] Can create products
- [ ] Can search products

---

## Next: Monitor Deployment

Once everything is deployed:

1. **Watch Logs** for errors (first 10 minutes)
2. **Monitor Metrics** - CPU, memory, requests
3. **Test Core Features** - signup, login, product CRUD
4. **Check Error Rate** - should be 0%
5. **Verify Response Times** - should be <1s

---

## If You Get Stuck

### Check These Files
- `docs/RAILWAY_DEPLOYMENT.md` - Full deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-launch checklist
- Service Dockerfiles - `backend/*/Dockerfile`
- Environment template - `.env.production.example`

### Get Help
- Railway Docs: https://docs.railway.app
- Check service logs in Railway dashboard
- Review build/deploy logs
- Test health endpoints

---

## Timeline

- **Frontend Fix:** 5 minutes (done!)
- **Deploy 7 Services:** 15-20 minutes
- **Configure Domain:** 10 minutes
- **Test & Verify:** 10 minutes

**Total: ~45 minutes to production** ✅

---

**Next Action:** Click "Trigger deploy" on reacher-frontend in Railway dashboard
