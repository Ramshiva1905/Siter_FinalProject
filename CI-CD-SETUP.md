# Boxinator CI/CD Pipeline Setup Guide

## Overview

This document guides you through setting up the complete CI/CD pipeline for automatic testing and deployment.

## Architecture

```
GitHub (master/develop)
    ↓
GitHub Actions (Tests & Build)
    ↓
Vercel (Frontend) + Heroku (Backend)
    ↓
Production / Staging
```

## Part 1: GitHub Secrets Setup

Before the CI/CD pipeline can deploy, you need to configure GitHub Secrets.

### Steps:
1. Go to: `https://github.com/Ramshiva1905/Siter_FinalProject/settings/secrets/actions`
2. Click "New repository secret"
3. Add the following secrets:

#### For Frontend (Vercel Deployment):
```
VERCEL_TOKEN          → Get from https://vercel.com/account/tokens
VERCEL_ORG_ID         → Your Vercel org ID
VERCEL_PROJECT_ID     → Your Vercel project ID
```

#### For Backend (Heroku Deployment - if using):
```
HEROKU_API_KEY        → Get from https://dashboard.heroku.com/account
HEROKU_APP_NAME       → Your Heroku app name
HEROKU_EMAIL          → Your Heroku email
```

#### For Database:
```
DATABASE_URL          → Your production database URL (Supabase, AWS RDS, etc.)
DIRECT_URL            → Direct database connection URL (for migrations)
```

#### Other Secrets:
```
JWT_SECRET            → Your JWT secret key
SMTP_HOST             → Email service SMTP host
SMTP_USER             → Email service username
SMTP_PASS             → Email service password
```

## Part 2: Branch Strategy

We use a 3-branch strategy:

### master branch
- **Production environment**
- Only merge via pull requests
- All tests must pass
- Automatically deploys to production

### develop branch
- **Staging environment**
- For testing features before production
- Automatically deploys to staging

### feature/* branches
- **Development**
- Create PR to `develop` for review
- All checks must pass before merge

## Part 3: Deployment Workflow

### Adding a New Feature:

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. Make your changes
# ... edit files ...

# 3. Commit and push
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature

# 4. Create Pull Request
# - Go to GitHub
# - Click "Compare & pull request"
# - Set base to `develop`
# - GitHub Actions automatically runs tests

# 5. If tests pass and review approved:
# - Merge to develop
# - Automatically deploys to staging

# 6. When ready for production:
# - Create PR from develop → master
# - Merge to master
# - Automatically deploys to production
```

## Part 4: Frontend Deployment (Vercel)

### Setup:

1. **Create Vercel Project**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repo
   - Framework: React
   - Build Command: `npm run build` (inside client folder)
   - Output Directory: `client/build`

2. **Configure Environment Variables in Vercel**
   - Add in Vercel dashboard:
     ```
     REACT_APP_API_URL=https://api.boxinator.com
     ```

3. **Get Vercel Token**
   - Account Settings → Tokens
   - Copy token to GitHub Secrets as `VERCEL_TOKEN`

### Automatic Deployment:
- On merge to `master`: Deploys to Production
- On PR: Shows preview deployment link

## Part 5: Backend Deployment (Heroku)

### Setup:

1. **Create Heroku App**
   ```bash
   heroku login
   heroku create boxinator-api-prod
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set DATABASE_URL=<your-database-url>
   heroku config:set JWT_SECRET=<your-secret>
   heroku config:set SMTP_HOST=<smtp-host>
   heroku config:set SMTP_USER=<smtp-user>
   heroku config:set SMTP_PASS=<smtp-pass>
   ```

3. **Add Procfile** (already created in repo)
   - Heroku uses this to know how to start your app

4. **Deploy Manually First**
   ```bash
   git push heroku master
   ```

5. **Get Heroku API Key**
   - Account Settings → API Token
   - Copy to GitHub Secrets

### Automatic Deployment:
- Update backend CI workflow with Heroku deployment
- On merge to `master`: Deploys to Production

## Part 6: Database Migrations

### Automatic Migrations:
- GitHub Actions runs `prisma migrate deploy` before deployment
- Ensures database schema is updated

### Manual Migration (if needed):
```bash
# Generate new migration
npx prisma migrate dev --name add_new_field

# Deploy migration
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Part 7: Monitoring Deployments

### View Deployment Status:
1. Go to your GitHub repo
2. Click "Actions" tab
3. See all workflow runs
4. Click on a run to see details
5. Logs show build output

### Failed Deployment:
- Check the logs in GitHub Actions
- Fix the issue
- Push a new commit (automatically retries)

## Part 8: Monitoring Errors in Production

### Frontend (Vercel):
- Vercel Analytics dashboard
- Error tracking through logs

### Backend (Heroku):
```bash
heroku logs --tail
```

### Database:
- Check Supabase/RDS dashboard for queries

## Part 9: Rollback Procedure

### Frontend (Vercel):
1. Go to Vercel dashboard
2. Deployments tab
3. Click previous deployment
4. Click "Promote to Production"

### Backend (Heroku):
```bash
# View releases
heroku releases

# Rollback to previous version
heroku rollback
```

## Quick Reference

### Deploy to Staging:
```bash
git checkout develop
git pull
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "feat: new feature"
git push origin feature/new-feature
# Create PR to develop branch
```

### Deploy to Production:
```bash
# After staging is tested and approved:
# Go to GitHub
# Create PR from develop → master
# Merge after approval
# Automatic deployment to production
```

### Check Deployment Status:
```
GitHub Repo → Actions Tab → See all workflow runs
```

## Troubleshooting

### Frontend build fails:
- Check environment variables in Vercel
- Verify `REACT_APP_API_URL` is set correctly
- Check client/package.json for build script

### Backend deployment fails:
- Check Heroku logs: `heroku logs --tail`
- Verify environment variables are set
- Check database connection

### Database migration fails:
- Check Supabase/RDS status
- Verify DATABASE_URL is correct
- Try running migration locally first

## Next Steps

1. ✅ Create Vercel account and add GitHub Secrets
2. ✅ Create Heroku account and add GitHub Secrets
3. ✅ Update GitHub workflows with your deployment URLs
4. ✅ Test with a feature branch PR
5. ✅ Monitor first production deployment
