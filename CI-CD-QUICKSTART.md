# CI/CD Quick Start Guide

## 🚀 Get Your Pipeline Running in 5 Minutes

### Step 1: Push Code to GitHub (1 min)

```bash
git add .
git commit -m "feat: setup CI/CD pipeline"
git push origin master
```

### Step 2: Add GitHub Secrets (2 mins)

Go to: `https://github.com/Ramshiva1905/Siter_FinalProject/settings/secrets/actions`

Click "New repository secret" and add:

```
DATABASE_URL          postgresql://user:pass@host/db
JWT_SECRET            your-secret-key-here
SMTP_HOST             smtp.gmail.com
SMTP_USER             your-email@gmail.com
SMTP_PASS             your-app-password
```

**For Vercel (Frontend Deployment):**
```
VERCEL_TOKEN          (from https://vercel.com/account/tokens)
VERCEL_ORG_ID         (your org ID)
VERCEL_PROJECT_ID     (your project ID)
```

**For Heroku (Backend Deployment - optional):**
```
HEROKU_API_KEY        (from Heroku Account Settings)
HEROKU_APP_NAME       boxinator-api-prod
```

### Step 3: Verify Workflows (1 min)

Go to: `https://github.com/Ramshiva1905/Siter_FinalProject/actions`

You should see workflows running:
- ✅ Frontend CI/CD
- ✅ Backend CI/CD
- ✅ Integration Tests

### Step 4: Setup Vercel (1 min)

1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repo
4. Framework: React
5. Root Directory: `client`
6. Build Command: `npm run build`
7. Deployment: **Deploy** ✅

Copy these values to GitHub Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`  
- `VERCEL_PROJECT_ID`

### Step 5: Test Your Pipeline (1 min)

Create a test branch:
```bash
git checkout -b test/ci-pipeline
git commit --allow-empty -m "test: trigger CI pipeline"
git push origin test/ci-pipeline
```

Go to: `https://github.com/Ramshiva1905/Siter_FinalProject/pull/new/test/ci-pipeline`

Click "Create Pull Request" and watch the workflows run!

---

## 📊 Your CI/CD Pipeline Workflows

### Workflow 1: Frontend CI/CD
**Triggers:** Push to master/develop or PR
**Steps:**
1. Build React app
2. Run tests (if available)
3. Deploy to Vercel (if master branch)

### Workflow 2: Backend CI/CD
**Triggers:** Push to master/develop or PR
**Steps:**
1. Install dependencies
2. Setup test database
3. Run migrations
4. Run tests
5. Deploy to Heroku (if master branch)

### Workflow 3: Integration Tests
**Triggers:** Every push and PR
**Steps:**
1. Run full test suite
2. Security audit
3. Code quality checks

---

## 🎯 Your Deployment Flow

```
Create Feature Branch
        ↓
Make Changes
        ↓
Push to GitHub
        ↓
GitHub Actions Tests & Builds
        ↓
PR Review & Approval
        ↓
Merge to develop → Deploys to Staging
        ↓
Merge develop → master → Deploys to Production
```

---

## ✅ View Deployment Status

1. Go to: https://github.com/Ramshiva1905/Siter_FinalProject/actions
2. Click on a workflow run
3. See real-time logs
4. Check if deployment succeeded

---

## 🔍 Next Steps

### Option A: Deploy Frontend Only (Recommended First)
1. Setup Vercel account
2. Add `VERCEL_*` secrets to GitHub
3. Test deployment with feature branch
4. Merge to master when ready

### Option B: Deploy Both (Full Stack)
1. Setup Vercel (frontend)
2. Setup Heroku (backend)
3. Add all secrets
4. Deploy both simultaneously

### Option C: Deploy to Custom Server
1. Update backend CI workflow with your server credentials
2. Add deployment steps for your provider (AWS, DigitalOcean, etc.)
3. Configure environment variables

---

## 🚨 Troubleshooting

### "Workflow failed" - Check logs:
1. Go to Actions tab
2. Click failed workflow
3. Click "Backend CI/CD" or "Frontend CI/CD"
4. Scroll down to see error messages

### "Vercel deployment failed":
1. Check `VERCEL_TOKEN` is correct
2. Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
3. Check build logs in Vercel dashboard

### "Build failing":
1. Verify all dependencies are installed locally
2. Test build locally: `npm run build`
3. Check environment variables are set

---

## 📚 Full Documentation

For complete setup guide: See `CI-CD-SETUP.md`
For deployment checklist: See `DEPLOYMENT-CHECKLIST.md`

---

## 🎉 You're Done!

Your CI/CD pipeline is now active. Every time you:
- **Push to develop** → Deploys to staging
- **Push to master** → Deploys to production
- **Create PR** → Runs tests automatically

No more manual deployments! 🚀
