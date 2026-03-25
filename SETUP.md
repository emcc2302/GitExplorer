# 🚀 GitExplorer Setup Guide

## ⚡ Quick Start (Local Development)

### The .env files are ALREADY configured for local dev. Just run:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm start
# ✅ Starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
# ✅ Opens on http://localhost:3001
```

**Open:** http://localhost:3001 — done!

---

## 🌐 Deploy to Production (Render + Vercel)

### Backend (Render) — Environment Variables:
Set these in your Render dashboard under Environment:
```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
GITHUB_API_KEY=your_github_personal_access_token
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-render-app.onrender.com/api/auth/github/callback
CLIENT_BASE_URL=https://your-vercel-app.vercel.app
SESSION_SECRET=any_random_long_string
```

### Frontend (Vercel) — Environment Variables:
Set this in Vercel dashboard under Settings → Environment Variables:
```
VITE_API_BASE_URL=https://your-render-app.onrender.com
```
---

## ❗ Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Failed to fetch` | Backend not running | Run `npm start` in the `backend/` folder |
| `OAuth2Strategy requires clientID` | `.env` not found | Make sure `backend/.env` exists |
| `No repos found` + `Failed to fetch` | Wrong API URL | Check `VITE_API_BASE_URL` in `frontend/.env` |
| Login not working locally | Cookie issue | Do NOT set `NODE_ENV=production` locally |
