# 🚀 Quick Supabase Setup

## Get Your App Running in 5 Minutes!

Since you don't have PostgreSQL installed locally, let's use Supabase:

### 1. Create Supabase Account (2 minutes)
1. Go to https://supabase.com
2. Click "Start your project" 
3. Sign up with GitHub/Google/Email

### 2. Create Project (1 minute)
1. Click "New Project"
2. Name: `boxinator`
3. Database Password: Make it strong (save it!)
4. Region: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### 3. Get Your Credentials (1 minute)
1. In dashboard, go to Settings → API
2. Copy these values:

```
Project URL: https://[your-project-ref].supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Update Your .env File (1 minute)
Replace the DATABASE_URL in your `.env` file:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

**Example:**
```env
DATABASE_URL="postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

### 5. Run Migrations (30 seconds)
```bash
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## That's it! Your app will be running with a production database! 🎉

---

## Alternative: Docker PostgreSQL (If you prefer local)

If you have Docker installed:
```bash
docker run --name boxinator-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=boxinator_db -p 5432:5432 -d postgres

# Then use this DATABASE_URL:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/boxinator_db"
```

## Which option do you prefer?
- **Supabase**: Production-ready, no local setup, free tier
- **Docker**: Local development, requires Docker installed
