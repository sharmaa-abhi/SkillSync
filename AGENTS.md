<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SkillSync AI — Master Repository Rules & Engineering Policy

> **Authoritative Policy Document for Developers and AI Coding Agents**  
> All work in this repository must strictly adhere to this policy and the specialized domain rules in `.agents/rules/`.

---

## 1. System Identity & Architecture

**SkillSync AI** is an adaptive, AI-powered learning and exam preparation platform designed to diagnose student subject weaknesses, generate personalized pathways, and provide contextual 1-on-1 Socratic tutoring.

### Core Technology Stack
- **Framework:** Next.js 16 (App Router) with React 19.
- **Language:** TypeScript 5 in strict mode.
- **Styling:** Tailwind CSS v4 and Lucide React icons.
- **Database:** PostgreSQL hosted on Supabase.
- **ORM:** Prisma Client with dual connection pooling (PgBouncer port 6543 for runtime; direct port 5432 for migrations).
- **Authentication:** Dual-layer Supabase Auth (`@supabase/supabase-js`) + NextAuth.js JWT session strategy (24-hour lifetime).
- **AI Engine:** Google Gemini (`gemini-1.5-flash`) via `@google/generative-ai` with structured output parsing and Zod validation.
- **Data Analytics & Charts:** Recharts.
- **Deployment:** Vercel (serverless).

---

## 2. Policy Structure & Specialized Rulebooks

To avoid duplicate or conflicting instructions, domain-specific rules are organized into modular rulebooks under `.agents/rules/`:

| Rulebook | Scope | File Link |
|---|---|---|
| **Frontend Policy** | React 19 / Next.js 16 conventions, 4 visual states, Tailwind v4 design tokens, mastery color standards, accessibility, bilingual support | [.agents/rules/frontend.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/SkillSync/.agents/rules/frontend.md) |
| **Backend & API Policy** | App Router route handlers, uniform response & error envelopes, Zod validation, session extraction, Gemini AI orchestration, RAG grounding, logging | [.agents/rules/backend.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/SkillSync/.agents/rules/backend.md) |
| **Database Policy** | Supabase PostgreSQL, Prisma ORM singleton, PgBouncer pooler connection rules, query ownership scoping, append-only progress, atomic transactions | [.agents/rules/database.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/SkillSync/.agents/rules/database.md) |
| **Security & Privacy Policy** | Dual-layer auth, bcrypt password hashing, multi-tenant isolation, secret protection, prompt injection prevention, question bank integrity | [.agents/rules/security.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/SkillSync/.agents/rules/security.md) |
| **Testing & Quality Policy** | Static type safety (`npx tsc --noEmit`), script-based integration verification (`scripts/`), 7-step feature completion gate | [.agents/rules/testing.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/SkillSync/.agents/rules/testing.md) |

---

## 3. Architecture & File Placement Policy

### 3.1 Responsibility Separation
- **Frontend (`src/app/**/page.tsx`, `src/components/**`):** UI presentation, user interactions, local state, accessibility, and visual feedback. Never contains raw database queries or server secrets.
- **Backend API (`src/app/api/**/route.ts`):** Request validation, session verification, ownership authorization, database orchestration, and error response mapping.
- **Service Layer (`src/lib/**`):** Reusable business logic, AI orchestration (`ai.ts`), RAG search (`rag.ts`), spaced repetition calculations (`spacedRepetition.ts`), cohort analytics (`cohortAnalytics.ts`), and database/auth singletons (`prisma.ts`, `supabase.ts`, `auth.ts`).

### 3.2 Where New Files Must Be Created
- **Pages & Routes:** `src/app/<route>/page.tsx`
- **API Endpoints:** `src/app/api/<feature>/route.ts`
- **Reusable Components:** `src/components/<ComponentName>.tsx`
- **Custom React Hooks:** `src/hooks/use<HookName>.ts`
- **Shared Libraries & Services:** `src/lib/<serviceName>.ts`
- **Prisma Schema & Seeds:** `prisma/schema.prisma` and `prisma/seed.ts`
- **Integration & Diagnostic Scripts:** `scripts/<script-name>.ts`
- **Project Documentation:** `docs/<DOCUMENT>.md`
- **Agent Rules:** `.agents/rules/<domain>.md`

---

## 4. SkillSync-Specific Feature Policies

Only implement rules for features that actually exist in the codebase:

### 4.1 Diagnostic Assessments (`/assessment`, `/api/assessment/*`)
- **Question Delivery (`/api/assessment/start`):** Never expose `correctAnswer` or `explanation` to the client. Return only question ID, text, options, and topic.
- **Scoring & Submission (`/api/assessment/submit`):** Evaluate correct answers strictly on the server against the database. Use atomic database transactions to record answers, topic scores, and completion status.
- **Results (`/assessment/results`):** Present topic-level mastery scores and link directly to AI Learning Analysis.

### 4.2 Closed-Loop Mastery Recalculation (`/api/analysis`, `/api/quiz`)
- The adaptive learning loop is continuous:
  $$\text{Assessment/Quiz} \longrightarrow \text{Scoring} \longrightarrow \text{AI Analysis} \longrightarrow \text{Profile Mastery Update} \longrightarrow \text{ProgressRecord Snapshot} \longrightarrow \text{Updated Next Best Action}$$
- Classify mastery thresholds consistently:
  - **Weak:** $< 40\%$ (Red / Rose)
  - **Medium:** $40\% - 70\%$ (Amber / Yellow)
  - **Strong:** $> 70\%$ (Emerald / Green)
- Never overwrite student history. Always append a new `ProgressRecord`.

### 4.3 Contextual AI Tutor & RAG (`/tutor`, `/api/tutor`, `/api/tutor/summarize`)
- Every tutor query must inject student context (education level, goal, current topic mastery score).
- Curriculum grounding must query `retrieveCurriculumPassages()` in `src/lib/rag.ts` before calling Gemini.
- The tutor must operate in **Socratic mode** by default: guide students through probing questions and conceptual hints rather than revealing direct answers.
- Session summarization (`/api/tutor/summarize`) generates structured high-yield revision notes in Markdown (Key Concepts, Core Formulas, Pitfalls Caught, Next Practice Steps).

### 4.4 Adaptive Practice & Quizzes (`/practice`, `/api/quiz`)
- Quizzes dynamically target topics with weak or medium mastery.
- Difficulty scales adaptively (`easy` $\leftrightarrow$ `medium` $\leftrightarrow$ `hard`) based on real-time student performance.
- Submissions recalculate weighted mastery scores and synchronize with the active learning plan.

### 4.5 Spaced Repetition (SM-2) Engine (`/api/review`, `src/lib/spacedRepetition.ts`)
- Implements Ebbinghaus forgetting curve modeling and SuperMemo SM-2 interval calculations.
- Classifies forgetting risk: `low` ($\ge 75\%$), `medium` ($50\% - 74\%$), and `critical` ($< 50\%$).
- Promotes review cards due for optimal retention.

### 4.6 Cohort Analytics & Bottleneck Prediction (`/api/analytics/cohort`, `src/lib/cohortAnalytics.ts`)
- Predicts curriculum bottlenecks by comparing student mastery against cohort historical completion benchmarks (`COHORT_BENCHMARKS`).

### 4.7 Knowledge Graph (`/graph`, `src/components/SkillGraph.tsx`)
- Visualizes interactive topic dependency networks across curriculum tracks (Mathematics, DBMS, OS, Computer Networks, DSA).

---

## 5. End-to-End Feature Development Pipeline

Every new or modified feature must satisfy the end-to-end quality pipeline:

$$\text{Frontend UI (4 States)} \longrightarrow \text{Zod Validation} \longrightarrow \text{API Route} \longrightarrow \text{Session Authorization} \longrightarrow \text{Database Query (Scoped)} \longrightarrow \text{Error Fallback} \longrightarrow \text{Verification Test}$$

1. **Frontend:** Implement Loading, Error, Empty, and Data states; use mastery color tokens.
2. **Validation:** Inbound requests validated with Zod schemas; outbound AI validated against schemas.
3. **API:** Uniform response `{ ...data }` or standard error envelope `{ error: { code, message, status } }`.
4. **Authorization:** Server session checked; operations scoped to `session.user.id`.
5. **Database:** Singleton Prisma client used; multi-tenant `where: { userId }` filtering; history preserved.
6. **Error Handling:** Graceful fallbacks for LLM/DB outages; no unhandled crashes.
7. **Verification:** `npx tsc --noEmit` clean; relevant script in `scripts/` passes.

---

## 6. Git & Change Policy

- **Small, Focused Commits:** Make incremental, single-purpose changes. Do not bundle unrelated refactors with bug fixes.
- **Conventional Commits:** Use standard prefixes:
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation updates
  - `refactor:` Code restructuring without behavior changes
  - `test:` Adding or updating tests/scripts
  - `chore:` Tooling, dependencies, or configuration
- **Preserve Clean Working Tree:** Run `git status` and `git diff` before committing.
- **Never Commit Secrets:** `.env*` files (except `.env.example`) must never be tracked.
- **Never Commit Database Files:** SQLite or local database binaries (`*.db`, `*.sqlite`, `prisma/dev.db`) must never be added to git.
- **Preserve System Directives:** Never remove the Next.js agent block at the top of `AGENTS.md`.

---

## 7. Environment & Deployment Policy

- **Environment Template:** All environment variables must be declared in `.env.example` with placeholder values and documented in `docs/ENVIRONMENT.md`.
- **Serverless Database Pooler:** In production (Vercel), `DATABASE_URL` must point to PgBouncer pooler (port 6543) with query parameters: `pgbouncer=true&connection_limit=1&connect_timeout=30&pool_timeout=30`.
- **Migrations:** Always run migrations against `DIRECT_URL` (direct port 5432).
- **Health Check:** The `/api/health` endpoint must report status without exposing raw credentials.

---

## 8. Code Quality & Standards

- **Strict TypeScript:** No `any`. Use explicit interfaces, types, or `unknown` with type narrowing.
- **Naming Conventions:**
  - React Components: `PascalCase` (`QuestionCard.tsx`)
  - Hooks: `camelCase` with `use` prefix (`useScrollReveal.ts`)
  - Utilities & Services: `camelCase` (`calculateMastery.ts`)
  - API Routes: `kebab-case` directories (`src/app/api/tutor/summarize/route.ts`)
  - Types & Interfaces: `PascalCase` (`LearningProfile`)
  - Constants: `UPPER_SNAKE_CASE` (`COHORT_BENCHMARKS`)
- **No Dead Code:** Remove unused imports, variables, and commented-out code blocks before completing tasks.
- **Documentation Sync:** Keep `docs/API.md`, `docs/DATABASE.md`, and `docs/ENVIRONMENT.md` updated whenever APIs, schemas, or variables change.

---

## 9. Pre-Completion Verification Checklist

Before reporting any coding task as complete, you MUST execute:
1. `npx tsc --noEmit` — must exit with 0 errors.
2. Run the relevant test/diagnostic script in `scripts/` (e.g. `npx tsx scripts/verify-learning-loop.ts`).
3. Verify that all 4 UI states (Loading, Error, Empty, Data) are handled.
4. Verify multi-tenant data ownership (`where: { userId }`).
5. Confirm zero secrets are exposed client-side.
