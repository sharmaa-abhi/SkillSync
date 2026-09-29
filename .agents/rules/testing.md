# SkillSync AI — Testing & Verification Policy

## 1. Purpose
Define testing standards, verification procedures, and quality gates required before any feature, refactor, or bug fix is considered complete in SkillSync AI.

## 2. Scope
Applies to all code changes across frontend, backend, database, scripts, and configuration.

---

## 3. Required Rules

### 3.1 Verification Layers
SkillSync employs a four-tiered verification strategy:
1. **Static Analysis & Type Safety:** TypeScript 5 in strict mode. Run `npx tsc --noEmit` to verify type safety across all files. Zero errors permitted.
2. **Schema & Runtime Contracts:** Zod runtime validation on every API payload, query param, and AI JSON output.
3. **Integration Verification Scripts:** Executable end-to-end integration tests located in `scripts/`:
   - `scripts/test-auth-flow.ts`: Comprehensive auth test (database connection, user creation, bcrypt rounds, duplicate email rejection, credentials provider authorize logic).
   - `scripts/verify-learning-loop.ts`: Full adaptive learning loop verification (subject & topic seeding, demo learner profile, next best action computation, 7-day roadmap generation, Socratic tutor context reasoning, question bank integrity).
   - `scripts/verify-registration-fix.ts`: Dual-layer registration verification across Supabase Auth and Prisma.
   - `scripts/check-auth.ts`: Authentication diagnostics.
4. **Production Build Validation:** `npm run build` must compile cleanly with Turbopack, generating all static and dynamic routes.

### 3.2 Feature Completion Pipeline (The 7-Step Quality Gate)
For every new or modified feature, verify each stage of the pipeline before completion:
1. **Frontend:** Implements all 4 visual states (Loading, Error, Empty, Data) and adheres to mastery color tokens.
2. **Validation:** Inbound requests validated with Zod schemas; outbound AI parsed with `extractJSON` and validated.
3. **API:** Returns standard response envelope `{ ...data }` or `{ error: { code, message, status } }`.
4. **Authorization:** Verifies session token and filters records by `session.user.id`.
5. **Database:** Queries use the Prisma singleton, maintain pooler connection params, and preserve historical progress records.
6. **Error Handling:** Graceful fallbacks exist for AI and database outages; errors logged with structured tags.
7. **Verification:** Type-check passes (`npx tsc --noEmit`) and relevant verification script runs successfully.

### 3.3 Core Pedagogical Logic Test Cases
When touching mathematical or pedagogical algorithms, verify boundary conditions:
- **Mastery Classification:**
  - Score $< 40\% \implies \text{"weak"}$
  - $40\% \le \text{Score} \le 70\% \implies \text{"medium"}$
  - $\text{Score} > 70\% \implies \text{"strong"}$
  - Handle $0/0$ division guards (default to $0\%$).
- **Spaced Repetition (SM-2):**
  - Verify retention decays monotonically over elapsed days.
  - Review quality scores ($0-5$) properly adjust easiness factor ($EF \ge 1.3$).
- **Difficulty Scaling:**
  - Consecutive correct answers trigger promotion to harder questions.
  - Incorrect answers scale down or trigger prerequisite remedial recommendations.

---

## 4. Forbidden Behavior

- **NEVER** claim a feature is verified without running `npx tsc --noEmit` and testing the modified flow.
- **NEVER** write dummy pass assertions in verification scripts to mask failures.
- **NEVER** skip testing error states or network failure modes.
- **NEVER** commit untested modifications to Prisma schema or seed files.

---

## 5. Verification Commands
Before submitting or completing a task, run:
```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Run relevant integration script (example)
npx tsx scripts/verify-learning-loop.ts

# 3. Production build check (when validating full deployment readiness)
npm run build
```
