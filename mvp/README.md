# OneLinks - Angular Version

## Overview

This is the **Angular + Express** version of OneLinks SaaS platform.

### Architecture

- **Frontend**: Angular 18 + Tailwind CSS (Port 4200)
- **Backend**: Node.js + Express + Prisma (Port 5000)
- **Database**: PostgreSQL (Railway)
- **Authentication**: Google OAuth + JWT

---

## Quick Start

### Option 1: Automated Setup (Recommended)

```powershell
cd mvp
.\setup-all.ps1
```

### Option 2: Manual Setup

**Backend:**
```powershell
cd mvp\backend
.\setup.ps1
```

**Frontend:**
```powershell
cd mvp\frontend
.\setup.ps1
```

---

## Project Structure

```
mvp/
├── backend/          # Express API
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.ts
│   └── prisma/
│       └── schema.prisma
│
├── frontend/         # Angular App
│   └── src/
│       └── app/
│           ├── core/
│           ├── features/
│           └── models/
│
├── ANGULAR_SETUP_COMPLETE.md
├── QUICK_START_ANGULAR.md
└── setup-all.ps1
```

---

## Documentation

- **[ANGULAR_SETUP_COMPLETE.md](./ANGULAR_SETUP_COMPLETE.md)** - Complete setup guide
- **[QUICK_START_ANGULAR.md](./QUICK_START_ANGULAR.md)** - 5-minute quick start
- **[ANGULAR_MIGRATION_PLAN.md](./ANGULAR_MIGRATION_PLAN.md)** - Migration details

---

## Features

✅ **Authentication**
- Google OAuth 2.0
- JWT tokens
- Protected routes

✅ **Business Management**
- Create/Edit/Delete businesses
- Custom slugs
- Theme customization

✅ **Link Management**
- Unlimited links
- Social media icons
- Drag & drop ordering

✅ **Analytics**
- Views tracking
- Click tracking
- Top links

✅ **Public Pages**
- Custom themes
- Mobile responsive
- Fast loading

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Angular 18 |
| Styling | Tailwind CSS |
| Backend | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Passport.js + JWT |
| Deployment | Vercel + Railway |

---

## Development

### Start Backend
```powershell
cd backend
npm run dev
```

### Start Frontend
```powershell
cd frontend
npm start
```

### Database Tools
```powershell
cd backend
npm run db:studio  # Open Prisma Studio
```

---

## Deployment

### Backend → Railway
1. Push to GitHub
2. Create Railway project
3. Add PostgreSQL
4. Deploy from GitHub
5. Set environment variables

### Frontend → Vercel
1. Push to GitHub
2. Import to Vercel
3. Set build command: `npm run build`
4. Set output: `dist/onelinks-frontend/browser`
5. Deploy!

---

## Support

- Angular: https://angular.dev/
- Express: https://expressjs.com/
- Prisma: https://www.prisma.io/docs

---

**Ready to build something awesome? 🚀**
