# 🚀 Quick Deployment Reference

## 3-Step Deployment (15 minutes total)

### Step 1: Deploy Frontend to Vercel (5 min)
```
1. Go to https://vercel.com → Sign Up with GitHub
2. Click "New Project" → Import Siter_FinalProject
3. Root Directory: client
4. Click "Deploy"
5. Copy your URL: https://xxx.vercel.app
```

### Step 2: Deploy Backend to Heroku (5 min)
```
1. Go to https://heroku.com → Sign Up
2. Click "New" → "Create new app"
3. Name: boxinator-api
4. Settings → Config Vars → Add all environment variables
5. In terminal:
   heroku login
   heroku git:remote -a boxinator-api
   git push heroku master
```

### Step 3: Connect Frontend to Backend (5 min)
```
In Vercel:
1. Settings → Environment Variables
2. REACT_APP_API_URL = https://boxinator-api.herokuapp.com
3. Deployments → Redeploy latest
```

---

## Environment Variables Needed

### Backend (Add to Heroku)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
FRONTEND_URL=https://xxx.vercel.app
```

### Frontend (Add to Vercel)
```
REACT_APP_API_URL=https://boxinator-api.herokuapp.com
```

---

## Test Your Deployment

```bash
# Test frontend
https://xxx.vercel.app

# Test backend
curl https://boxinator-api.herokuapp.com/health

# Test integration
Login → View shipments → Create shipment
```

---

## Your Live URLs (After Deployment)

- **Frontend:** `https://xxx.vercel.app`
- **Backend API:** `https://boxinator-api.herokuapp.com`

---

## Troubleshooting Commands

```bash
# Check backend logs
heroku logs --tail

# Restart backend
heroku restart

# Rollback deployment
heroku rollback

# View backend status
heroku ps
```

---

## Enable CI/CD (Optional but Recommended)

Add to GitHub Secrets:
- `VERCEL_TOKEN` (from Vercel)
- `VERCEL_ORG_ID` (from Vercel)
- `VERCEL_PROJECT_ID` (from Vercel)
- `HEROKU_API_KEY` (from Heroku)
- `HEROKU_APP_NAME` (boxinator-api)

Then:
- Push to `master` → Auto-deploys to production
- Push to `develop` → Auto-deploys to staging

---

## Support

📖 Full guide: See `DEPLOYMENT-GUIDE.md`
🔧 Setup guide: See `CI-CD-SETUP.md`
✅ Checklist: See `DEPLOYMENT-CHECKLIST.md`

---

**Ready to deploy? Let's go! 🚀**
