# Complete Deployment Guide - Boxinator

## 🚀 Deployment Overview

Your app will be deployed in this architecture:

```
Frontend (React)     →  Vercel
Backend (Node/API)   →  Heroku (or AWS/DigitalOcean)
Database             →  Supabase (PostgreSQL)
```

## Part 1: Frontend Deployment (Vercel) - 5 minutes ⚡

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repos

### Step 2: Import Your Project
1. On Vercel dashboard, click "Add New" → "Project"
2. Find `Siter_FinalProject` and click "Import"
3. Configure:
   - **Framework Preset:** React
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `client/build`

### Step 3: Add Environment Variables
In Vercel dashboard, under "Environment Variables":
```
REACT_APP_API_URL = https://your-backend-url.herokuapp.com
```
(We'll get this after deploying backend)

### Step 4: Deploy!
- Click "Deploy"
- Wait 2-3 minutes
- Your frontend is live! 🎉

**Your frontend URL:** `https://your-project-name.vercel.app`

---

## Part 2: Database Setup (Supabase) - 3 minutes ⚡

Your project already uses Supabase. Let's ensure it's configured:

### Step 1: Verify Supabase Project
1. Go to https://supabase.com
2. Sign in or create account
3. Create new project (if you haven't already)
4. Go to Settings → API

### Step 2: Get Your Credentials
Copy these from Supabase dashboard:
```
DATABASE_URL (under Connection Strings)
SUPABASE_URL (under Project URL)
SUPABASE_ANON_KEY (under API Keys)
SUPABASE_SERVICE_ROLE_KEY (under API Keys)
```

### Step 3: Run Migrations
Your database schema is defined in `server/prisma/schema.prisma`

Migrations are handled automatically in CI/CD, or run manually:
```bash
cd server
npx prisma migrate deploy
```

---

## Part 3: Backend Deployment (Heroku) - 5 minutes ⚡

### Step 1: Create Heroku Account
1. Go to https://www.heroku.com
2. Sign up (free account available)
3. Verify email

### Step 2: Create New App
1. Click "New" → "Create new app"
2. **App name:** `boxinator-api` (must be unique)
3. **Region:** Choose closest to your users
4. Click "Create app"

### Step 3: Set Environment Variables
In Heroku app dashboard → Settings → Config Vars, add:

```
DATABASE_URL          postgresql://user:pass@...
DIRECT_URL            postgresql://user:pass@...
JWT_SECRET            your-secret-key-here
SMTP_HOST             smtp.gmail.com
SMTP_PORT             587
SMTP_USER             your-email@gmail.com
SMTP_PASS             your-app-password
FRONTEND_URL          https://your-frontend.vercel.app
NODE_ENV              production
```

### Step 4: Deploy via Git
In your terminal:
```bash
# Login to Heroku
heroku login

# Add Heroku remote
heroku git:remote -a boxinator-api

# Push to Heroku (automatic build and deploy)
git push heroku master
```

### Step 5: Verify Deployment
```bash
# Check logs
heroku logs --tail

# Check if app is running
curl https://boxinator-api.herokuapp.com/health
```

**Your backend URL:** `https://boxinator-api.herokuapp.com`

---

## Part 4: Update Frontend with Backend URL

### Back to Vercel Dashboard:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Update `REACT_APP_API_URL`:
   ```
   REACT_APP_API_URL = https://boxinator-api.herokuapp.com
   ```
4. Click "Save"
5. Redeploy: Deployments → Select latest → Redeploy

---

## Part 5: Enable CI/CD Automatic Deployments

### Setup GitHub Secrets:
1. Go to your repo: https://github.com/Ramshiva1905/Siter_FinalProject
2. Settings → Secrets and variables → Actions
3. Click "New repository secret" and add:

**Frontend (Vercel):**
```
VERCEL_TOKEN      = Get from https://vercel.com/account/tokens
VERCEL_ORG_ID     = Get from Vercel project settings
VERCEL_PROJECT_ID = Get from Vercel project settings
```

**Backend (Heroku):**
```
HEROKU_API_KEY    = Get from https://dashboard.heroku.com/account
HEROKU_APP_NAME   = boxinator-api
```

### Now CI/CD is Active:
- **Push to `develop`** → Auto-deploys to staging
- **Push to `master`** → Auto-deploys to production
- **Create PR** → Runs tests automatically

---

## 🎯 Testing Your Deployment

### Test Frontend
Visit: `https://your-app.vercel.app`
- ✅ Homepage loads
- ✅ Can navigate to login

### Test Backend
```bash
# Health check
curl https://boxinator-api.herokuapp.com/health

# Test API
curl https://boxinator-api.herokuapp.com/api/countries
```

### Test Integration
1. Go to frontend
2. Click "Login"
3. Try to login with test credentials:
   ```
   Email: admin@boxinator.com
   Password: admin123456
   ```
4. Should redirect to dashboard
5. Click "View" on a shipment
6. Should load shipment details from backend

---

## ✅ Deployment Checklist

Before declaring success, verify:

**Frontend:**
- [ ] Vercel shows "Ready"
- [ ] App loads at `vercel.app` URL
- [ ] No console errors
- [ ] Can navigate between pages

**Backend:**
- [ ] Heroku shows "Deployed"
- [ ] Health endpoint responds
- [ ] Database connected
- [ ] No errors in logs

**Integration:**
- [ ] Frontend connects to backend API
- [ ] Login works
- [ ] Can view shipments
- [ ] Can create new shipment

---

## 🚨 Troubleshooting

### Frontend won't load
- Check Vercel build logs
- Verify `REACT_APP_API_URL` is set
- Check for console errors (F12)

### Backend deployment fails
- Check Heroku logs: `heroku logs --tail`
- Verify DATABASE_URL is correct
- Ensure all env vars are set

### API 404 errors
- Verify backend is running: `heroku ps`
- Check FRONTEND_URL in backend env vars
- Verify CORS configuration

### Database connection fails
- Test Supabase connection locally
- Check DATABASE_URL format
- Run migrations manually if needed

---

## 📊 Your Live URLs

After deployment, you'll have:

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://your-app.vercel.app | ✅ |
| **Backend** | https://boxinator-api.herokuapp.com | ✅ |
| **Database** | Supabase (internal) | ✅ |

---

## 🔄 Continuous Deployment

Now every time you:
1. **Create PR** → Tests run automatically
2. **Merge to develop** → Deploys to staging
3. **Merge to master** → Deploys to production

No manual deployment needed! 🚀

---

## 📞 Support & Next Steps

### Need to add features?
- Create feature branch: `git checkout -b feature/my-feature`
- Make changes
- Push: `git push origin feature/my-feature`
- Create PR for review
- Auto-tests run
- Merge when approved
- Auto-deploys! ✅

### Need to fix bugs?
- Same workflow as above
- Create hotfix branch
- Merge to master
- Instant production fix ✅

---

**Congratulations! Your app is now live! 🎉**
