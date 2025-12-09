# Railway Deployment - Environment Variables Checklist

Use this file to collect all credentials and variables needed for Railway deployment.

---

## 📋 STEP 1: Gather Supabase Credentials

Go to your Supabase project and collect these values:

### From Settings → API
```
SUPABASE_URL = 
  Paste here: https://[PROJECT_ID].supabase.co

SUPABASE_ANON_KEY = 
  Paste here: eyJhbGc...

SUPABASE_SERVICE_ROLE_KEY = 
  Paste here: eyJhbGc...
```

### From Settings → Database
```
DB_HOST = 
  Paste here: postgres.[PROJECT_ID].supabase.co

DB_PORT = 
  Paste here: 5432

DB_NAME = 
  Paste here: postgres

DB_USER = 
  Paste here: postgres

DB_PASSWORD = 
  Paste here: [Your strong password]
```

### Build Connection String
```
Combine DB values into:

DATABASE_URL = postgresql://postgres:PASSWORD@postgres.PROJECT_ID.supabase.co:5432/postgres?sslmode=require

Replace:
  - PASSWORD with your DB_PASSWORD
  - PROJECT_ID with your project ID

Full value: 
  Paste here: 
```

---

## 🔐 STEP 2: Generate JWT Secret

**Do this once:**

Option 1 - Using OpenSSL (terminal):
```bash
openssl rand -base64 32
```

Option 2 - Online generator:
https://www.random.org/cgi-bin/randbytes?nbytes=32&format=h

**Save this value:**
```
JWT_SECRET = 
  Paste here: 
```

---

## 🚂 STEP 3: Prepare for Railway

**Create a file called `.env.railway.txt` with all these values:**

```
# ============================================
# DATABASE CONNECTION
# ============================================
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.XXXXX.supabase.co:5432/postgres?sslmode=require
SUPABASE_URL=https://XXXXX.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=[Your 32-char secret]
JWT_EXPIRY=24h

# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV=production

# ============================================
# SERVICE PORTS
# ============================================
AUTH_SERVICE_PORT=8001
USER_SERVICE_PORT=8002
PRODUCT_SERVICE_PORT=8003
PROVIDER_SERVICE_PORT=8004
TRUST_SERVICE_PORT=8005
MESSAGE_SERVICE_PORT=8006
NOTIFICATION_SERVICE_PORT=8007
GATEWAY_PORT=8000

# ============================================
# API URLS
# ============================================
NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app
FRONTEND_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app
```

---

## ✅ DEPLOYMENT CHECKLIST

### Before Adding to Railway:

- [ ] Supabase project created
- [ ] Database schema initialized
- [ ] All credentials collected
- [ ] JWT_SECRET generated
- [ ] DATABASE_URL verified (format correct)
- [ ] .env.railway.txt file prepared

### Adding to Railway Dashboard:

For each variable below, go to Railway Settings → Variables and add:

- [ ] DATABASE_URL
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] JWT_SECRET
- [ ] JWT_EXPIRY
- [ ] NODE_ENV = `production`
- [ ] AUTH_SERVICE_PORT = `8001`
- [ ] USER_SERVICE_PORT = `8002`
- [ ] PRODUCT_SERVICE_PORT = `8003`
- [ ] PROVIDER_SERVICE_PORT = `8004`
- [ ] TRUST_SERVICE_PORT = `8005`
- [ ] MESSAGE_SERVICE_PORT = `8006`
- [ ] NOTIFICATION_SERVICE_PORT = `8007`
- [ ] GATEWAY_PORT = `8000`
- [ ] NEXT_PUBLIC_API_URL
- [ ] FRONTEND_URL

### Services to Deploy (In Order):

- [ ] Auth Service (backend/auth-service)
- [ ] User Service (backend/user-service)
- [ ] Product Service (backend/product-service)
- [ ] Provider Service (backend/provider-service)
- [ ] Trust Service (backend/trust-service)
- [ ] Message Service (backend/message-service)
- [ ] Notification Service (backend/notification-service)
- [ ] Frontend (frontend/) - Deploy to Vercel preferred

### Post-Deployment Verification:

- [ ] Auth service responds to /health
- [ ] User service responds to /health
- [ ] Product service responds to /health
- [ ] Provider service responds to /health
- [ ] Trust service responds to /health
- [ ] Message service responds to /health
- [ ] Notification service responds to /health
- [ ] Can signup at API endpoint
- [ ] Frontend loads in browser
- [ ] No errors in service logs

---

## 📝 CREDENTIALS REFERENCE

**Keep these safe (don't share):**

| Variable | Value | Status |
|----------|-------|--------|
| SUPABASE_URL | | ☐ Collected |
| SUPABASE_ANON_KEY | | ☐ Collected |
| SUPABASE_SERVICE_ROLE_KEY | | ☐ Collected |
| DATABASE_URL | | ☐ Collected |
| JWT_SECRET | | ☐ Generated |

---

## 🚀 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard  
**Railway Dashboard:** https://railway.app  
**Vercel Dashboard:** https://vercel.com/dashboard  

**Project URLs (after deployment):**
- API: `https://YOUR_PROJECT.up.railway.app`
- Frontend: `https://YOUR_PROJECT.vercel.app`

---

**IMPORTANT: Never commit .env.railway.txt to git!**
**Use Railway's secure Variables dashboard instead.**

---

This checklist ensures you have everything needed for deployment. Once completed, follow RAILWAY_DEPLOYMENT_ACTION_PLAN.md step-by-step. 🚀
