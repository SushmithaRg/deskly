# Deskly — Vercel Deployment Guide

This project includes a full-stack Deskly app (Vite React frontend + Express/Prisma backend). The backend is adapted to run on Vercel serverless functions.

Quick steps to deploy to Vercel:

1. Set Environment Variables in Vercel Dashboard (Project Settings → Environment Variables):
   - `DATABASE_URL` — PostgreSQL connection (required)
   - `JWT_SECRET` — JWT signing secret
   - `GMAIL_USER` and `GMAIL_APP_PASSWORD` — optional for real email alerts
   - `FRONTEND_URL` — set to your frontend origin if needed (e.g. `https://your-site.vercel.app`)

2. Build settings (Vercel will detect automatically):
   - Build Command: `npm run vercel-build` (runs `prisma generate` then builds frontend)
   - Output Directory: `dist`

3. Ensure a hosted PostgreSQL is available (e.g., Supabase, ElephantSQL, Neon) and set `DATABASE_URL` accordingly.

4. Deploy
   - Push to the repository and import the project in Vercel, or use the Vercel CLI.

Notes and implementation details
- The Express app is exported from `src/backend/server.ts` and wrapped with `serverless-http` in `api/index.ts` so Vercel can run the API as serverless functions.
- Prisma client is instantiated with a global singleton to avoid connection exhaustion in serverless environments.
- File uploads are written to `/tmp/uploads` when running on Vercel (see `UPLOAD_DIR` and `process.env.VERCEL`). Vercel's filesystem is ephemeral — upload persistence requires remote storage (S3, Supabase Storage, etc.).
- The project includes `vercel.json` with rewrites for `/api/*` to the serverless function index.

Local development
- Run PostgreSQL locally (or point `DATABASE_URL` to a local DB), then:

```bash
npm install
npm run setup   # pushes Prisma schema and seeds the DB
npm run dev     # starts backend + frontend locally
```

If you want, I can also:
- Add a `Dockerfile` for deploying a single container instead of serverless.
- Wire S3/Supabase storage for persistent uploads on Vercel.

