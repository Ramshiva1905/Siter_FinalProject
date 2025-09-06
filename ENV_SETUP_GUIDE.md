# 🔧 Update Your .env File

Replace the Supabase section in your `.env` file with your actual credentials:

```env
# Supabase Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE"
```

## Example (with placeholder values):
```env
# If your project ref is "abcdefghijklmnop" and password is "mypassword123"
DATABASE_URL="postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
SUPABASE_URL="https://abcdefghijklmnop.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU0NDQ5MywiZXhwIjoxOTU4MTIwNDkzfQ.example-anon-key"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQyNTQ0NDkzLCJleHAiOjE5NTgxMjA0OTN9.example-service-key"
```

## ⚠️ Important Notes:
1. **Keep your service_role key secret** - it has admin access
2. **The anon key is safe to use in frontend** - it has limited access
3. **DATABASE_URL format**: `postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres`

## 🎯 Once you update your .env file, let me know and I'll help you run the migrations!
