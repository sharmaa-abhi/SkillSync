# LearnLoop AI

**AI-powered adaptive education platform that continuously personalizes learning paths based on what each student actually understands.**

> LearnLoop AI doesn't give every student the same learning path. It continuously adapts the learning experience based on what the student actually understands.

---

## Problem Statement

Traditional education delivers the same content to every student at the same pace. Students who struggle with specific topics get left behind, while students who already understand the material get bored. There's no continuous feedback loop between what a student knows, what they need to learn, and how the learning experience adapts.

### Why This Matters

- **70% of students** report feeling disengaged when learning material isn't at their level.
- Teachers can't create individualized plans for 30+ students simultaneously.
- Generic study materials waste time on topics a student already understands.
- Without identifying specific weaknesses, students repeatedly fail on the same concepts.

---

## Solution

LearnLoop AI creates an **adaptive learning loop** — a continuous cycle where:

1. The student's knowledge is assessed at the **topic level**
2. AI analyzes strengths, weaknesses, and learning patterns
3. A **personalized learning plan** is generated
4. An **AI tutor** teaches weak areas with context-aware explanations
5. **Adaptive quizzes** test understanding at the right difficulty
6. Performance data **updates the learning profile**
7. The cycle repeats with an **improved, personalized next step**

---

## Core AI Capabilities

| Capability | Description |
|---|---|
| **Diagnostic Assessment** | Evaluates topic-level mastery across a subject |
| **Weakness Detection** | Identifies specific topics where understanding is low |
| **Learning Profile** | Builds and maintains a structured model of each student's knowledge |
| **Personalized Plans** | Generates study plans prioritized by learning gaps |
| **Context-Aware AI Tutor** | Teaches topics using the student's profile and history as context |
| **Adaptive Quizzing** | Generates practice questions matched to the student's current level |
| **Progress Analysis** | Tracks improvement and adjusts recommendations accordingly |

---

## The Adaptive Learning Loop

```
Student Data
    ↓
Assessment
    ↓
AI Analysis
    ↓
Learning Profile
    ↓
Personalized Recommendation
    ↓
AI Tutor
    ↓
Adaptive Practice
    ↓
Progress Update
    ↓
Updated Learning Profile
    ↓
Next Personalized Recommendation
    ↓
(loop continues)
```

---

## Key Features

### MVP Features (Planned)

- [ ] User registration and login (email/password)
- [ ] Student onboarding (name, education level, goals)
- [ ] Subject selection (starting with DBMS, expandable)
- [ ] Diagnostic assessment with topic-level scoring
- [ ] AI-powered learning analysis and weakness detection
- [ ] Student learning profile generation and storage
- [ ] Personalized learning plan creation
- [ ] Context-aware AI tutor with conversation history
- [ ] Adaptive quiz generation based on weak topics
- [ ] Progress tracking with visual analytics
- [ ] Learning profile updates after each activity
- [ ] Dashboard with learning overview

### Future Features

- Voice-powered AI tutor
- Multilingual learning support
- Teacher and parent dashboards
- Advanced analytics and learning predictions
- RAG-based curriculum knowledge
- Gamification and certificates
- Mobile application

---

## User Journey

```
Register → Onboard → Select Subject → Take Assessment
    ↓
View Learning Profile → See Weak Topics → Get Personalized Plan
    ↓
Study with AI Tutor → Take Adaptive Quiz → View Progress
    ↓
Profile Updates → New Recommendations → Continue Learning
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Next.js API Routes (Route Handlers) |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | NextAuth.js (Credentials provider) |
| **AI Provider** | Google Gemini API |
| **State Management** | React Context + hooks |
| **Charts** | Recharts |
| **Deployment** | Vercel (planned) |

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│                   Frontend                    │
│         Next.js App Router + React            │
├──────────────────────────────────────────────┤
│                 API Layer                     │
│          Next.js Route Handlers               │
├──────────────┬───────────────────────────────┤
│   Database   │        AI Service             │
│  PostgreSQL  │      Google Gemini            │
│   (Prisma)   │   (Structured Output)         │
└──────────────┴───────────────────────────────┘
```

See [ARCHITECTURE.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/ARCHITECTURE.md) for full details.

---

## AI Workflow

See [AI_WORKFLOW.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/AI_WORKFLOW.md) for the complete AI workflow documentation.

---

## Main Pages

| Page | Purpose |
|---|---|
| Landing | Product introduction and sign-up CTA |
| Login | User authentication |
| Register | New account creation |
| Onboarding | Student profile setup |
| Assessment | Diagnostic test with topic-level evaluation |
| Dashboard | Learning overview, profile, and recommendations |
| AI Tutor | Interactive tutoring on weak topics |
| Practice | Adaptive quiz on targeted topics |
| Progress | Visual analytics of learning improvement |

---

## Database Overview

See [DATABASE.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/DATABASE.md) for complete schema documentation.

Core models: Users, Subjects, Topics, Questions, Assessments, Answers, LearningProfiles, LearningPlans, StudySessions, TutorSessions, ProgressRecords.

---

## Setup Instructions

### Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 15+
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd loopAi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up the database
npx prisma generate
npx prisma db push

# Seed initial data (subjects, topics, questions)
npm run seed

# Start development server
npm run dev
```

### Environment Variables

See [ENVIRONMENT.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/ENVIRONMENT.md) for complete details.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/learnloop
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Never commit real API keys. Use `.env.local` which is gitignored.

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npx prisma studio    # Open database GUI
npx prisma db push   # Sync schema to database
npm run seed         # Seed database with initial data
```

---

## Testing

See [TESTING.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/TESTING.md) for the complete testing strategy.

---

## Deployment

Planned deployment target: **Vercel** with a managed PostgreSQL instance.

See [ENVIRONMENT.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/ENVIRONMENT.md) for deployment configuration.

---

## Demo

See [DEMO_FLOW.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/DEMO_FLOW.md) for the complete 2–3 minute hackathon demo script.

---

## Project Status

> **Current State: Pre-Implementation**
>
> All features are currently in the planning/documentation phase. See [PROJECT_STATUS.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/PROJECT_STATUS.md) for detailed status.

---

## Documentation Index

| Document | Purpose |
|---|---|
| [README.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/README.md) | Project overview |
| [PRD.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/PRD.md) | Product requirements |
| [ARCHITECTURE.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/ARCHITECTURE.md) | Technical architecture |
| [AI_WORKFLOW.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/AI_WORKFLOW.md) | AI workflow details |
| [DATABASE.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/DATABASE.md) | Database schema |
| [API.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/API.md) | API reference |
| [UI_UX.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/UI_UX.md) | UI/UX specification |
| [AI_CODING_RULES.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/AI_CODING_RULES.md) | AI coding agent rules |
| [TESTING.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/TESTING.md) | Testing strategy |
| [DEMO_FLOW.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/DEMO_FLOW.md) | Hackathon demo script |
| [ROADMAP.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/ROADMAP.md) | Development roadmap |
| [CONTRIBUTING.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/CONTRIBUTING.md) | Contribution guide |
| [SECURITY.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/SECURITY.md) | Security documentation |
| [ENVIRONMENT.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/ENVIRONMENT.md) | Environment setup |
| [CHANGELOG.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/CHANGELOG.md) | Change history |
| [PROJECT_STATUS.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/PROJECT_STATUS.md) | Current project status |

---

## Hackathon Theme

**AI with Education** — LearnLoop AI demonstrates how AI can transform education from one-size-fits-all to continuously personalized learning experiences.

---

## License

MIT
#   S k i l l S y n c  
 