# LearnLoop AI — AI Coding Rules

**Version:** 1.0

> This file is the permanent instruction manual for AI coding agents working on LearnLoop AI. Read and follow these rules before writing any code.

---

## Before You Write Any Code

**Every time** you are about to modify or create code:

1. **Read relevant documentation.** Start with this file, then check the specific docs (ARCHITECTURE.md, DATABASE.md, API.md, etc.).
2. **Inspect the existing implementation.** Look at the actual code, not just documentation.
3. **Identify dependencies.** Understand what other files, components, or services your change affects.
4. **Make the smallest safe change.** Don't rewrite working systems to match a different style preference.
5. **Test the change.** Verify it works and doesn't break existing functionality.
6. **Update documentation if behavior changes.** If you change an API response, update API.md. If you change a schema, update DATABASE.md.

---

## Architecture Rules

### DO

- Reuse existing components before creating new ones.
- Follow the established project structure (see ARCHITECTURE.md).
- Keep business logic in the API layer, not in React components.
- Keep AI service logic in `lib/ai/`, not inline in route handlers.
- Use the Prisma client singleton from `lib/prisma.ts`.
- Follow Next.js App Router conventions.

### DON'T

- Don't rewrite working architecture unnecessarily.
- Don't add dependencies without checking if existing ones solve the problem.
- Don't create alternative implementations of existing utilities.
- Don't put database queries directly in React components.
- Don't create new patterns when the codebase already has established ones.

---

## AI Integration Rules

### Core Principles

1. **Never trust unvalidated LLM output.** Every AI response must be parsed, validated against a Zod schema, and sanity-checked before storage or display.
2. **Never expose API keys to the client.** All AI calls happen server-side in API route handlers. The `GEMINI_API_KEY` must only be accessed via `process.env` on the server.
3. **Never claim an action happened unless the backend confirms it.** Don't show "Profile updated" unless the API returned success.
4. **Always include student context in AI prompts.** The AI must receive the student's learning profile, mastery levels, and relevant history. This is what makes it personalized.
5. **Preserve student learning history.** Never delete or overwrite historical progress records. Create new records, don't modify old ones.

### Prompt Engineering

- Use the four-part prompt structure: SYSTEM → CONTEXT → TASK → FORMAT (see AI_WORKFLOW.md).
- Always specify the required JSON output schema in the prompt.
- Include explicit instructions like "Respond ONLY with valid JSON" and "Do NOT include text outside the JSON."
- Never include student PII (email, real name) in AI prompts — use anonymized identifiers.

### AI Output Handling

```typescript
// CORRECT: Validate AI output
const parsed = JSON.parse(aiResponse);
const validated = AnalysisSchema.safeParse(parsed);
if (!validated.success) {
  // Handle validation failure
  throw new AIValidationError(validated.error);
}
// Use validated.data

// WRONG: Trust raw output
const result = JSON.parse(aiResponse); // No validation
await db.profile.update({ data: result }); // Direct storage
```

### AI Failure Handling

- Set timeouts on all AI requests (15 seconds max).
- Implement retry logic (max 2 retries).
- Always show a user-friendly error message on AI failure.
- Never show raw AI errors to the user.
- Log AI failures with request context for debugging.

---

## Code Quality Rules

### TypeScript

- Use TypeScript for all files. Avoid `.js` files.
- Avoid `any` types. Use proper interfaces and type definitions.
- Define shared types in `types/` directory.
- Use Zod schemas for runtime validation (API input, AI output).

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `QuestionCard.tsx` |
| Hooks | camelCase with `use` prefix | `useLearningProfile.ts` |
| Utilities | camelCase | `calculateMastery.ts` |
| API routes | kebab-case directories | `api/learning-plan/route.ts` |
| Types/Interfaces | PascalCase | `LearningProfile` |
| Constants | UPPER_SNAKE_CASE | `MAX_QUIZ_QUESTIONS` |
| Database fields | camelCase | `overallMastery` |

### Component Rules

- Keep components focused — one component, one responsibility.
- Extract reusable UI elements into `components/ui/`.
- Feature-specific components go in `components/<feature>/`.
- Components should accept props, not fetch data directly (unless they're page components).
- Handle loading, error, and empty states in every data-driven component.

### Code Organization

```
// CORRECT: Separated concerns
// components/assessment/QuestionCard.tsx — UI only
// lib/assessment.ts — Business logic
// app/api/assessment/route.ts — API handler

// WRONG: Everything in one file
// app/assessment/page.tsx — UI + API calls + business logic + AI calls
```

---

## UI Rules

### Responsive Design

- **Mobile-first.** Start with mobile layout, enhance with `md:` and `lg:` breakpoints.
- Every page must be usable on a 375px wide screen.
- Test sidebar navigation on mobile (hamburger or bottom nav).
- Charts must resize with their container.

### Accessibility

- All form inputs must have associated `<label>` elements.
- Interactive elements must be keyboard accessible (Tab, Enter, Space, Escape).
- Use semantic HTML: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<section>`.
- Never use color as the only indicator. Add icons or text labels.
- Loading states must include `aria-live="polite"` or `role="status"`.
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text.

### Visual Consistency

- Use the design tokens defined in UI_UX.md (colors, spacing, typography).
- Mastery colors must be consistent everywhere: weak = red, medium = yellow, strong = green.
- Use consistent border-radius (12px for cards, 8px for buttons, 6px for inputs).
- Use consistent shadow (shadow-sm for cards, shadow-md for hover).
- Animations should be 200ms ease for transitions.

### State Handling

Every data-driven component must handle these states:

```typescript
// CORRECT: Full state handling
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} onRetry={refetch} />;
if (!data || data.length === 0) return <EmptyState message="..." />;
return <DataComponent data={data} />;

// WRONG: Only happy path
return <DataComponent data={data} />;
```

---

## Data Rules

### Environment & Secrets

- **Never hardcode** API keys, database URLs, or secrets in source code.
- All secrets go in `.env.local` (development) or environment variables (production).
- `.env.local` must be in `.gitignore`.
- Use `.env.example` with placeholder values for documentation.

### Input Validation

- Validate all user input on the server side using Zod schemas.
- Client-side validation is for UX only — never rely on it for security.
- Sanitize any user-generated content before rendering (prevent XSS).

### Database

- Always use Prisma's parameterized queries (built-in SQL injection prevention).
- Never construct raw SQL with string concatenation.
- Use transactions for multi-step operations that must be atomic.
- Always check that a record belongs to the authenticated user before returning or modifying it.

### Student Data Privacy

- Don't expose student IDs or emails in API responses unless necessary.
- Don't include real student data in AI prompts — use anonymized context.
- Don't log sensitive student information.
- Assessment answers and scores are private — only the student can see their own data.

---

## API Route Rules

### Request Handling Pattern

Every API route should follow this pattern:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const RequestSchema = z.object({
  // Define expected fields
});

export async function POST(request: Request) {
  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required.", status: 401 } },
      { status: 401 }
    );
  }

  // 2. Parse and validate
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "INVALID_JSON", message: "Invalid request body.", status: 400 } },
      { status: 400 }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message, status: 400 } },
      { status: 400 }
    );
  }

  // 3. Execute with error handling
  try {
    const result = await doBusinessLogic(session.user.id, parsed.data);
    return Response.json(result);
  } catch (error) {
    console.error("[API_ROUTE_NAME]", error);
    return Response.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred.", status: 500 } },
      { status: 500 }
    );
  }
}
```

### Error Response Consistency

Always use this error format:

```json
{
  "error": {
    "code": "UPPERCASE_ERROR_CODE",
    "message": "Human-readable description.",
    "status": 400
  }
}
```

---

## Testing Rules

- Write tests for critical paths: assessment scoring, AI output validation, profile updates.
- Test edge cases: empty inputs, invalid data, AI timeouts, unauthorized access.
- Mock AI responses in tests — don't make real API calls.
- Test that unauthorized users can't access protected endpoints.
- See TESTING.md for the complete testing strategy.

---

## Documentation Rules

- If you add or modify an API endpoint, update API.md.
- If you add or modify a database model, update DATABASE.md.
- If you change the AI workflow, update AI_WORKFLOW.md.
- If you add a new page or component, update UI_UX.md.
- If you change project setup or dependencies, update ENVIRONMENT.md.
- Update PROJECT_STATUS.md when completing features.
- Update CHANGELOG.md with significant changes.

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| Putting AI API key in client-side code | Keep in `process.env`, access only in API routes |
| Trusting raw AI JSON output | Parse → Validate (Zod) → Sanity check → Use |
| Showing "Loading..." forever | Set timeouts, show error after timeout |
| Ignoring mobile layout | Start mobile-first, add responsive breakpoints |
| Deleting existing data on profile update | Create new progress records, update profile |
| Using `any` type | Define proper TypeScript interfaces |
| Hardcoding subject/topic data | Load from database, use seed script |
| Building without error handling | Every API call needs try/catch, every component needs error state |
| Making AI calls from the browser | All AI calls go through API routes on the server |
| Displaying raw error messages | Map to user-friendly messages |
