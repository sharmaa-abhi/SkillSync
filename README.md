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

- **Framework**: Next.js 15 (App Router, React 19)
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma (with connection pooler tuning for serverless execution)
- **Authentication**: Dual-layer Supabase Auth (`@supabase/supabase-js`) + NextAuth.js
- **AI Engine**: Google Gemini Flash (`gemini-1.5-flash`) via Google Generative AI SDK
- **Styling**: Tailwind CSS & Lucide React
- **Validation**: Zod (runtime validation for API routes and LLM output)
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

## Implementation Roadmap

### Phase 1 — Complete MVP (✅ Complete)
- [x] Personalized learning plan generation with AI
- [x] Closed-loop mastery recalculation after quizzes
- [x] Full AI tutor context injection (student profile + history)
- [x] Adaptive quiz difficulty scaling

### Phase 2 — Advanced AI Features (✅ Complete)
- [x] RAG-based curriculum grounding (university textbooks & lectures)
- [x] Spaced repetition engine (Ebbinghaus forgetting curve)
- [x] Multi-subject expansion (OS, Computer Networks, DSA)
- [x] Session summarization (auto-generate notes from tutor chats)
- [x] Difficulty prediction using cohort learning patterns

### Phase 3 — Platform Expansion
- [ ] Voice AI Tutor (speech-to-speech in Hindi, Tamil, etc.)
- [ ] Teacher/Educator Portal with cohort analytics
- [ ] Mobile native apps (React Native) with offline study
- [ ] Gamification engine (streaks, XP, badges, leaderboards)
- [ ] LMS integrations (Canvas, Moodle, Blackboard)

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
