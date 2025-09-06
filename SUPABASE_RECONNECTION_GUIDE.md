# Supabase Reconnection Guide

## Current Issue
The Supabase database `vzshwdtrmemfuijpvoiy` is not reachable. This could be due to:
1. Project being paused due to inactivity
2. Free tier usage limits exceeded
3. Project needs to be restarted
4. Network connectivity issues

## Steps to Reconnect to Supabase

### Option 1: Reactivate Existing Project
1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Log in to your account

2. **Find Your Project**
   - Look for project: `vzshwdtrmemfuijpvoiy`
   - Check if it shows as "Paused" or "Inactive"

3. **Restart/Resume Project**
   - Click on the project
   - Look for "Resume" or "Restart" button
   - Wait for the project to become active

4. **Verify Connection**
   - Once active, the database URL should be accessible again
   - Test connection using: `npm run db:test` (if available)

### Option 2: Create New Supabase Project
If the existing project cannot be restored:

1. **Create New Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose organization and region
   - Set database password (remember this!)

2. **Get New Connection Details**
   - Go to Project Settings → Database
   - Copy the connection string
   - Copy the API keys from Project Settings → API

3. **Update Environment Variables**
   ```
   DATABASE_URL="postgresql://postgres:YOUR_NEW_PASSWORD@db.YOUR_NEW_PROJECT.supabase.co:5432/postgres"
   SUPABASE_URL="https://YOUR_NEW_PROJECT.supabase.co"
   SUPABASE_ANON_KEY="YOUR_NEW_ANON_KEY"
   SUPABASE_SERVICE_ROLE_KEY="YOUR_NEW_SERVICE_ROLE_KEY"
   ```

4. **Run Migrations and Seeds**
   ```bash
   cd server
   npx prisma db push
   npm run db:seed
   ```

### Option 3: Alternative Database Solutions

#### Docker PostgreSQL (Recommended for Development)
```bash
# Install Docker Desktop first, then run:
docker run --name boxinator-postgres \
  -e POSTGRES_PASSWORD=boxinator123 \
  -e POSTGRES_DB=boxinator \
  -p 5432:5432 \
  -d postgres:13

# Update .env:
DATABASE_URL="postgresql://postgres:boxinator123@localhost:5432/boxinator"
```

#### Local PostgreSQL Installation
1. Download PostgreSQL from https://www.postgresql.org/download/
2. Install with default settings
3. Create database: `createdb boxinator`
4. Update .env: `DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/boxinator"`

## Quick Test Commands

After updating your .env file, test the connection:

```bash
cd server
npx prisma db pull        # Test connection
npx prisma db push        # Apply schema
npm run db:seed          # Seed data
npm run dev              # Start server
```

## Current Fallback
The application is currently using a mock database, so you can continue development while resolving the Supabase connection.

## Need Help?
If you need assistance with any of these steps, please share:
1. Your Supabase dashboard status
2. Any error messages you see
3. Which option you'd prefer to pursue
