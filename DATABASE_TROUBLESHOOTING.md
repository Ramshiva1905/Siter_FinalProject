# Alternative Database Configuration Options

## Option 1: Reactivate Supabase Project
1. Go to https://supabase.com/dashboard
2. Find your project: vzshwdtrmemfuijpvoiy
3. Check if it's paused or inactive
4. Resume the project if needed

## Option 2: Create New Supabase Project
1. Create a new Supabase project
2. Get the new connection details
3. Update the .env file with new credentials

## Option 3: Local PostgreSQL Setup
If you want to use a local database instead:

### Install PostgreSQL locally:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the 'postgres' user

### Update .env for local database:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/boxinator"
```

### Create local database:
```sql
CREATE DATABASE boxinator;
```

## Option 4: Docker PostgreSQL (Recommended for Development)
Run PostgreSQL in a Docker container:

```bash
docker run --name boxinator-postgres -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=boxinator -p 5432:5432 -d postgres:13
```

Then update .env:
```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/boxinator"
```
