# OneLinks - System Architecture (Angular Version)

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:4200                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   ANGULAR FRONTEND                               │
│                   (Port 4200)                                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Landing    │  │     Auth     │  │  Dashboard   │         │
│  │    Page      │  │   (Login)    │  │     Page     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Preview    │  │  Auth Guard  │  │    HTTP      │         │
│  │  (/:slug)    │  │  (Routes)    │  │ Interceptor  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Services: AuthService, BusinessService, AnalyticsService       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API
                         │ Authorization: Bearer <JWT>
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    EXPRESS BACKEND                               │
│                    (Port 5000)                                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │  Helmet  │ │   CORS   │ │  Morgan  │ │ Passport │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API ROUTES                            │   │
│  │  ┌────────────────┐  ┌────────────────┐                 │   │
│  │  │  /api/auth     │  │  /api/businesses│                │   │
│  │  │  - Google      │  │  - CRUD         │                │   │
│  │  │  - JWT Login   │  │  - Public view  │                │   │
│  │  └────────────────┘  └────────────────┘                 │   │
│  │                                                           │   │
│  │  ┌────────────────┐  ┌────────────────┐                 │   │
│  │  │  /api/links    │  │  /api/analytics │                │   │
│  │  │  - CRUD        │  │  - Views/Clicks │                │   │
│  │  │  - Click track │  │  - Stats        │                │   │
│  │  └────────────────┘  └────────────────┘                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  AUTHENTICATION                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Passport.js                                      │   │   │
│  │  │  - Google OAuth Strategy                          │   │   │
│  │  │  - JWT Strategy                                   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                            │
│                   (Railway / Local)                              │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  User    │  │ Business │  │   Link   │  │ Contact  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Analytics │  │  Click   │  │ Account  │  │ Session  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  User   │                 │ Angular │                 │ Express │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │  Click "Login"            │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │  GET /api/auth/google     │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  Redirect to Google OAuth │
     │                           │<──────────────────────────┤
     │                           │                           │
     │  Google Consent Screen    │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │  Approve                  │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │  Google redirects back    │
     │                           │  with authorization code  │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  Create/Update User       │
     │                           │  Generate JWT Token       │
     │                           │                           │
     │  Redirect to              │                           │
     │  /auth/callback?token=... │                           │
     │<──────────────────────────┤<──────────────────────────┤
     │                           │                           │
     │                           │  Store token in           │
     │                           │  localStorage             │
     │                           │                           │
     │                           │  GET /api/auth/me         │
     │                           │  Authorization: Bearer... │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  Return user data         │
     │                           │<──────────────────────────┤
     │                           │                           │
     │  Redirect to Dashboard    │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
```

---

## 📊 Data Flow - Public Business Page

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  User   │                 │ Angular │                 │ Express │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │  Visit /:slug             │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │  GET /api/businesses/     │
     │                           │      slug/:slug           │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │                           ├────┐
     │                           │                           │    │ Find Business
     │                           │                           │    │ Include Links
     │                           │                           │    │ Include Contacts
     │                           │                           │<───┘
     │                           │                           │
     │                           │                           ├────┐
     │                           │                           │    │ Track View
     │                           │                           │    │ Analytics++
     │                           │                           │<───┘
     │                           │                           │
     │                           │  Return business data     │
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           ├────┐                      │
     │                           │    │ Render with theme    │
     │                           │    │ Apply colors         │
     │                           │    │ Show links           │
     │                           │<───┘                      │
     │                           │                           │
     │  Display page             │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │  Click on Link            │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │  POST /api/links/:id/click│
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │                           ├────┐
     │                           │                           │    │ Log Click
     │                           │                           │    │ Analytics++
     │                           │                           │<───┘
     │                           │                           │
     │                           │  Success                  │
     │                           │<──────────────────────────┤
     │                           │                           │
     │  Redirect to link URL     │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
```

---

## 🗄️ Database Schema

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (unique)      │
│ name                │
│ image               │
│ googleId (unique)   │
│ planTier (enum)     │
│ stripeCustomerId    │
│ createdAt           │
└──────────┬──────────┘
           │ 1
           │
           │ N
┌──────────▼──────────┐       ┌─────────────────────┐
│     Business        │       │      Analytics      │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │<──┐   │ id (PK)             │
│ userId (FK)         │   │   │ businessId (FK)     │
│ name                │   │   │ date                │
│ slug (unique)       │   │   │ views               │
│ logo                │   │   │ uniqueViews         │
│ bio                 │   │   │ clicks              │
│ theme               │   └───│ (relationship)      │
│ primaryColor        │       └─────────────────────┘
│ bgColor             │
│ textColor           │
│ published           │
│ createdAt           │
└──────────┬──────────┘
           │ 1
           │
           ├────────────┬────────────┐
           │ N          │ N          │
┌──────────▼──────────┐ ┌────────────▼──────┐
│       Link          │ │     Contact       │
├─────────────────────┤ ├───────────────────┤
│ id (PK)             │ │ id (PK)           │
│ businessId (FK)     │ │ businessId (FK)   │
│ title               │ │ type (enum)       │
│ url                 │ │ value             │
│ icon                │ │ label             │
│ platform            │ │ order             │
│ order               │ │ isActive          │
│ isActive            │ └───────────────────┘
│ createdAt           │
└──────────┬──────────┘
           │ 1
           │
           │ N
┌──────────▼──────────┐
│       Click         │
├─────────────────────┤
│ id (PK)             │
│ linkId (FK)         │
│ timestamp           │
│ country             │
│ device              │
│ browser             │
└─────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│   Vercel (Frontend)  │              │ Railway (Backend)    │
│   Angular SSR/SPA    │              │ Express API          │
│   Port 443 (HTTPS)   │◄────────────►│ Port 443 (HTTPS)     │
│                      │   REST API   │                      │
│   - Global CDN       │              │   - Auto-scaling     │
│   - Auto-deploy      │              │   - Auto-deploy      │
│   - Custom domain    │              │   - Health checks    │
└──────────────────────┘              └──────────┬───────────┘
                                                 │
                                                 │
                                      ┌──────────▼───────────┐
                                      │ Railway PostgreSQL   │
                                      │ Database             │
                                      │                      │
                                      │   - Auto backups     │
                                      │   - Managed service  │
                                      │   - Secure           │
                                      └──────────────────────┘

External Services:
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Google OAuth   │  │   Cloudinary   │  │     Stripe     │
│ Authentication │  │  Image Hosting │  │    Payments    │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## 📦 Component Breakdown

### Frontend (Angular)

```
src/app/
├── core/                       # Singleton services
│   ├── guards/
│   │   └── auth.guard.ts       # Protect routes
│   ├── interceptors/
│   │   └── auth.interceptor.ts # Add JWT to requests
│   └── services/
│       ├── auth.service.ts     # Auth state management
│       └── business.service.ts # Business CRUD
│
├── features/                   # Lazy-loaded modules
│   ├── landing/
│   │   ├── landing.component.ts
│   │   └── landing.component.html
│   ├── auth/
│   │   ├── login/
│   │   └── callback/
│   ├── dashboard/
│   │   └── dashboard.component.ts
│   └── preview/
│       └── preview.component.ts
│
├── models/
│   └── types.ts                # TypeScript interfaces
│
└── app.routes.ts               # Route configuration
```

### Backend (Express)

```
src/
├── config/
│   ├── database.ts             # Prisma client
│   └── passport.ts             # Auth strategies
│
├── middleware/
│   ├── auth.middleware.ts      # JWT verification
│   └── error.middleware.ts     # Error handling
│
├── routes/
│   ├── auth.routes.ts          # /api/auth
│   ├── business.routes.ts      # /api/businesses
│   ├── link.routes.ts          # /api/links
│   └── analytics.routes.ts     # /api/analytics
│
└── server.ts                   # Express app
```

---

## 🔄 Development vs Production

| Feature | Development | Production |
|---------|-------------|-----------|
| Frontend | http://localhost:4200 | https://yourdomain.com |
| Backend | http://localhost:5000 | https://api.yourdomain.com |
| Database | Local PostgreSQL | Railway PostgreSQL |
| Auth | Google OAuth (localhost) | Google OAuth (production domain) |
| CORS | localhost:4200 | yourdomain.com |
| HTTPS | No | Yes (automatic) |
| Build | `ng serve` | `ng build --configuration=production` |

---

This architecture provides:
- ✅ **Scalability**: Independent frontend/backend scaling
- ✅ **Security**: JWT tokens, HTTPS, CORS protection
- ✅ **Performance**: CDN for frontend, database indexing
- ✅ **Maintainability**: Clean separation of concerns
- ✅ **Reliability**: Health checks, error handling, logging
