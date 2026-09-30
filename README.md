# SkillSync AI

> **Adaptive, AI-Powered Learning Platform**  
> Diagnoses subject weaknesses, generates personalized learning pathways, and provides contextual 1-on-1 tutoring.

---

## Overview

SkillSync AI transforms passive exam preparation into an active, adaptive learning experience. Built with Next.js 15, PostgreSQL (Supabase), Prisma ORM, and Google Gemini AI, SkillSync analyzes student performance per topic, generates dynamic mastery profiles, and delivers real-time adaptive quizzes and contextual AI tutoring.

---

## Current Implementation Status

| Feature | Status | Details |
|---|:---:|---|
| Landing Page & UI | ✅ Done | Premium design with hero, features, CTA sections |
| Authentication | ✅ Done | Dual-layer Supabase Auth + NextAuth JWT sessions |
| Registration & Login | ✅ Done | Full validation, error codes, demo login |
| Onboarding Flow | ✅ Done | Multi-step wizard with subject selection |
| Dashboard Layout | ✅ Done | Sidebar navigation, profile card, mastery matrices |
| Diagnostic Assessment | ✅ Done | Subject selection, timed question presentation, scoring |
| AI Learning Analysis | ✅ Done | Gemini integration with Zod-validated structured output |
| Assessment Results | ✅ Done | Topic-level scores with AI-generated insights |
| Learning Profile & Plan | ✅ Done | Personalized AI generation via Gemini, database persistence, task sync |
| AI Tutor Chat | ✅ Done | Full context injection (profile + history), Socratic modes, voice STT, audio TTS |
| Adaptive Quiz Engine | ✅ Done | Adaptive difficulty scaling (easy/medium/hard), AI generation, closed-loop recalculation |
| Progress Tracking | ✅ Done | Real-time recalculation, weighted topic mastery, ProgressRecord history |
| Knowledge Graph | 🆕 New | Interactive topic dependency visualization |

---

## Tech Stack

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma Client (with PgBouncer connection pooler tuning on port 6543)
- **Authentication**: Dual-layer Supabase Auth (`@supabase/supabase-js`) + NextAuth.js JWT sessions
- **AI Engine**: Google Gemini (`gemini-1.5-flash` with structured JSON output & Zod validation)
- **Styling & UI**: Tailwind CSS v4 & Lucide React
- **Data Analytics**: Recharts
- **Deployment**: Vercel (serverless)

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/sharmaa-abhi/SkillSync.git
cd SkillSync
npm install
```

### 2. Configure Environment
Copy the template and fill in your keys:
```bash
cp .env.example .env
```
Refer to [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for required keys (Supabase, NextAuth, and Google Gemini).

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Implementation Roadmap & Future Vision

### Phase 1 — Complete Core Adaptive Loop (✅ Complete)
- [x] Diagnostic assessment engine with server-side answer evaluation
- [x] Automated AI weakness detection & prerequisite gap identification
- [x] Personalized learning pathway generation with prioritized study milestones
- [x] Closed-loop profile mastery recalculation after smart quizzes
- [x] Socratic AI Tutor with context injection (student profile + mastery history)
- [x] Six curriculum tracks: Python, Mathematics, DBMS, OS, Computer Networks, and DSA

### Phase 2 — Hackathon Polish & Intelligent Automation (✅ Complete)
- [x] Multi-subject quick switcher across headers, sidebar, and profile
- [x] RAG-based curriculum grounding service (`src/lib/rag.ts`)
- [x] Spaced repetition retention engine (`src/lib/spacedRepetition.ts`) with SM-2 calculations
- [x] Cohort bottleneck prediction engine (`src/lib/cohortAnalytics.ts`)
- [x] Interactive topic dependency Knowledge Graph
- [x] Bilingual English / Hindi localization toggle and high-contrast accessibility mode
- [x] Serverless PgBouncer pooler production hardening

### Phase 3 — Multimodal AI & Mobile Ecosystem (🔮 Target: Q1 – Q3 2027)
- [ ] **Bidirectional Live Voice Tutor**: Low-latency (<400ms) voice dialogues with Gemini 2.0 Multimodal Live API over WebSockets (English, Hindi, Hinglish, Tamil, Telugu).
- [ ] **Multimodal Vision Problem Solver**: "Snap & Solve" camera scanner for handwritten equations, circuit schematics, and ER diagrams.
- [ ] **Cross-Platform Mobile App (iOS & Android)**: React Native + Expo with offline-first SQLite synchronization, background review push notifications, and haptic feedback.
- [ ] **FSRS v4 Memory Algorithm Upgrade**: Advanced Free Spaced Repetition Scheduler replacing SM-2 for 30% faster review cycles at 90% target retention.
- [ ] **Collaborative Live Study Squads**: WebRTC audio study rooms with synchronized real-time whiteboards and a shared Socratic AI tutor.
- [ ] **Gamification & Mastery Quests**: Study streaks, XP multipliers, proof-of-mastery badges, and university cohort leaderboards.

### Phase 4 — Institutional Enterprise & Educator Intelligence (🚀 Target: Q3 2027 – 2028)
- [ ] **Educator & Professor Dashboard**: Aggregate class knowledge graph heatmaps, prerequisite bottleneck alerts before exams, and automated assignment dispatch.
- [ ] **LTI 1.3 / 1.4 Advantage LMS Standard**: Direct integration and grade sync for Canvas, Blackboard, Moodle, and Google Classroom.
- [ ] **Psychometric Mock Exam Synthesizer**: AI exam paper generator calibrated to standardized exam blueprints (GATE, JEE, University finals) using Item Response Theory (IRT).
- [ ] **Enterprise Multi-Tenant Isolation & SSO**: SAML 2.0, Okta, and Azure AD single sign-on with strict student data privacy controls (FERPA / GDPR-K).
- [ ] **Edge Pedagogical SLMs**: Low-latency, privacy-first local fallback models (Gemini Nano / Microsoft Phi-3) executing directly on user devices via WebGPU.

---

## Documentation Directory

All comprehensive documentation is organized under the [`docs/`](docs/) directory:

| Document | Purpose |
|---|---|
| [**PRD.md**](docs/PRD.md) | Product Requirements Document — User stories, goals, and feature specs |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) | System architecture, tech stack breakdown, and flow diagrams |
| [**DATABASE.md**](docs/DATABASE.md) | PostgreSQL schema, Prisma models, indexing, and relationships |
| [**API.md**](docs/API.md) | API route reference, request/response formats, and error codes |
| [**UI_UX.md**](docs/UI_UX.md) | Design system, color palettes, mastery tokens, and page wireframes |
| [**AI_WORKFLOW.md**](docs/AI_WORKFLOW.md) | Gemini AI pipeline, adaptive learning loop, prompt specs & AI coding rules |
| [**ENVIRONMENT.md**](docs/ENVIRONMENT.md) | Environment setup, variable templates, and local configuration |
| [**SECURITY.md**](docs/SECURITY.md) | Security posture, auth validation, and student data privacy |
| [**CONTRIBUTING.md**](docs/CONTRIBUTING.md) | Git workflow, commit conventions, and comprehensive testing strategy |
| [**ROADMAP.md**](docs/ROADMAP.md) | Four-phase project roadmap, milestone tracking, and changelog |
| [**TROUBLESHOOTING.md**](docs/TROUBLESHOOTING.md) | Production deployment, Supabase Auth setup, and 503 fix resolutions |
| [**DEMO_FLOW.md**](docs/DEMO_FLOW.md) | 2–3 minute hackathon presentation and live demonstration script |

---

## License

MIT © SkillSync AI
