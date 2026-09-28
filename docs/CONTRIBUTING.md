# SkillSync AI — Contributing & Testing Guide

**Version:** 2.0  
**Last Updated:** September 2026  

This guide defines contribution workflows, branch etiquette, coding standards, and our comprehensive testing strategy for SkillSync AI.

---

## 1. Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure your local environment by creating `.env` following [ENVIRONMENT.md](ENVIRONMENT.md).
3. Review the development and architecture guidelines in [AI_WORKFLOW.md](AI_WORKFLOW.md#ai-coding-rules--agent-guidelines).
4. Review current milestones and tasks in [ROADMAP.md](ROADMAP.md).
5. Start the local development server:
   ```bash
   npm run dev
   ```

---

## 2. Branch & Git Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready, verified code. Deployed to production on Vercel. |
| `dev` | Integration branch for active feature development. |
| `feature/<name>` | New features (e.g., `feature/ai-tutor-chat`). |
| `fix/<name>` | Bug and incident fixes (e.g., `fix/pgbouncer-timeout`). |

### Workflow

```
1. Create a branch from `dev`: git checkout -b feature/your-feature
2. Implement changes following AI & TypeScript conventions
3. Run tests and type checks: npm run build
4. Open a Pull Request targeting `dev`
5. After review & verification, merge to `dev`
6. Release-ready checkpoints are merged from `dev` into `main`
```

---

## 3. Commit Message Conventions

We follow Conventional Commits format (`<type>: <short description>`):

| Type | Purpose | Example |
|---|---|---|
| `feat` | New feature | `feat: add diagnostic assessment scoring logic` |
| `fix` | Bug fix | `fix: url-encode db password and add pooler params` |
| `docs` | Documentation update | `docs: consolidate troubleshooting and test docs` |
| `refactor` | Code refactoring without behavior changes | `refactor: extract Gemini client singleton` |
| `test` | Adding or updating tests | `test: add unit tests for mastery classification` |
| `chore` | Build, dependencies, or tooling | `chore: update prisma client` |

---

## 4. Pull Request Checklist

Before submitting a PR, verify:
- [ ] Code follows conventions in [AI_WORKFLOW.md](AI_WORKFLOW.md#ai-coding-rules--agent-guidelines).
- [ ] Zero secrets or raw API keys exposed in frontend code.
- [ ] UI components handle all 4 states: **Loading**, **Error**, **Empty**, **Data**.
- [ ] API routes validate input with Zod schemas.
- [ ] AI responses are parsed and validated against Zod schemas.
- [ ] TypeScript check passes with zero errors (`npx tsc --noEmit`).
- [ ] Next.js build compiles cleanly (`npm run build`).
- [ ] Documentation updated if models, endpoints, or environment variables changed.

---

## 5. Testing Strategy & Quality Assurance

SkillSync AI employs a layered testing strategy to ensure reliability across authentication, AI evaluation, and database queries.

### Test Stack
- **TypeScript**: Static type safety and compile-time contract enforcement.
- **Zod**: Runtime schema validation for API payloads and Gemini AI JSON outputs.
- **Verification Scripts**: End-to-end integration verification (e.g., `scripts/verify-registration-fix.ts`).
- **Jest & React Testing Library**: Unit and component tests.

---

### A. Unit Testing

Focus on pure utility logic and scoring calculations:

| Module | Test Coverage |
|---|---|
| `calculateMastery()` | Percentage math, rounding boundaries, division by zero guards |
| `classifyMastery()` | Boundary thresholds: `< 40%` (weak), `40-70%` (medium), `> 70%` (strong) |
| `validateAIOutput()` | Strict schema match, unexpected keys, malformed JSON |
| `buildPrompt()` | System instructions, student context injection, output schema inclusion |

#### Example: Mastery Classification
```typescript
describe("classifyMastery", () => {
  it("classifies 0% - 40% as weak", () => {
    expect(classifyMastery(0)).toBe("weak");
    expect(classifyMastery(40)).toBe("weak");
  });
  it("classifies 41% - 70% as medium", () => {
    expect(classifyMastery(55)).toBe("medium");
    expect(classifyMastery(70)).toBe("medium");
  });
  it("classifies 71% - 100% as strong", () => {
    expect(classifyMastery(71)).toBe("strong");
    expect(classifyMastery(100)).toBe("strong");
  });
});
```

---

### B. Integration & API Testing

Verify route handlers with database transactions and mocked AI services:

| Endpoint | Test Objectives |
|---|---|
| `POST /api/auth/register` | Validation error (400), duplicate email (409), Supabase user creation, 201 response |
| `POST /api/assessment/submit` | Topic score calculation, mastery calculation, profile creation |
| `POST /api/analysis/generate` | AI prompt construction, schema validation, profile storage |
| `POST /api/tutor/message` | Contextual prompt generation, chat history bounds, response validation |
| `POST /api/quiz/generate` | Difficulty-appropriate questions targeting weak topics |

#### AI Mocking Strategy
```typescript
// Always mock external AI calls in automated tests
const mockAnalysis = {
  overallAssessment: "Student demonstrates strong conceptual grasp of ER modeling.",
  topicMastery: [
    { topicName: "ER Model", masteryLevel: "strong", score: 85, reasoning: "High accuracy" },
    { topicName: "Normalization", masteryLevel: "weak", score: 30, reasoning: "Frequent 2NF errors" },
  ],
  weaknesses: [{ topicName: "Normalization", priority: 1, reason: "Prerequisite for indexing" }],
  recommendations: ["Review Functional Dependencies", "Practice 2NF/3NF decomposition"],
  confidence: 0.92,
};

jest.mock("@/lib/ai/analysis", () => ({
  analyzeLearning: jest.fn().mockResolvedValue(mockAnalysis),
}));
```

---

### C. Security & Error Testing

| Test Scenario | Expected Result |
|---|---|
| Unauthenticated access to protected route | `401 Unauthorized` |
| Accessing another student's data | `403 Forbidden` / User ownership check |
| Malformed JSON body in API requests | `400 Bad Request` (`INVALID_JSON`) |
| Invalid / weak password (< 8 chars) | `400 Bad Request` (`WEAK_PASSWORD`) |
| Supabase connection latency / cold start | Automatic exponential backoff retry succeeds |
| Gemini API failure or timeout | User-friendly inline error (no raw stack trace exposed) |
| SQL Injection attempts | Safely parameterized via Prisma ORM |

---

### D. Critical Edge Cases Checklist

- [ ] Empty assessment (0 questions answered).
- [ ] Perfect score (100%) and zero score (0%).
- [ ] Timeout during assessment submission.
- [ ] Duplicate submissions.
- [ ] AI returns malformed JSON or extra markdown backticks (auto-cleaned).
- [ ] AI returns hallucinated topic names not present in database.
- [ ] Student with no weak topics (all > 70%).
- [ ] Mobile responsive layout verified down to 375px viewport.

---

## 6. Documentation Maintenance

When changes occur, maintain the single sources of truth:

| Change Type | Primary Doc to Update |
|---|---|
| New endpoint or response format | [API.md](API.md) |
| Database schema or Prisma models | [DATABASE.md](DATABASE.md) |
| System architecture or flow diagrams | [ARCHITECTURE.md](ARCHITECTURE.md) |
| AI prompts, models, or coding rules | [AI_WORKFLOW.md](AI_WORKFLOW.md) |
| UI components, styles, or screens | [UI_UX.md](UI_UX.md) |
| Environment variables or deployments | [ENVIRONMENT.md](ENVIRONMENT.md) |
| Milestones, feature status, changelog | [ROADMAP.md](ROADMAP.md) |
| Production bugs & incident postmortems | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
