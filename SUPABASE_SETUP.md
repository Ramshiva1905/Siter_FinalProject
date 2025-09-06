# 🚀 Supabase Setup Guide for Boxinator

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `boxinator`
   - Database Password: Create a strong password (save this!)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (2-3 minutes)

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **anon public key**: `eyJ...` (starts with eyJ)
   - **service_role secret key**: `eyJ...` (starts with eyJ, different from anon)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update your `.env` file with Supabase credentials:
   ```bash
   # Supabase Database Configuration
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
   SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
   ```

   **Example:**
   ```bash
   DATABASE_URL="postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
   SUPABASE_URL="https://abcdefghijklmnop.supabase.co"
   SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

## Step 4: Generate Prisma Client and Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with test data
npm run db:seed
```

## Step 5: Verify Setup

1. Start your server:
   ```bash
   npm run dev
   ```

2. Check that the server connects to Supabase successfully
3. You should see logs indicating successful database connection

## Step 6: Configure Supabase Dashboard (Optional)

### Enable Row Level Security (RLS)
In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Enable "Enable Row Level Security"
3. Go to **Database** → **Tables**
4. For each table (`users`, `countries`, `shipments`, `status_history`):
   - Click on the table
   - Go to "RLS" tab
   - Click "Enable RLS"

### Create RLS Policies (Advanced)
You can create policies to secure your data:

```sql
-- Example: Users can only see their own shipments
CREATE POLICY "Users can view own shipments" ON shipments
FOR SELECT USING (auth.uid()::text = user_id);

-- Example: Only admins can update shipment status
CREATE POLICY "Admins can update shipments" ON shipments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND account_type = 'ADMINISTRATOR'
  )
);
```

## Benefits of Using Supabase

✅ **Hosted PostgreSQL**: No need to manage database servers
✅ **Real-time subscriptions**: Get real-time updates on data changes
✅ **Built-in authentication**: Can replace JWT with Supabase Auth (optional)
✅ **Row Level Security**: Fine-grained access control
✅ **Dashboard**: Visual database management
✅ **API auto-generation**: REST and GraphQL APIs
✅ **File storage**: Built-in file storage for attachments
✅ **Edge functions**: Serverless functions if needed

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL format is correct
- Check that your database password doesn't contain special characters that need URL encoding
- Ensure your Supabase project is active and not paused

### Migration Issues
- If migrations fail, check the Supabase logs in the dashboard
- Verify that your schema is compatible with PostgreSQL

### Authentication Issues
- Verify your SUPABASE_URL and keys are correct
- Check that the service role key has proper permissions

## Next Steps

Once Supabase is configured:

1. **Test the application**: Run `npm run dev` and test all features
2. **Deploy**: Use Supabase's built-in deployment or your preferred platform
3. **Scale**: Supabase automatically scales with your application
4. **Monitor**: Use Supabase dashboard to monitor performance and usage

Your Boxinator application is now powered by Supabase! 🎉
