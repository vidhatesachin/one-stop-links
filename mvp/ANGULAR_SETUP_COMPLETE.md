# OneLinks - Angular + Express Architecture

## 🎉 Successfully Created!

Your OneLinks SaaS platform is now ready with a complete **Angular 18 + Express** architecture!

---

## 📁 Project Structure

```
mvp/
├── backend/          # Node.js + Express + Prisma
│   ├── src/
│   │   ├── config/   # Database & Passport config
│   │   ├── middleware/
│   │   ├── routes/   # API endpoints
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── frontend/         # Angular 18 + Tailwind CSS
    ├── src/
    │   ├── app/
    │   │   ├── core/       # Services, guards, interceptors
    │   │   ├── features/   # Pages (landing, auth, dashboard, preview)
    │   │   └── models/     # TypeScript interfaces
    │   └── environments/
    └── package.json
```

---

## 🚀 Quick Start

### Step 1: Setup Backend

```powershell
cd backend
.\setup.ps1
```

This will:
- ✅ Install all dependencies
- ✅ Create .env file from template

**Configure Environment (.env):**

```env
# Database (Railway - Free)
DATABASE_URL="postgresql://user:pass@host:5432/onelinks"

# JWT
JWT_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Frontend
FRONTEND_URL="http://localhost:4200"
```

**Initialize Database:**

```powershell
npm run db:generate
npm run db:push
```

**Start Backend:**

```powershell
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### Step 2: Setup Frontend

```powershell
cd frontend
.\setup.ps1
```

This will:
- ✅ Install Angular CLI and dependencies
- ✅ Setup Tailwind CSS

**Start Frontend:**

```powershell
npm start
```

Frontend runs on: **http://localhost:4200**

---

## 🎯 What's Included

### Backend API (Express + Prisma)

✅ **Authentication**
- Google OAuth 2.0
- JWT tokens
- Passport.js integration

✅ **Business Management**
- CRUD operations
- Public/Private routes
- Slug-based URLs

✅ **Link Management**
- Create, update, delete links
- Click tracking
- Analytics

✅ **Analytics**
- Views, clicks tracking
- Daily aggregation
- Top links reporting

### Frontend (Angular 18)

✅ **Landing Page**
- Hero section
- Features showcase
- Pricing plans

✅ **Authentication**
- Google Sign-In
- Token management
- Route guards

✅ **Dashboard**
- Business list
- Quick actions
- User profile

✅ **Public Preview**
- Slug-based routing
- Customizable themes
- Click tracking

---

## 📊 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Angular 18 | Modern, TypeScript-first framework |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Backend** | Express.js | Fast, minimalist API |
| **Database** | PostgreSQL | Reliable, scalable database |
| **ORM** | Prisma | Type-safe database client |
| **Auth** | Passport.js + JWT | Secure authentication |
| **Hosting** | Vercel + Railway | Easy deployment |

---

## 🔐 Authentication Flow

1. User clicks "Login with Google"
2. Frontend redirects to: `GET /api/auth/google`
3. Google OAuth consent screen
4. Google redirects back with code
5. Backend exchanges code for user info
6. Backend creates/updates user in database
7. Backend generates JWT token
8. Redirects to frontend: `/auth/callback?token=...`
9. Frontend stores token in localStorage
10. All API requests include: `Authorization: Bearer <token>`

---

## 🛣️ API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

### Businesses
- `GET /api/businesses` - Get all businesses (protected)
- `GET /api/businesses/slug/:slug` - Get business by slug (public)
- `POST /api/businesses` - Create business (protected)
- `PATCH /api/businesses/:id` - Update business (protected)
- `DELETE /api/businesses/:id` - Delete business (protected)

### Links
- `GET /api/links/business/:businessId` - Get links (protected)
- `POST /api/links` - Create link (protected)
- `PATCH /api/links/:id` - Update link (protected)
- `DELETE /api/links/:id` - Delete link (protected)
- `POST /api/links/:id/click` - Track click (public)

### Analytics
- `GET /api/analytics/business/:businessId` - Get analytics (protected)
- `GET /api/analytics/business/:businessId/overview` - Get overview (protected)

---

## 🎨 Angular Architecture

### Core Module
- **Services**: Reusable business logic
  - `AuthService`: Authentication state management
  - `BusinessService`: Business CRUD operations
  
- **Guards**: Route protection
  - `authGuard`: Protect authenticated routes

- **Interceptors**: HTTP request/response handling
  - `authInterceptor`: Auto-attach JWT token

### Features
- **Landing**: Marketing page
- **Auth**: Login, callback
- **Dashboard**: User dashboard
- **Preview**: Public business pages

---

## 📝 Development Workflow

### Backend Development

```powershell
cd backend
npm run dev        # Start with hot reload
npm run db:studio  # Open Prisma Studio (DB GUI)
```

### Frontend Development

```powershell
cd frontend
npm start          # Start dev server
ng generate component features/new-feature  # Generate component
```

---

## 🧪 Testing

### Backend
```powershell
cd backend
# Add tests with Jest (coming soon)
```

### Frontend
```powershell
cd frontend
ng test            # Run unit tests
```

---

## 🚢 Deployment

### Backend (Railway)

1. Create Railway account
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Set environment variables

### Frontend (Vercel)

1. Create Vercel account
2. Import GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist/onelinks-frontend/browser`
5. Deploy!

---

## 🔄 Next Steps

### Week 1: Foundation ✅
- [x] Backend API setup
- [x] Database schema
- [x] Authentication flow
- [x] Angular app setup
- [x] Landing page
- [x] Login page
- [x] Dashboard skeleton

### Week 2: Core Features
- [ ] Business CRUD UI
- [ ] Link management UI
- [ ] Image upload (Cloudinary)
- [ ] Form validation
- [ ] Error handling

### Week 3: Themes & Preview
- [ ] 5 pre-built themes
- [ ] Theme selector
- [ ] Live preview
- [ ] Mobile optimization

### Week 4: Analytics & Polish
- [ ] Analytics dashboard
- [ ] Charts & graphs
- [ ] Performance optimization
- [ ] Testing & bug fixes

---

## 💡 Tips

### Backend Tips
- Use Prisma Studio to inspect database: `npm run db:studio`
- Check API logs in terminal for debugging
- Use Thunder Client/Postman to test APIs

### Frontend Tips
- Angular DevTools extension for debugging
- Use `ng serve --open` to auto-open browser
- Check browser console for errors

### Common Issues

**Backend won't start:**
- Check DATABASE_URL is correct
- Run `npm run db:generate` and `npm run db:push`
- Verify Google OAuth credentials

**Frontend shows errors:**
- Make sure backend is running
- Check API_URL in `environment.ts`
- Clear browser localStorage if auth issues

---

## 📚 Documentation

- [Angular Migration Plan](./ANGULAR_MIGRATION_PLAN.md)
- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

---

## 🤝 Need Help?

- **Angular**: https://angular.dev/
- **Prisma**: https://www.prisma.io/docs
- **Express**: https://expressjs.com/
- **Tailwind CSS**: https://tailwindcss.com/

---

## 🎉 You're All Set!

Your Angular + Express architecture is ready to go! Start both servers and visit:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **Prisma Studio**: http://localhost:5555 (after running `npm run db:studio`)

Happy coding! 🚀
