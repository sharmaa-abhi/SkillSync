# SkillSync AI — Registration 503 Error Root Cause & Resolution Report

## ROOT CAUSE:
The 503 Service Unavailable error (`POST /api/auth/register`) was caused by two interrelated issues in the database connection layer and API error handling:

1. **Unencoded Special Characters in `DATABASE_URL`**:
   The PostgreSQL connection string contained an unencoded `@` in the password (`sharmaa@13245656`). In URI standard RFC 3986, the `@` symbol separates credentials (`user:password`) from host and port (`@aws-0-ap-northeast-2.pooler.supabase.com:6543`). The Prisma Rust query engine and CLI misinterpreted the password and host delimiters, causing database connection handshakes to fail intermittently.

2. **Supabase PgBouncer Pooler Regional Latency & Missing Pool Parameters**:
   The database is hosted on Supabase in AWS Seoul (`ap-northeast-2`). When the connection pooler or database is idle, PgBouncer drops server connections. Initial SSL handshakes on cold starts take 15–30+ seconds. Prisma's default `connect_timeout` (10s) and default connection pool sizing (up to 17 concurrent connections) caused connection timeouts and pool exhaustion against Supabase free-tier limits.

3. **Indiscriminate 503 Masking & Zero Retry in Backend Route**:
   In `src/app/api/auth/register/route.ts`, the catch block checked `error?.name?.includes("Prisma")`. Any Prisma error (including transient socket drops, timeouts, or validation errors) was unconditionally converted to HTTP 503 with the generic message `"Account service is currently experiencing connectivity issues"`. The route had no retry mechanism, so any single dropped packet on an idle socket immediately failed registration for the user.

---

## FIX:
1. **URL-Encoded Database Password**:
   Updated `.env` so `@` is safely encoded as `%40` (`sharmaa%4013245656`), adhering to standard RFC 3986 URI parsing.
2. **Optimized PgBouncer Pooler Parameters**:
   Added `&connection_limit=1&connect_timeout=30&pool_timeout=30` to `DATABASE_URL` in `.env` and automated this in `src/lib/prisma.ts` (`sanitizeDatabaseUrl`). This prevents connection pool exhaustion in serverless environments and extends the handshake timeout to 30 seconds.
3. **Resilient Backend Retry Logic & Accurate Status Codes**:
   Rewrote `src/app/api/auth/register/route.ts` with:
   - Robust input validation (name, email format regex, password >= 8 characters) returning **400 Bad Request** (`VALIDATION_ERROR`, `INVALID_EMAIL`, `WEAK_PASSWORD`).
   - Up to 3 attempts with exponential backoff (300ms, 600ms) for transient database cold starts or socket drops.
   - Distinct **409 Conflict** (`DUPLICATE_EMAIL`) on existing user or `P2002` constraint violation.
   - Specific classification of genuine database connectivity errors returning **503 Service Unavailable** (`SERVICE_UNAVAILABLE`).
   - Structured JSON response (`{ success, user }` or `{ success: false, error, code }`).
4. **Enhanced Frontend Error Handling**:
   Updated `src/app/register/page.tsx` and `src/app/login/page.tsx` to handle status codes explicitly (400, 409, 503, 500, and offline network failure) and provide accurate user-facing feedback.

---

## FILES INSPECTED:
- `src/app/register/page.tsx`
- `src/app/login/page.tsx`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/prisma.ts`
- `src/lib/auth.ts`
- `prisma/schema.prisma`
- `.env`
- `package.json`
- `next.config.ts`

---

## FILES CHANGED:
- `src/app/api/auth/register/route.ts`: Implemented input validation, exponential backoff retries, precise status codes (201, 400, 409, 500, 503), and structured response formats.
- `src/lib/prisma.ts`: Updated `sanitizeDatabaseUrl` to automatically inject `connection_limit=1`, `connect_timeout=30`, and `pool_timeout=30` for Supabase PgBouncer pooler URLs.
- `src/app/register/page.tsx`: Enhanced submit handler to distinguish between validation (400), duplicate email (409), service unavailable (503), internal errors (500), and network dropouts.
- `src/app/login/page.tsx`: Added registration redirect detection (`?registered=true`) with success notification banner.
- `.env`: URL-encoded the `@` in the PostgreSQL password to `%40` and appended optimal pooler settings.
- `scripts/verify-registration-fix.ts`: Created comprehensive verification test suite.

---

## ENVIRONMENT REQUIREMENTS:
The following environment variables are required by the registration and authentication flow:

| Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase PgBouncer transaction-mode pooler URL (port 6543) | `postgresql://postgres.[ref]:[pass_encoded]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=30&pool_timeout=30` |
| `DIRECT_URL` | Supabase session-mode pooler URL (port 5432, for migrations) | `postgresql://postgres.[ref]:[pass_encoded]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?connect_timeout=30` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth JWT and session token signing | 32+ character random string |
| `NEXTAUTH_URL` | Canonical origin of the web application | `http://localhost:3000` (local) or `https://your-domain.vercel.app` (production) |

> **Production Note**: If deployed to Vercel or a cloud platform, configure `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in the hosting environment variables dashboard. Ensure any `@` in passwords is URL-encoded as `%40`.

---

## PRODUCTION DEPLOYMENT REQUIREMENTS:
1. **Connection Pooling**: Always connect to Supabase through the transaction pooler on port `6543` with `?pgbouncer=true&connection_limit=1`.
2. **Build Step**: Ensure `prisma generate` executes during build (configured in `package.json` script: `"build": "prisma generate && next build"`).
3. **Cold Start Tolerance**: In serverless functions, the initial handshake to remote database regions requires up to 30s. The included automatic retry mechanism handles this gracefully.

---

## TEST RESULTS:
- **Valid registration (201 Created)**: PASS
- **Duplicate email (409 Conflict)**: PASS
- **Invalid email format (400 Bad Request)**: PASS
- **Missing required fields (400 Bad Request)**: PASS
- **Password length validation (400 Bad Request)**: PASS
- **Immediate NextAuth login authorization**: PASS
- **Database connectivity audit**: PASS

---

## FINAL REGISTRATION FLOW:
```
[User submits Registration Form (/register)]
                     │
                     ▼
[Client-side validation (presence, password match)]
                     │
                     ▼
[POST /api/auth/register with { name, email, password }]
                     │
                     ▼
[Server-side validation: format, length, presence] ──(Invalid)──> 400 Bad Request
                     │
                   (Valid)
                     │
                     ▼
[Query prisma.user.findUnique with automatic retry (up to 3x)]
                     │
          ┌──────────┴──────────┐
      (Found)               (Not Found)
          │                     │
          ▼                     ▼
    409 Conflict        [Hash password with bcrypt (12 rounds)]
  (DUPLICATE_EMAIL)             │
                                ▼
                        [Execute prisma.user.create with retry]
                                │
                                ▼
                        201 Created { success: true, user }
                                │
                                ▼
                        [Client signIn("credentials")]
                                │
                                ▼
                        [Redirect to /onboarding]
```
