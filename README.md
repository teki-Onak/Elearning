# EduFlow — E-Learning Platform

A full-stack Next.js e-learning platform built to solve the key challenges of online education identified in your research:

- 📚 **Academic performance** → Structured courses, progress tracking, quizzes
- 💬 **Isolation & limited interaction** → Community forum, peer discussions
- 🎯 **Motivation** → Achievements, progress bars, gamification
- 💚 **Mental wellbeing** → Daily mood/stress/energy tracker with charts
- 📋 **Research surveys** → Built-in survey system with admin analytics
- 🛡️ **Admin dashboard** → Full user management, enrollment trends, wellbeing data

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | NextAuth.js (JWT sessions) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Notifications | React Hot Toast |

---

## 🚀 Quick Setup (15–20 minutes)

### Step 1 — Clone and install

```bash
git clone <your-repo-url>
cd elearn-platform
npm install
```

### Step 2 — Set up PostgreSQL database

Choose one of these free options:

**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com) → Create project
2. Go to Settings → Database → Copy "Connection string (URI)"

**Option B: Neon**
1. Go to [neon.tech](https://neon.tech) → Create project
2. Copy the connection string

**Option C: Local PostgreSQL**
```bash
createdb eduflow_db
# Connection: postgresql://localhost:5432/eduflow_db
```

### Step 3 — Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate your NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 4 — Set up database

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npx ts-node prisma/seed.ts  # Seed initial data
```

### Step 5 — Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default credentials:**
- Admin: `admin@eduflow.com` / `Admin@12345`
- Student: `student@eduflow.com` / `Student@123`

---

## 📁 Project Structure

```
elearn-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── api/
│   │   ├── auth/           # NextAuth + register
│   │   ├── courses/        # Course CRUD + enrollment
│   │   ├── progress/       # Lesson progress tracking
│   │   ├── wellbeing/      # Mood/stress/energy logging
│   │   ├── surveys/        # Research survey responses
│   │   ├── forum/          # Community posts & replies
│   │   ├── notifications/  # User notifications
│   │   └── admin/          # Admin stats & user management
│   ├── courses/            # Public course browsing
│   ├── dashboard/
│   │   ├── page.tsx        # Student/Admin dashboard
│   │   ├── courses/        # My enrolled courses
│   │   ├── progress/       # Progress analytics
│   │   ├── wellbeing/      # Wellbeing tracker
│   │   ├── surveys/        # Research surveys
│   │   ├── forum/          # Community forum
│   │   ├── achievements/   # Gamification
│   │   └── admin/          # Admin pages
│   └── page.tsx            # Landing page
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── AdminDashboard.tsx
│   └── courses/
│       └── CourseDetail.tsx
├── lib/
│   ├── prisma.ts           # Database client
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Helper functions
├── prisma/
│   ├── schema.prisma       # Full database schema
│   └── seed.ts             # Initial data
└── types/
    └── next-auth.d.ts      # Type definitions
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended — Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → Set to your Vercel domain (e.g., `https://myapp.vercel.app`)
4. Deploy!

### After deploying, run migrations:

```bash
# In Vercel, add a one-time build command or use the CLI:
npx prisma db push
```

---

## 📊 Things You Need to Configure

| What | Where | Notes |
|------|-------|-------|
| Database URL | `.env` → `DATABASE_URL` | Use Supabase/Neon free tier |
| Auth secret | `.env` → `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| App URL | `.env` → `NEXTAUTH_URL` | Your domain or localhost |
| File uploads | `.env` → Cloudinary keys | Optional — for course thumbnails & video |
| Email | `.env` → `RESEND_API_KEY` | Optional — for password resets |

---

## 🔧 Optional Features to Extend

- [ ] **Video lessons** — Integrate Cloudinary or Bunny CDN
- [ ] **Password reset** — Set up Resend email API
- [ ] **Quiz system** — Build out the Quiz model (schema ready)
- [ ] **Stripe payments** — For premium course access
- [ ] **Mobile app** — The API is REST-ready for React Native

---

## 📖 Research Connection

This platform directly addresses all 5 research objectives from your study:

1. ✅ **Academic performance** — Lesson completion, quiz scores, progress tracking
2. ✅ **Student challenges** — Wellbeing tracker identifies stress + energy issues
3. ✅ **Engagement & motivation** — Achievements, gamification, progress visualization
4. ✅ **Mental & emotional wellbeing** — Daily wellbeing log + 30-day trend charts
5. ✅ **Improvements to online learning** — Research surveys collect structured feedback

you will need to config the netework and the file to work well plus add every config file correctly 
