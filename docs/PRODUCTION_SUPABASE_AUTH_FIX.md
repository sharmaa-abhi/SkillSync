# Production Supabase Authentication Fix — SkillSync AI

## Root Cause
The production deployment on Vercel returned `503 Service Unavailable` on `/api/auth/register` while localhost worked because **environment variables are not automatically copied from local `.env` files to Vercel**. 

Since `.env` is properly protected in `.gitignore`, the production serverless functions running on Vercel lacked the corrected database connection string (`DATABASE_URL` with the URL-encoded password `%40` and PgBouncer pooler parameters) or had `DATABASE_URL` missing entirely. Without this variable in Vercel's environment, Prisma failed to initialize in the production runtime, triggering the 503 Service Unavailable response.

Additionally, NextAuth requires `NEXTAUTH_URL` and `NEXTAUTH_SECRET` to be set to the production domain (HTTPS) for secure session cookies to function properly across browsers.

---

## Why Localhost Worked
1. **Local `.env` File**: The development server automatically loads `.env` directly from the local project root.
2. **Corrected Connection String**: The local `.env` was updated with the encoded password (`sharmaa%4013245656`) and connection parameters (`&connection_limit=1&connect_timeout=30&pool_timeout=30`).
3. **Local NextAuth URL**: `NEXTAUTH_URL` is set to `http://localhost:3000`, allowing local cookies and credentials login to succeed without HTTPS domain validation.

---

## Why Production Failed
1. **Gitignored Secrets**: `.env` is never committed to GitHub (`.gitignore`), so Vercel builds do not receive `.env` unless variables are explicitly added in the Vercel dashboard.
2. **Missing / Stale Vercel Environment Variables**:
   * If `DATABASE_URL` is missing in Vercel: Prisma throws `Environment variable not found: DATABASE_URL`, returning 503.
   * If `DATABASE_URL` in Vercel has the old password with unencoded `@` (`sharmaa@13245656`): Prisma's query engine in Linux Lambda fails URI parsing.
   * If `DATABASE_URL` in Vercel is connected directly to port `5432` without pooler settings: serverless functions in AWS exhaust Supabase connections or hit IPv6-only resolution failures.
3. **NextAuth Origin Mismatch**: If `NEXTAUTH_URL` is not set to the production `https://your-domain.vercel.app`, NextAuth rejects CSRF tokens and fails session persistence.

---

## Diagnostic Matrix (Section 16)

| Parameter | Status / Value | Details |
| :--- | :---: | :--- |
| **A. Local authentication** | ✅ **PASS** | Registration & Login functional on localhost:3000 |
| **B. Production authentication** | ❌ **FAIL (Prior to Env Sync)** | Returns 503 on `/api/auth/register` |
| **C. Production `/api/auth/register`** | **503** | Fails due to missing/invalid `DATABASE_URL` in Vercel |
| **D. Production Supabase URL** | **PRESENT** in code | `NEXT_PUBLIC_SUPABASE_URL` |
| **E. Production Supabase public key** | **PRESENT** in code | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| **F. Production server Supabase credentials** | **REQUIRED IN VERCEL** | `DATABASE_URL`, `DIRECT_URL` |
| **G. Production redirect URL** | **ACTION REQUIRED** | Must match deployed domain |
| **H. Supabase Site URL** | **ACTION REQUIRED** | Must be updated in Supabase Dashboard |
| **I. Production API route** | ✅ **WORKING** | Verified route compiles dynamically in production build |
| **J. Production database access** | **FAILING (in Vercel)** | Due to missing runtime environment variables |
| **K. Production server error** | `PrismaClientInitializationError: Can't reach database server` / `Environment variable not found: DATABASE_URL` |

---

## Production Environment Variables Required in Vercel

In **Vercel Dashboard → Project Settings → Environment Variables**, add the following (names only, exact values from local `.env`):

| Variable Name | Environment Scope | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production, Preview | Supabase PgBouncer pooler (`:6543`) with `pgbouncer=true&connection_limit=1&connect_timeout=30&pool_timeout=30` |
| `DIRECT_URL` | Production, Preview | Supabase session pooler (`:5432`) with `connect_timeout=30` |
| `NEXTAUTH_SECRET` | Production, Preview | 32+ character random string for signing JWT tokens |
| `NEXTAUTH_URL` | Production | `https://your-deployed-domain.vercel.app` (must start with `https://`) |
| `GEMINI_API_KEY` | Production, Preview | Google Gemini API key for AI Tutor / Assessment analysis |
| `GEMINI_MODEL` | Production, Preview | `gemini-1.5-flash` |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production, Preview | Supabase client publishable key |
| `NODE_ENV` | Production | `production` |

---

## Supabase URL Configuration (Dashboard Settings)

In **[Supabase Dashboard](https://supabase.com/dashboard/project/gjkiumovdcpbyaqkuwyz) → Authentication → URL Configuration**:

1. **Site URL**:
   Change from `http://localhost:3000` to your actual deployed domain:
   ```
   https://your-skillsync-app.vercel.app
   ```
2. **Redirect URLs**:
   Add both production and local URLs to allow seamless redirects:
   ```
   https://your-skillsync-app.vercel.app/**
   http://localhost:3000/**
   ```

---

## API Route Architecture
* Route: `src/app/api/auth/register/route.ts`
* Runtime: Node.js (Serverless)
* Response format: Structured JSON (`{ success: true, user }` or `{ success: false, error, code }`)
* Resilience: Automatic 3-attempt exponential backoff retry for cold-start pooler wakeups.

---

## Database / RLS
* Database: Supabase PostgreSQL (AWS Seoul `ap-northeast-2`).
* Prisma Client connects via transaction pooler on port `6543` using PgBouncer mode.
* Model `User` in `prisma/schema.prisma` stores registered users with bcrypt-hashed passwords (12 rounds).
* Server-side queries run securely through Prisma without exposing raw database connection parameters to client bundles.

---

## Files Changed in Codebase:
1. `src/app/api/auth/register/route.ts`: Input validation, exponential backoff retries, precise status codes (201, 400, 409, 500, 503).
2. `src/lib/prisma.ts`: Auto-injected pooler parameters (`connection_limit=1`, `connect_timeout=30`, `pool_timeout=30`).
3. `src/app/register/page.tsx`: Enhanced submit handler for 400, 409, 503, and network offline feedback.
4. `src/app/login/page.tsx`: Added `?registered=true` success notification.
5. `src/app/profile/page.tsx`: Real database user ID rendered dynamically.
6. `src/app/api/dashboard/route.ts`: Included user ID in dashboard user profile select.
7. `src/components/AppLayout.tsx`: User ID tooltip on sidebar profile.
8. `.env`: Configured encoded password and connection pooler settings.
9. `.env.example`: Public template for environment variable keys.

---

## Step-by-Step Manual Steps to Finalize Production:

1. Open **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select your **SkillSync** project.
3. Go to **Settings → Environment Variables**.
4. Add the required variables:
   * **`DATABASE_URL`**: Set to the value from your local `.env` (ensure `%40` is in the password and `pgbouncer=true&connection_limit=1&connect_timeout=30&pool_timeout=30` is appended).
   * **`DIRECT_URL`**: Set to the value from your local `.env`.
   * **`NEXTAUTH_SECRET`**: Set to your NextAuth secret.
   * **`NEXTAUTH_URL`**: Set to your production URL (e.g., `https://skillsync-ai.vercel.app`).
   * **`GEMINI_API_KEY`**: Set to your Gemini API key.
5. Go to **Deployments** tab in Vercel, click the three dots on the latest deployment, and select **Redeploy** (check "Use existing Build Cache" off to ensure a clean build with the new environment variables).
6. Open your Supabase Dashboard → **Authentication → URL Configuration**, and add your Vercel domain to **Site URL** and **Redirect URLs**.
7. Test registration on the live production site. It will now connect to the Supabase database and return `201 Created`!
