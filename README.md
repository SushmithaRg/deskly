# Deskly — Enterprise Operations Platform

Full-stack Deskly app: **Vite + React frontend**, **Express + Prisma backend**, **PostgreSQL** database. Deploys as a single Vercel project (static frontend + serverless API functions).

## Project structure

```
├── src/
│   ├── App.tsx / components/   # React frontend (Vite)
│   ├── api/client.ts           # Frontend API client (relative /api/v1)
│   ├── services/authStore.ts   # JWT session management
│   └── backend/                # Express server (auth, tasks, leaves, etc.)
├── api/index.ts                # Vercel serverless entry (wraps Express via serverless-http)
├── prisma/schema.prisma        # PostgreSQL schema
└── vercel.json                 # Vercel build + rewrites
```

## Local development

1. Have PostgreSQL running and create a database:

   ```bash
   createdb deskly_app
   ```

2. Copy the env template and set your DB password:

   ```bash
   cp .env.example .env
   # edit DATABASE_URL, JWT_SECRET
   ```

3. Install, sync schema, seed demo data, and run:

   ```bash
   npm install
   npm run setup       # prisma db push + seed (creates demo accounts)
   npm run dev         # backend :5000 + frontend :5173
   ```

Demo accounts (password `Deskly@123`):

| Email | Role |
| --- | --- |
| `sushmitha.rg@company.com` | SUPER_ADMIN |
| `priya.sharma@company.com` | MANAGER |
| `arjun.nair@company.com` | EMPLOYEE |

## Deploy to Vercel

The project is pre-configured for Vercel — `vercel.json` sets the build command and rewrites `/api/*` to the serverless Express function.

### 1. Create a hosted PostgreSQL database

Use Neon, Supabase, Railway, or any managed Postgres. Copy the **pooled/HTTP** connection string they give you (it looks like `postgresql://user:pass@host:5432/dbname?sslmode=require`).

### 2. Set environment variables in Vercel

Project Settings → Environment Variables (apply to **Production**, **Preview**, and **Development**):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Hosted PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Long random string (`openssl rand -base64 32`) |
| `FRONTEND_URL` | Optional | Your site origin, e.g. `https://deskly.vercel.app` |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Optional | Real email alerts (Gmail app password) |

### 3. Build settings (auto-detected)

- Framework: **Vite**
- Build Command: `npm run vercel-build`
- Output Directory: `dist`

`npm run vercel-build` automatically:
1. `prisma generate` — generates the Prisma client for the Linux runtime
2. `prisma db push` — creates/updates the PostgreSQL schema in your hosted DB
3. `npm run build` — builds the React frontend

### 4. Import and deploy

Connect your GitHub repo (`SushmithaRg/deskly`) in Vercel, or use the CLI:

```bash
npm i -g vercel
vercel            # dev environment
vercel --prod     # production
```

### 5. Seed the production database (optional)

After the first deploy, run the seeder once against your hosted DB so demo data exists:

```bash
DATABASE_URL="postgresql://..." npx tsx src/backend/seedDatabase.ts
```

## Troubleshooting login issues

- **Login returns 500 / "Login failed"** → the `User` table is missing or the DB is unreachable. Confirm `DATABASE_URL` is set in Vercel and the deploy logs show `prisma db push` succeeded.
- **Prisma engine errors on deploy** → make sure the Build Command is `npm run vercel-build` (it runs `prisma generate`).
- **`EPERM` while running `prisma` on Windows locally** → stop the dev server first (`npm run dev` holds `query_engine-windows.dll.node`), then run `npm run vercel-build`. This only affects local Windows machines, not Vercel builds.
- **CORS errors** → set `FRONTEND_URL` to your site origin (same-origin deploys don't need it).

## Notes

- File uploads go to `/tmp/uploads` on Vercel (ephemeral). For persistent uploads, wire S3/Supabase Storage.
- The Prisma client is a global singleton to avoid connection exhaustion in serverless.
- No API keys, secrets, or `.env` files are committed — use Vercel env vars instead.
