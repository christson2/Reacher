# Supabase Production Database Setup Guide

## Overview
This guide walks through setting up Reacher MVP on Supabase PostgreSQL with Row Level Security (RLS) and JWT authentication.

## Prerequisites
- Supabase account (free at https://supabase.com)
- PostgreSQL knowledge (basic)
- Access to project repo

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in details:
   - **Name**: `reacher-mvp`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for setup (takes 1-2 minutes)

## Step 2: Run SQL Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy entire contents of `db/supabase-schema.sql`
4. Paste into query window
5. Click **Run** button
6. Verify all tables created successfully

### Tables Created:
- `users` - User accounts
- `profiles` - User profiles
- `products` - Marketplace listings
- `providers` - Service providers
- `reviews` - User reviews and ratings
- `trust_scores` - Calculated trust metrics
- `conversations` - Messaging conversations
- `messages` - Individual messages
- `notifications` - User notifications

## Step 3: Configure Authentication

### Enable Supabase Auth
1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (default)
3. Go to **Policies** → **URL Configuration**
4. Set **Site URL**: `http://localhost:3000` (dev) or your production domain
5. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

### JWT Configuration
1. Go to **Settings** → **API**
2. Copy **Project URL** and **Anon Key**
3. Note **Service Role Key** (keep secret, server-only)

## Step 4: Environment Variables

Update `.env` files across services:

### `.env` (Root)
```bash
# Supabase
SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc... # Keep secret!

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres

# JWT
JWT_SECRET=[Generate with: openssl rand -base64 32]
JWT_EXPIRY=24h

# Frontend
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
```

### `backend/auth-service/.env`
```bash
PORT=5001
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres
JWT_SECRET=[same as root]
JWT_EXPIRY=24h
```

### Each Microservice `.env`
```bash
PORT=500X
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres
NODE_ENV=production
```

## Step 5: Update Database Connection

Update all services to use PostgreSQL instead of SQLite:

### Example for Auth Service (db.js)
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

// Replace all sqlite3 calls with pool queries
async function getOne(sql, params) {
  const result = await pool.query(sql, params);
  return result.rows[0];
}

async function getAll(sql, params) {
  const result = await pool.query(sql, params);
  return result.rows;
}

async function runQuery(sql, params) {
  const result = await pool.query(sql, params);
  return result;
}
```

## Step 6: Migrate Data from SQLite to PostgreSQL

### Option A: Manual SQL Export
```bash
# Export SQLite to SQL
sqlite3 backend/db/reacher.sqlite .dump > db/sqlite-export.sql

# Clean up and import to Supabase
# Edit sqlite-export.sql to remove SQLite-specific syntax
# Copy/paste into Supabase SQL editor
```

### Option B: Use Migration Tool
```bash
# Install pgloader (recommended)
brew install pgloader  # macOS
choco install pgloader # Windows

# Create migration file
pgloader sqlite://backend/db/reacher.sqlite postgresql://user:pass@host/dbname
```

## Step 7: Test RLS Policies

1. Go to **SQL Editor** and run:
```sql
-- Test as anonymous user
SELECT * FROM users;

-- Should return nothing (RLS blocks access)
-- To test properly, use authenticated requests via API
```

2. Test through API:
```bash
curl -X GET http://localhost:5002/users \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "x-user-id: [USER_ID]"
```

## Step 8: Configure API Services for PostgreSQL

Install PostgreSQL driver:
```bash
npm install pg
```

Update each service's db.js to use `pg` instead of `sqlite3`:

```javascript
// auth-service/src/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Apply same pattern to all services
```

## Step 9: Deploy to Production

### Backend Services
```bash
# Build and push to container registry
docker build -t reacher-auth-service ./backend/auth-service
docker push your-registry/reacher-auth-service:latest

# Deploy using Docker, Vercel, Railway, or your preferred platform
```

### Frontend
```bash
# Deploy Next.js to Vercel
npm install -g vercel
vercel --prod

# Or use Docker
docker build -t reacher-frontend ./frontend
docker push your-registry/reacher-frontend:latest
```

## Step 10: Enable Realtime (Optional)

Enable live subscriptions for messaging/notifications:

1. Go to **Realtime** in Supabase
2. Enable for these tables:
   - `messages`
   - `notifications`
   - `reviews`

3. Update frontend to subscribe:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Subscribe to new messages
const subscription = supabase
  .from('messages')
  .on('*', payload => {
    console.log('New message:', payload)
  })
  .subscribe()
```

## Step 11: Monitor and Secure

### Security Checklist
- [ ] Service Role Key never exposed to frontend
- [ ] Anon Key restricted in RLS policies
- [ ] Database URL uses strong password
- [ ] Environment variables not committed to git
- [ ] SSL enabled for all connections
- [ ] Regular backups configured

### Monitoring
1. Go to **Database** → **Backups**
2. Enable automatic daily backups
3. Set up monitoring alerts
4. Monitor API usage in **Settings** → **Usage**

## Troubleshooting

### "relation does not exist"
- Run schema.sql again
- Check table names match your queries

### "permission denied"
- Verify RLS policies are correct
- Check JWT token includes user ID
- Ensure x-user-id header matches JWT

### "SSL: CERTIFICATE_VERIFY_FAILED"
- Add `ssl: { rejectUnauthorized: false }` to connection

### Slow queries
- Create indexes on frequently queried columns
- Analyze query plans with EXPLAIN
- Check Supabase performance insights

## Useful Commands

```bash
# Test database connection
psql postgresql://user:pass@host:5432/postgres

# List all tables
\dt

# Show table structure
\d table_name

# Backup database
pg_dump postgresql://user:pass@host/dbname > backup.sql

# Restore database
psql postgresql://user:pass@host/dbname < backup.sql
```

## Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT Auth](https://supabase.com/docs/guides/auth)
