# SkillSync AI — Backend & API Development Policy

## 1. Purpose
Define engineering standards, API design contracts, validation requirements, and AI pipeline orchestration rules for all server-side route handlers and services in SkillSync AI.

## 2. Scope
Applies to:
- `src/app/api/**/route.ts`
- `src/lib/**` (including `ai.ts`, `auth.ts`, `rag.ts`, `cohortAnalytics.ts`, `spacedRepetition.ts`, `prisma.ts`, `supabase.ts`)

---

## 3. Required Rules

### 3.1 Route Handler Architecture
- **Framework:** Next.js App Router Route Handlers (`export async function GET/POST/PUT/PATCH/DELETE(request: Request)`).
- **Runtime:** Node.js runtime.
- **Path Naming:** Kebab-case directory naming under `src/app/api/` (e.g., `/api/assessment/start`, `/api/tutor/summarize`).

### 3.2 Request/Response Envelope Standard
All API routes must adhere to consistent JSON structures:

#### Success Response
Return a 200 or 201 status with the primary domain resource:
```json
{
  "plan": { "id": "...", "title": "...", "items": [] }
}
```

#### Error Response
Standard error envelope (as specified in `docs/API.md`):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation of error.",
    "status": 400
  }
}
```
Standard Error Codes: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `VALIDATION_ERROR` (400), `INVALID_JSON` (400), `DUPLICATE_RESOURCE` (409), `INTERNAL_ERROR` (500), `SERVICE_UNAVAILABLE` (503).

### 3.3 Input Validation with Zod
- Every endpoint accepting user input (JSON body, query parameters, route parameters) MUST validate input using a Zod schema before processing business logic.
- Parse with `safeParse()`:
```typescript
import { z } from "zod";

const SubmitAssessmentSchema = z.object({
  assessmentId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    selectedOption: z.number().int().min(0).max(3).nullable(),
  })).min(1),
  timeTakenSeconds: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Malformed JSON payload.", status: 400 } },
      { status: 400 }
    );
  }

  const result = SubmitAssessmentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: result.error.errors[0].message, status: 400 } },
      { status: 400 }
    );
  }
  // Proceed with validated data: result.data
}
```

### 3.4 Authentication & Session Enforcement
- Every protected endpoint MUST extract and verify the NextAuth session:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Authentication required.", status: 401 } },
    { status: 401 }
  );
}
const userId = (session.user as { id: string }).id;
```
- NEVER rely on client-provided user IDs (e.g., `body.userId`). Always use the authenticated `userId` from the verified session token.

### 3.5 AI Orchestration Standards (Google Gemini)
All AI interactions run exclusively on the server in `src/lib/ai.ts` using `@google/generative-ai`:
1. **Model:** `gemini-1.5-flash` by default (read from `process.env.GEMINI_MODEL`).
2. **Context Injection:** Always inject student context (education level, goal, topic mastery scores, prior attempts).
3. **Structured Outputs:** Require the AI to output valid JSON matching an exact schema.
4. **Resilient JSON Extraction:** Use `extractJSON()` to strip markdown fences (` ```json `) and regex matches before parsing.
5. **Validation of AI Output:** Always validate parsed AI output structure before saving to the database or returning to the client.
6. **Graceful Fallbacks:** Every AI function must implement a deterministic heuristic fallback (e.g., `generateFallbackAnalysis`, fallback quiz questions, fallback revision notes) so an LLM failure or rate limit never crashes the application.
7. **Timeouts:** Enforce an upper timeout limit (15 seconds) on Gemini requests.

### 3.6 RAG & Pedagogical Services
- AI Tutor queries must query `retrieveCurriculumPassages()` in `src/lib/rag.ts` for curriculum grounding before generating answers.
- Socratic mode must guide the student through hints and conceptual questions rather than bluntly outputting final answers.
- Spaced repetition updates in `/api/review` must follow the SuperMemo SM-2 algorithm in `src/lib/spacedRepetition.ts`.

### 3.7 Structured Logging
- Use structured prefix tags in `console.error` and `console.warn`:
  - `[API_ERROR]`, `[AUTH]`, `[TUTOR]`, `[AI_ANALYSIS]`, `[PRISMA]`
- Include context metadata (endpoint, user ID hash or prefix, error name).
- NEVER log passwords, session secrets, API keys, or raw student PII.

---

## 4. Forbidden Behavior

- **NEVER** expose the Gemini API key (`GEMINI_API_KEY`) to the client or in API response payloads.
- **NEVER** return `correctAnswer` in question bank delivery endpoints (`/api/assessment/start`, `/api/quiz` generation). Correct answers are evaluated strictly on the server upon submission.
- **NEVER** perform raw database operations without scoping to `userId` on user-owned records.
- **NEVER** throw unhandled exceptions out of route handlers; always catch and return standard error JSON with appropriate 4xx/5xx status.
- **NEVER** bypass Zod validation on incoming request bodies.

---

## 5. Validation & Checks Before Completion
1. `npx tsc --noEmit` passes with 0 type errors.
2. Confirm the route returns `{ error: { code, message, status } }` on invalid payloads.
3. Test authentication guard (ensure 401 is returned when unauthenticated).
4. Verify fallback branch works when Gemini API is mocked or unavailable.
