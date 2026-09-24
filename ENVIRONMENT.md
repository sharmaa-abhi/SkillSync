# LearnLoop AI — Environment Configuration

**Version:** 1.0
**Status:** Pre-Implementation

> ⚠️ **NEVER commit real API keys or secrets to version control.**

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | 18.x or 20.x (LTS) | Required |
| **npm** | 9.x+ | Comes with Node.js |
| **PostgreSQL** | 15+ | Local or managed instance |
| **Google Gemini API Key** | — | From [Google AI Studio](https://aistudio.google.com/) |
| **Git** | 2.x+ | Version control |

---

## Environment Variables

### Required Variables

Create a `.env.local` file in the project root:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://username:password@localhost:5432/learnloop

# ============================================
# AUTHENTICATION (NextAuth.js)
# ============================================
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# ============================================
# AI SERVICE (Google Gemini)
# ============================================
GEMINI_API_KEY=your_gemini_api_key_here
```

### Variable Details

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/learnloop` |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT signing (generate with `openssl rand -base64 32`) | Random 32+ character string |
| `NEXTAUTH_URL` | Yes | Application URL for NextAuth callbacks | `http://localhost:3000` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key from AI Studio | `AIza...` |

### Optional Variables

```env
# ============================================
# OPTIONAL CONFIGURATION
# ============================================

# AI Model Selection (defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash

# Application Port (defaults to 3000)
PORT=3000

# Node Environment
NODE_ENV=development
```

---

## Local Setup

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd loopAi
npm install
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your values
# Use your preferred editor
```

### Step 3: Generate NextAuth Secret

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# Or use any random string generator — must be 32+ characters
```

### Step 4: Set Up PostgreSQL

**Option A: Local PostgreSQL**

```bash
# Create the database
createdb learnloop

# Or via psql
psql -U postgres -c "CREATE DATABASE learnloop;"
```

**Option B: Managed PostgreSQL**

Use one of these providers:
- [Neon](https://neon.tech/) (free tier available)
- [Supabase](https://supabase.com/) (free tier available)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

Copy the connection string to `DATABASE_URL`.

### Step 5: Set Up Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (subjects, topics, questions)
npm run seed
```

### Step 6: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy it to `GEMINI_API_KEY` in `.env.local`

### Step 7: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run test suite |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Sync Prisma schema to database |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma migrate dev` | Create and apply a migration |
| `npm run seed` | Seed database with initial data |

---

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Production Environment Variables

For production deployment, set these variables in your hosting platform (e.g., Vercel dashboard):

```env
DATABASE_URL=<production-database-url>
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://your-domain.vercel.app
GEMINI_API_KEY=<your-gemini-api-key>
NODE_ENV=production
```

---

## Database Setup

### Local Development

```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql
# Windows: Download from https://www.postgresql.org/download/
# Ubuntu: sudo apt install postgresql

# Start PostgreSQL service
# macOS: brew services start postgresql
# Windows: net start postgresql-x64-15
# Ubuntu: sudo systemctl start postgresql

# Create database
createdb learnloop

# Verify connection
psql -d learnloop -c "SELECT 1;"
```

### Connection String Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE

Examples:
- Local:  postgresql://postgres:password@localhost:5432/learnloop
- Neon:   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/learnloop?sslmode=require
- Supabase: postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
```

---

## AI Provider Configuration

### Google Gemini

| Setting | Value |
|---|---|
| Provider | Google Gemini |
| Default Model | `gemini-1.5-flash` |
| Alternative Model | `gemini-1.5-pro` (better quality, slower, more expensive) |
| SDK | `@google/generative-ai` |
| Rate Limits (Free) | 15 RPM, 1M TPM, 1500 RPD |
| Rate Limits (Pay-as-you-go) | Higher limits, see [pricing](https://ai.google.dev/pricing) |

### Free Tier Considerations

The Gemini free tier is sufficient for hackathon development:
- 15 requests per minute
- 1500 requests per day
- 1 million tokens per minute

For the demo, this is more than enough.

---

## Deployment Configuration (Planned)

### Vercel

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

```bash
# Or deploy via CLI
npx vercel --prod
```

### Vercel Environment Variables

Set in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Environments |
|---|---|
| `DATABASE_URL` | Production, Preview |
| `NEXTAUTH_SECRET` | Production, Preview |
| `NEXTAUTH_URL` | Production |
| `GEMINI_API_KEY` | Production, Preview |

---

## .env.example Template

This file should be committed to the repository:

```env
# LearnLoop AI — Environment Variables
# Copy this file to .env.local and fill in your values
# NEVER commit .env.local to version control

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/learnloop

# Authentication (NextAuth.js)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# AI Service (Google Gemini)
# Get from: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: AI Model (defaults to gemini-1.5-flash)
# GEMINI_MODEL=gemini-1.5-flash
```

---

## .gitignore Entries

Ensure these are in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production.local
.env.development.local

# Dependencies
node_modules/

# Build output
.next/
out/

# Prisma
prisma/*.db

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `DATABASE_URL` connection refused | Check PostgreSQL is running and credentials are correct |
| `NEXTAUTH_SECRET` error | Generate a new secret with `openssl rand -base64 32` |
| Gemini API 401 | Verify API key is correct and not expired |
| Gemini API 429 | Rate limit exceeded — wait or use pay-as-you-go |
| Prisma client not found | Run `npx prisma generate` |
| Database tables don't exist | Run `npx prisma db push` |
| Seed data missing | Run `npm run seed` |
| Port 3000 in use | Set `PORT=3001` in `.env.local` or kill the process |
