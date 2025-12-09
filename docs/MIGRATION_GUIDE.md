# Supabase Migration Guide for Reacher MVP

This guide provides step-by-step instructions to migrate Reacher MVP from SQLite (development) to PostgreSQL (Supabase production).

## Table of Contents
1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Create Supabase Project](#create-supabase-project)
3. [Initialize Database Schema](#initialize-database-schema)
4. [Update Service Dependencies](#update-service-dependencies)
5. [Migrate Data](#migrate-data)
6. [Update Service Code](#update-service-code)
7. [Configure Environment](#configure-environment)
8. [Test Migration](#test-migration)
9. [Deploy to Production](#deploy-to-production)
10. [Rollback Procedure](#rollback-procedure)

## Pre-Migration Checklist

- [ ] Backup SQLite database: `cp backend/db/reacher.sqlite backend/db/reacher.sqlite.backup`
- [ ] All services stopped locally
- [ ] Git working directory clean: `git status`
- [ ] Create migration branch: `git checkout -b feat/supabase-migration`
- [ ] Supabase account created
- [ ] Note current data volume (if any)

## Create Supabase Project

### Step 1: Sign Up / Login
- Visit https://supabase.com
- Sign in or create account
- Go to Projects dashboard

### Step 2: Create New Project
- Click "New Project"
- **Project Name**: `reacher-mvp-prod`
- **Database Password**: Generate strong password (minimum 16 characters)
  - Save this securely in password manager!
  - Example format: `P@ssw0rd!ABC123XYZ`
- **Region**: Select closest to target users
  - Nearest to Nigeria: Europe (Ireland) or US (N. Virginia)
- Click "Create new project"

### Step 3: Wait for Setup
- Project setup takes 1-2 minutes
- You'll see a "Connecting..." message
- Dashboard becomes available once ready

### Step 4: Get Connection Details
- Go to **Settings** → **Database**
- Copy the following:
  - **Host**: `[project-id].supabase.co`
  - **Port**: `5432`
  - **Database**: `postgres`
  - **User**: `postgres`
  - **Password**: The one you set above

## Initialize Database Schema

### Step 1: Open SQL Editor
- In Supabase dashboard
- Click **SQL Editor** (left sidebar)
- Click **+ New Query**

### Step 2: Create Tables
- Open file: `db/supabase-schema.sql`
- Copy entire contents
- Paste into SQL editor
- Click **Run** button
- Verify success (no errors shown)

### Step 3: Verify Tables
Run verification query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- users
- profiles
- products
- providers
- reviews
- trust_scores
- conversations
- messages
- notifications

### Step 4: Enable Row Level Security

```sql
-- Already done in supabase-schema.sql
-- Verify RLS is enabled:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

## Update Service Dependencies

### Step 1: Install PostgreSQL Driver

For each service directory:
```bash
cd backend/auth-service
npm install pg

cd ../user-service
npm install pg

cd ../product-service
npm install pg

# ... repeat for other services
```

### Step 2: Remove SQLite (Optional)

If no longer needed:
```bash
npm uninstall sqlite3
```

## Migrate Data

### Option A: Backup & Restore (Recommended for production)

1. **Backup existing SQLite**:
```bash
cp backend/db/reacher.sqlite backend/db/reacher.sqlite.backup
```

2. **Export from SQLite**:
```bash
sqlite3 backend/db/reacher.sqlite .dump > db/sqlite-export.sql
```

3. **Clean up export** (remove SQLite-specific syntax):
```bash
# Edit db/sqlite-export.sql:
# - Remove PRAGMA statements
# - Remove "CREATE TABLE IF NOT EXISTS" (use CREATE TABLE)
# - Change INTEGER AUTOINCREMENT to SERIAL
# - Adjust data types as needed
```

4. **Import to PostgreSQL**:
```bash
psql postgresql://postgres:PASSWORD@HOST:5432/postgres < db/sqlite-export.sql
```

### Option B: pgloader (Automated)

1. **Install pgloader**:
```bash
# macOS
brew install pgloader

# Windows (with Chocolatey)
choco install pgloader

# Linux
apt-get install pgloader
```

2. **Create migration config** (`db/pgloader.load`):
```
LOAD DATABASE
  FROM sqlite:///absolute/path/to/backend/db/reacher.sqlite
  INTO postgresql://postgres:PASSWORD@HOST:5432/postgres
  WITH include drop, create tables, create indexes, reset sequences;
```

3. **Run migration**:
```bash
pgloader db/pgloader.load
```

### Option C: Minimal Data (For testing)

If database is empty or has minimal data, skip data migration and create test data via API after migration.

## Update Service Code

### Step 1: Update Each Service

Replace `require('./db')` usage in each service:

**Before** (SQLite):
```javascript
const { initializeDatabase, runQuery, getOne, getAll } = require('./db');
```

**After** (PostgreSQL):
```javascript
const { initializeDatabase, runQuery, getOne, getAll } = require('../adapters/db-postgres');
```

### Step 2: Update Database Module

Create new file or modify existing `src/db.js`:

```javascript
// For production, use PostgreSQL adapter
if (process.env.NODE_ENV === 'production') {
  module.exports = require('../adapters/db-postgres');
} else {
  module.exports = require('./db-sqlite');
}
```

### Step 3: Update Connection Strings

All services expect `DATABASE_URL` environment variable:
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
```

### Step 4: Verify Query Compatibility

PostgreSQL uses different SQL syntax in some cases:

**SQLite → PostgreSQL Changes**:
```sql
-- DateTime
CURRENT_TIMESTAMP  -- Works in both
datetime('now')    -- SQLite only, use CURRENT_TIMESTAMP

-- UUID
-- SQLite: TEXT
-- PostgreSQL: UUID with uuid_generate_v4()

-- JSON
json_extract()     -- SQLite
->                 -- PostgreSQL

-- Sequences
AUTOINCREMENT      -- SQLite
SERIAL             -- PostgreSQL
```

## Configure Environment

### Step 1: Update .env Files

**Root .env**:
```bash
# From Supabase Settings → API
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...

# PostgreSQL connection
DATABASE_URL=postgresql://postgres:PASSWORD@[PROJECT_ID].supabase.co:5432/postgres

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY=24h

# Environment
NODE_ENV=production
```

### Step 2: Backend Service .env Files

Each service (`backend/[service-name]/.env`):
```bash
PORT=500X
DATABASE_URL=postgresql://postgres:PASSWORD@[PROJECT_ID].supabase.co:5432/postgres
NODE_ENV=production
JWT_SECRET=your_jwt_secret
```

### Step 3: Frontend .env Files

`frontend/.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:5000
```

## Test Migration

### Step 1: Start Services Locally

```bash
cd backend/auth-service && npm start &
cd backend/user-service && npm start &
cd backend/product-service && npm start &
# ... other services
```

### Step 2: Test Health Checks

```bash
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5002/health  # User Service
curl http://localhost:5003/health  # Product Service
```

Expected response:
```json
{
  "status": "ok",
  "service": "auth-service"
}
```

### Step 3: Test CRUD Operations

```bash
# Test User Creation
curl -X POST http://localhost:5001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'

# Verify user in PostgreSQL
psql postgresql://postgres:PASSWORD@HOST:5432/postgres
SELECT * FROM users;
```

### Step 4: Test RLS Policies

```sql
-- Connect as different users and verify RLS works
SELECT auth.uid();  -- Should show authenticated user UUID

SELECT * FROM users;  -- Should respect RLS policies
```

### Step 5: Data Verification

```sql
-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM messages;

-- Check data integrity
SELECT COUNT(*) FROM products WHERE seller_id IS NULL;  -- Should be 0
```

## Deploy to Production

### Step 1: Commit Changes

```bash
git add .
git commit -m "feat: migrate to Supabase PostgreSQL

- Update all services to use PostgreSQL
- Add database adapters for both SQLite and PostgreSQL
- Implement Row Level Security policies
- Update environment configuration
- Add migration documentation"

git push origin feat/supabase-migration
```

### Step 2: Create Pull Request

- Create PR on GitHub
- Request reviews
- Ensure CI/CD passes
- Merge to main branch

### Step 3: Production Deployment

For your hosting platform:

**Vercel (Recommended for frontend)**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

**Railway / Render (For backend services)**:
- Connect GitHub repo
- Set environment variables in dashboard
- Deploy automatically on push to main

**Self-hosted Docker**:
```bash
# Build image
docker build -t reacher-auth-service ./backend/auth-service

# Push to registry
docker push your-registry/reacher-auth-service

# Deploy to Kubernetes, Docker Swarm, etc.
```

### Step 4: Verify Production

```bash
# Test production endpoint
curl https://your-api.com/auth/health

# Check logs
vercel logs [project-name]

# Monitor performance
# Go to Supabase → Monitoring
```

## Rollback Procedure

If issues occur during migration:

### Step 1: Stop Services
```bash
# Kill all running services
pkill -f "node src/index.js"
```

### Step 2: Restore SQLite

```bash
# Restore from backup
cp backend/db/reacher.sqlite.backup backend/db/reacher.sqlite

# Revert code changes
git checkout main
git reset --hard

# Or revert to previous commit
git log --oneline | head -5
git reset --hard [COMMIT_HASH]
```

### Step 3: Restart with SQLite

```bash
cd backend/auth-service
npm start
```

### Step 4: Investigate Issue

- Check error logs
- Review migration steps
- Update documentation
- Create new PR with fixes

## Monitoring Post-Migration

### Step 1: Enable Monitoring

Go to Supabase **Monitoring**:
- Enable query performance insights
- Set up slow query detection
- Configure backup schedule

### Step 2: Set Alerts

- CPU usage > 80%
- Connections > 100
- Failed queries detected
- Storage quota reached

### Step 3: Regular Backups

```sql
-- Supabase auto-backups (7-day free retention)
-- Or use manual backup:
pg_dump postgresql://user:pass@host/dbname > backup.sql

-- Restore if needed:
psql postgresql://user:pass@host/dbname < backup.sql
```

## Support & Resources

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- pgloader: https://pgloader.io/
- Vercel Deployment: https://vercel.com/docs

## Checklist for Production

- [ ] All services tested with PostgreSQL
- [ ] Environment variables configured
- [ ] Data migrated and verified
- [ ] RLS policies tested
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Rollback procedure documented
- [ ] Team trained on new setup
- [ ] Documentation updated
- [ ] Deploy to production
