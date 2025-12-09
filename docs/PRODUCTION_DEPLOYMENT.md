# Supabase Production Setup Guide

## 📋 Quick Summary
This guide walks you through setting up Reacher MVP on Supabase (PostgreSQL) for production deployment. Total time: **30 minutes**.

---

## Step 1: Create Supabase Project

### 1.1 Sign Up / Log In
1. Go to https://supabase.com
2. Click **"Start your project"** (sign up if needed)
3. Use GitHub or email to authenticate

### 1.2 Create New Project
1. Click **"New Project"**
2. Fill in details:
   - **Name:** `reacher-mvp` (or your preference)
   - **Database Password:** Generate strong password (save this!)
   - **Region:** Choose closest to your users
3. Click **"Create new project"**
4. Wait 1-2 minutes for setup (you'll see a loading screen)

### 1.3 Get Your Credentials
Once project is created, go to **Settings > Database**:

```
Save these values:
- Host: [postgres.xxxxx.supabase.co]
- Port: [5432]
- Database: [postgres]
- Username: [postgres]
- Password: [your-password]
```

Also get from **Settings > API**:
```
- Project URL: https://xxxxx.supabase.co
- Anon Key: [eyJhbGc...]
- Service Role Key: [eyJhbGc...]
```

---

## Step 2: Initialize Database Schema

### 2.1 Open SQL Editor
1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**

### 2.2 Run Schema SQL
1. Copy entire contents of `db/supabase-schema.sql`
2. Paste into the SQL editor
3. Click **"Run"** button (or Ctrl+Enter)
4. Wait for completion (should take ~5 seconds)

### 2.3 Verify Tables Created
```sql
-- Run this in SQL Editor to verify:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected output:
```
- users
- profiles
- products
- providers
- reviews
- trust_scores
- conversations
- messages
- notifications
```

---

## Step 3: Enable Row Level Security (RLS)

The schema already includes RLS, but verify it's enabled:

```sql
-- Check RLS is enabled on all tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

All tables should show up (8 total).

---

## Step 4: Configure Environment Variables

### 4.1 Create `.env.production` in root folder:

```bash
# Copy from .env.example and add Supabase values:

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database Configuration
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.xxxxx.supabase.co:5432/postgres
DB_HOST=postgres.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=24h

# Environment
NODE_ENV=production

# Service Ports (update based on deployment)
AUTH_SERVICE_PORT=5001
USER_SERVICE_PORT=5002
PRODUCT_SERVICE_PORT=5003
PROVIDER_SERVICE_PORT=5004
TRUST_SERVICE_PORT=5005
MESSAGE_SERVICE_PORT=5006
NOTIFICATION_SERVICE_PORT=5007
GATEWAY_PORT=5000

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_AUTH_URL=https://your-api-domain.com/auth

# Optional - Email Configuration
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Optional - File Storage (Supabase Storage)
STORAGE_BUCKET=uploads
STORAGE_REGION=us-east-1

# Optional - Stripe (for payments)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 4.2 Generate JWT Secret
```bash
# PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -SetSeed (Get-Date).Ticks | ForEach-Object {[char](Get-Random -Min 33 -Max 126)})*32))

# Or use online generator
# https://www.random.org/cgi-bin/randbytes?nbytes=32&format=h
```

---

## Step 5: Test Supabase Connection

### 5.1 Install Dependencies
```bash
cd backend/auth-service
npm install pg
```

Repeat for all 7 services.

### 5.2 Create Connection Test
```bash
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:PASSWORD@postgres.xxxxx.supabase.co:5432/postgres?sslmode=require'
});
pool.query('SELECT version()').then(res => {
  console.log('✓ Connected to Supabase');
  console.log(res.rows[0].version);
  process.exit(0);
}).catch(err => {
  console.error('✗ Connection failed:', err.message);
  process.exit(1);
});
"
```

---

## Step 6: Update Service Code (Optional - for Production)

Services currently use SQLite adapter. To use PostgreSQL:

### 6.1 Update Auth Service
```javascript
// backend/auth-service/src/index.js

// Instead of:
const { initializeDatabase, ... } = require('./db');

// Use:
const { initializeDatabase, ... } = require('../../adapters/db-postgres');

// Update DATABASE_URL in .env.production
```

### 6.2 Repeat for All Services
Same change in:
- `backend/user-service/src/index.js`
- `backend/product-service/src/index.js`
- `backend/provider-service/src/index.js`
- `backend/trust-service/src/index.js`
- `backend/message-service/src/index.js`
- `backend/notification-service/src/index.js`

---

## Step 7: Deploy to Production Platform

### Option A: Railway (Recommended - Free Trial)

1. Go to https://railway.app
2. Click **"Start Project"** → **"Deploy from GitHub"**
3. Select your GitHub repo
4. Add environment variables from `.env.production`
5. Deploy each service:
   ```bash
   SERVICE_NAME=auth-service npm start
   SERVICE_NAME=user-service npm start
   # ... repeat for all 7
   ```

### Option B: Render.com

1. Go to https://render.com
2. Click **"New"** → **"Web Service"**
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Option C: Heroku (Legacy)

1. Install Heroku CLI
2. Run: `heroku create reacher-api`
3. Add buildpacks: `heroku buildpacks:add heroku/nodejs`
4. Set variables: `heroku config:set DATABASE_URL=...`
5. Deploy: `git push heroku main`

---

## Step 8: Configure Custom Domain (Optional)

### For Railway:
1. Go to your project → **"Settings"**
2. Click **"Add custom domain"**
3. Add your domain (e.g., `api.reacher.app`)
4. Update DNS records

### Update Frontend
Update `NEXT_PUBLIC_API_URL` in `.env.production` with your domain.

---

## Step 9: Test Production Services

### Test Signup
```bash
curl -X POST https://your-api-domain.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

### Monitor Logs
- **Railway:** Dashboard → Logs tab
- **Render:** Service → Logs
- **Heroku:** `heroku logs --tail`

---

## Step 10: Enable Monitoring & Alerts

### Supabase Monitoring
1. Go to **"Settings"** → **"Monitoring"**
2. Enable **"Slow Query Logs"**
3. Set **"Max connections alert"** to 80

### Set Up Backups
1. Go to **"Settings"** → **"Backups"**
2. Enable **"Automated backups"**
3. Choose retention: 7 or 30 days

### Monitor Performance
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT * FROM postgres_logs 
WHERE message LIKE '%slow%' 
LIMIT 10;
```

---

## Step 11: Security Checklist

- [ ] Change default postgres password (already done)
- [ ] Enable network restrictions (if applicable)
- [ ] Set up SSL certificates (auto-enabled)
- [ ] Configure CORS on services
- [ ] Enable JWT validation
- [ ] Set strong API keys
- [ ] Enable audit logging
- [ ] Set up rate limiting
- [ ] Configure API key rotation schedule
- [ ] Document access procedures

---

## Troubleshooting

### Connection Refused
**Problem:** `ECONNREFUSED 127.0.0.1:5432`
**Solution:** Check you're using Supabase hostname, not localhost:
```bash
# Wrong
postgresql://postgres:pw@localhost/postgres

# Correct
postgresql://postgres:pw@postgres.xxxxx.supabase.co/postgres
```

### Authentication Failed
**Problem:** `FATAL: password authentication failed`
**Solution:** Double-check password from Settings → Database
- No special characters need escaping in connection string
- Copy password exactly as shown

### Slow Queries
**Problem:** Requests timing out
**Solution:**
1. Check Supabase monitoring for slow queries
2. Add indexes: `CREATE INDEX idx_user_id ON products(user_id);`
3. Check connection pool settings

### RLS Preventing Access
**Problem:** Queries return empty results
**Solution:** Check RLS policies in SQL Editor:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'products';
```

---

## Useful Commands

```bash
# Connect to Supabase with psql
psql "postgresql://postgres:PASSWORD@postgres.xxxxx.supabase.co:5432/postgres"

# Backup database
pg_dump "postgresql://postgres:PASSWORD@postgres.xxxxx.supabase.co:5432/postgres" > backup.sql

# Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));

# Monitor connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Clear all data (use with caution!)
TRUNCATE TABLE users CASCADE;
```

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Run SQL schema
3. ✅ Configure environment variables
4. ✅ Test connection
5. ✅ Deploy services
6. ✅ Update frontend `.env`
7. ✅ Test production signup/login
8. ✅ Monitor logs and performance
9. ✅ Set up backups
10. ✅ Launch to users!

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Status:** https://status.supabase.com
- **Community Chat:** https://discord.gg/vFu2NYECyc

---

**You're all set for production!** 🚀
