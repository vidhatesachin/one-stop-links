# Quick Start Guide - Angular Version

## ⚡ 5-Minute Setup

### Terminal 1: Backend

```powershell
cd mvp\backend
.\setup.ps1

# Edit .env file with your credentials

npm run db:generate
npm run db:push
npm run dev
```

### Terminal 2: Frontend

```powershell
cd mvp\frontend
.\setup.ps1
npm start
```

### Open Browser

**Frontend**: http://localhost:4200  
**Backend API**: http://localhost:5000

---

## 🔑 Required Setup

### 1. Railway Database (Free)
1. Sign up at https://railway.app
2. Create PostgreSQL database
3. Copy `DATABASE_URL`
4. Paste in `backend/.env`

### 2. Google OAuth
1. Go to https://console.cloud.google.com
2. Create project
3. Enable Google+ API
4. Create OAuth client ID
5. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID & Secret
7. Paste in `backend/.env`

### 3. JWT Secret
```powershell
# Generate random secret
$bytes = New-Object Byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```
Copy output to `JWT_SECRET` in `backend/.env`

---

## ✅ Verify Setup

1. Backend running: http://localhost:5000/health
2. Frontend running: http://localhost:4200
3. Can click "Get Started" → See login page
4. Can login with Google

---

## 🎯 First Business

1. Login with Google
2. Go to Dashboard
3. Click "Create Business"
4. Fill in:
   - Name: "My Business"
   - Slug: "mybiz"
5. Save
6. Visit: http://localhost:4200/mybiz

---

Done! 🚀
