# SkillSync AI

> **Adaptive, AI-Powered Learning Platform**  
> Diagnoses subject weaknesses, generates personalized learning pathways, and provides contextual 1-on-1 tutoring.

---

## Overview

SkillSync AI transforms passive exam preparation into an active, adaptive learning experience. Built with Next.js 15, PostgreSQL (Supabase), Prisma ORM, and Google Gemini AI, SkillSync analyzes student performance per topic, generates dynamic mastery profiles, and delivers real-time adaptive quizzes and contextual AI tutoring.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma (with connection pooler tuning for serverless execution)
- **Authentication**: Dual-layer Supabase Auth (`@supabase/supabase-js`) + NextAuth.js
- **AI Engine**: Google Gemini Flash (`gemini-1.5-flash`) via Google Generative AI SDK
- **Styling**: Tailwind CSS & Lucide React
- **Validation**: Zod (runtime validation for API routes and LLM output)

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
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

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
