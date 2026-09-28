# SkillSync AI — Troubleshooting & Incident Resolution Guide

**Version:** 2.0  
**Last Updated:** September 2026  
**Status:** Active  

This document serves as the central troubleshooting manual and post-mortem resolution reference for SkillSync AI. It consolidates the root causes, architecture fixes, and verification procedures for known infrastructure, deployment, and authentication issues.

---

## 1. Quick Diagnostic Matrix

| Issue | Environment | Symptoms | Primary Fix |
| :--- | :---: | :--- | :--- |
| **Password Encoding Error** | Local & Production | Prisma fails to parse URI; handshake error with Supabase | URL-encode `@` to `%40` in `DATABASE_URL` |
| **PgBouncer Pool Exhaustion** | Production / Serverless | Intermittent 503 errors, pool timeout, dropped connections | Add `connection_limit=1&connect_timeout=30&pool_timeout=30` |
| **Vercel 503 on `/api/auth/register`** | Production | Registration fails on Vercel but works on localhost | Add missing env vars to Vercel Dashboard and redeploy |
| **"No users in your project" in Supabase** | Local & Production | Users exist in Postgres `User` table but not Supabase Auth | Use `@supabase/supabase-js` `admin.createUser` in register route |
| **NextAuth Cookie/Session Drops** | Production | Login redirects back to login; CSRF failure | Ensure `NEXTAUTH_URL` uses production `https://` domain |

---

## 2. Incident: Registration 503 & Supabase Authentication Disconnect

### A. Root Cause Analysis

1. **Unencoded Special Characters in `DATABASE_URL`**:
   The PostgreSQL connection string contained an unencoded `@` in the password. In RFC 3986 URI parsing, `@` is the delimiter between `user:password` credentials and the `host:port` target (`@aws-0-ap-northeast-2.pooler.supabase.com:6543`). The Prisma Rust query engine failed or behaved inconsistently when parsing credentials.

2. **Supabase PgBouncer Regional Latency & Connection Sizing**:
   The database is hosted on Supabase in AWS Seoul (`ap-northeast-2`). When PgBouncer is idle, cold-start handshakes can take 15–30+ seconds. Prisma's default settings opened too many concurrent connections, exhausting the free-tier connection limits on serverless invocations.

3. **Missing Vercel Production Environment Variables**:
   `.env` is intentionally gitignored. On initial Vercel deployment, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `NEXTAUTH_URL` were missing or had stale parameters, triggering `PrismaClientInitializationError: Can't reach database server` which was converted to HTTP 503.

4. **Bypassing Supabase Auth API**:
   The initial registration route only inserted records into the PostgreSQL `public."User"` table via Prisma without calling Supabase Auth (`auth.users`). Consequently, **Supabase Dashboard → Authentication → Users** showed *"No users in your project"*, preventing native Supabase Auth features and RLS policies from functioning.

---

### B. Complete Technical Resolution

#### 1. Database Connection String & Sanitization
* Encoded special characters in database passwords (`@` encoded as `%40`).
* Configured optimal PgBouncer connection parameters:
  ```env
  DATABASE_URL="postgresql://postgres.gjkiumovdcpbyaqkuwyz:[ENCODED_PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=30&pool_timeout=30"
  DIRECT_URL="postgresql://postgres.gjkiumovdcpbyaqkuwyz:[ENCODED_PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?connect_timeout=30"
  ```
* Automated URL sanitization in `src/lib/prisma.ts` with `sanitizeDatabaseUrl` to ensure serverless pools never exhaust connections.

#### 2. Dual-Layer User Provisioning (Supabase Auth + PostgreSQL)
In `src/app/api/auth/register/route.ts`:
1. **Validation**: Validate request payload (email format regex, password length >= 8 characters, name). Returns `400 Bad Request` on invalid input.
2. **Supabase Auth Creation**: Call `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } })`.
   - If email already exists, return `409 Conflict` (`DUPLICATE_EMAIL`).
3. **PostgreSQL Sync**: Create or sync user record into PostgreSQL `public."User"` using the exact Supabase Auth UUID (`id: supabaseUser.id`).
4. **Retry Mechanism**: Wrapped database calls with automatic 3-attempt exponential backoff retry to gracefully withstand Supabase cold starts.
5. **Return Code**: Returns `201 Created` with structured `{ success: true, user }`.

#### 3. Supabase Auth Integration in NextAuth
In `src/lib/auth.ts`:
* In `authorize()` callback, authentication directly calls `supabasePublic.auth.signInWithPassword({ email, password })`.
* If authentication succeeds, user details are returned and session token signed by NextAuth.

---

## 3. Production Deployment Checklist (Vercel & Supabase)

### Vercel Dashboard Configuration
In **Vercel Dashboard → Project Settings → Environment Variables** (Scope: Production & Preview):

| Variable Name | Value Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Transaction pooler (:6543) with `%40` and pooler params | `postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true...` |
| `DIRECT_URL` | Session pooler (:5432) | `postgresql://...@pooler.supabase.com:5432/postgres?connect_timeout=30` |
| `SUPABASE_URL` | Supabase project REST URL | `https://[project-ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client Supabase project URL | `https://[project-ref].supabase.co` |
| `SUPABASE_SECRET_KEY` | Server-side service role / admin key | Secret key from Supabase Dashboard |
| `SUPABASE_PUBLISHABLE_KEY` | Client publishable key | Publishable key from Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client publishable key | Publishable key from Supabase Dashboard |
| `NEXTAUTH_SECRET` | 32+ character random string | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production application URL with `https://` | `https://skillsync-ai.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIza...` |
| `GEMINI_MODEL` | AI model name | `gemini-1.5-flash` |
| `NODE_ENV` | Environment | `production` |

> **Note on Redeployment:** After adding or changing environment variables in Vercel, trigger a **clean redeploy** (uncheck "Use existing Build Cache") to ensure serverless containers receive the updated environment.

### Supabase Dashboard URL Configuration
In **Supabase Dashboard → Authentication → URL Configuration**:
1. **Site URL**: Set to your production domain:
   ```
   https://[your-app].vercel.app
   ```
2. **Redirect URLs**: Add wildcard patterns for both production and local development:
   ```
   https://[your-app].vercel.app/**
   http://localhost:3000/**
   ```

---

## 4. Verification & Testing Matrix

Run the test suite to verify database connectivity, auth routes, and error codes:

```bash
# Run the registration verification script
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/verify-registration-fix.ts

# Run TypeScript compilation check
npx tsc --noEmit

# Run Next.js production build verification
npm run build
```

| Check | Expected Response | Verified Status |
| :--- | :---: | :---: |
| Missing request fields | `400 Bad Request` (`VALIDATION_ERROR`) | ✅ Pass |
| Invalid email syntax | `400 Bad Request` (`INVALID_EMAIL`) | ✅ Pass |
| Password < 8 characters | `400 Bad Request` (`WEAK_PASSWORD`) | ✅ Pass |
| Duplicate email registration | `409 Conflict` (`DUPLICATE_EMAIL`) | ✅ Pass |
| Successful registration | `201 Created` (`{ success: true, user }`) | ✅ Pass |
| Supabase Auth user created | User visible in Supabase Auth Dashboard | ✅ Pass |
| NextAuth Credentials Sign-in | Successful session cookie issued | ✅ Pass |
| Cold-start timeout resilience | Exponential retry succeeds on second try | ✅ Pass |
