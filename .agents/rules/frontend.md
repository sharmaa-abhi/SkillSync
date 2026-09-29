# SkillSync AI — Frontend Development Policy

## 1. Purpose
Define engineering standards, UI/UX conventions, state management rules, and accessibility requirements for all client-side code in the SkillSync AI platform.

## 2. Scope
Applies to all files in:
- `src/app/**/page.tsx`
- `src/app/**/layout.tsx`
- `src/components/**`
- `src/hooks/**`
- `src/app/globals.css`

---

## 3. Required Rules

### 3.1 Technology Stack & Conventions
- **Framework:** Next.js 16 (App Router) with React 19.
- **Styling:** Tailwind CSS v4. Use standard utility classes matching the platform design tokens in `src/app/globals.css`. Do not add arbitrary CSS files or conflicting CSS libraries.
- **Icons:** Use `lucide-react` exclusively. Import only required icons.
- **Charts:** Use `recharts` for progress tracking, mastery trends, and analytics.

### 3.2 Client vs. Server Components
- Default to Server Components where interactivity is not required.
- Add `"use client";` at the very top of files only when using React hooks (`useState`, `useEffect`, `useContext`, `useSearchParams`, `usePathname`), event listeners, or client-side context.
- Keep Client Component boundaries as low in the component tree as possible.

### 3.3 Mandatory 4 Visual States
Every data-driven component and page MUST explicitly implement and render all 4 visual states:
1. **Loading State:** Render structured skeleton placeholders (`animate-pulse`) or a branded spinner (`Loader2` from `lucide-react`). Never leave a blank screen or unstyled freeze.
2. **Error State:** Render a user-friendly error banner or card with an actionable retry button (`onRetry`). Never display raw exception stack traces or HTTP error codes.
3. **Empty State:** When arrays or profiles are empty (e.g. no quizzes taken, no learning plan yet), render an explanatory empty state with a call-to-action button (e.g. "Take Diagnostic Assessment" or "Generate Learning Plan").
4. **Data State:** Render the full, interactive UI with data properly formatted.

```tsx
if (loading) return <SkeletonLoader />;
if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
if (!data || data.length === 0) return <EmptyState title="No Quizzes Yet" action={startQuiz} />;
return <QuizDashboard data={data} />;
```

### 3.4 Mastery Color Coding Standard
SkillSync enforces consistent pedagogical color-coding across the entire UI (Overview, Skill Graph, Practice, Plan, Profile):
- **Weak Mastery (< 40%):** Red / Rose.
  - Tailwind: `text-rose-600 bg-rose-50 border-rose-200`
- **Medium Mastery (40% - 70%):** Amber / Yellow.
  - Tailwind: `text-amber-600 bg-amber-50 border-amber-200`
- **Strong Mastery (> 70%):** Emerald / Green.
  - Tailwind: `text-emerald-600 bg-emerald-50 border-emerald-200`

### 3.5 Accessibility & Bilingual Support
- **Semantic HTML:** Use proper landmark elements (`<header>`, `<main>`, `<aside>`, `<nav>`, `<section>`).
- **Form Controls:** Every input must have a descriptive `<label>` or `aria-label`.
- **High-Contrast Support:** Respect the `.high-contrast-mode` class toggled in `src/components/AppLayout.tsx` for accessibility.
- **Bilingual Interface:** Support English (`en`) and Hindi (`hi`) text labels. Subscribe to the `skillsync_language_change` custom event where bilingual labels are rendered.
- **Responsive Layout:** Mobile-first layout tested and functional down to 375px viewport width. Use responsive prefixes (`sm:`, `md:`, `lg:`).

### 3.6 Form Handling & Optimistic Feedback
- Prevent duplicate form submissions by disabling submit buttons during in-flight requests (`disabled={submitting}`).
- Provide instant feedback (toast, badge, or state update) on user action (e.g., task checkbox in `/plan`).
- Always validate user inputs before dispatching requests.

---

## 4. Forbidden Behavior

- **NEVER** import or use `@/lib/prisma`, `PrismaClient`, or `@prisma/client` in client components or pages.
- **NEVER** import or use `supabaseAdmin` in client components or pages.
- **NEVER** access server secrets (`process.env.GEMINI_API_KEY`, `process.env.SUPABASE_SECRET_KEY`, `process.env.DATABASE_URL`) on the client. Only `NEXT_PUBLIC_` prefixed variables are allowed in client bundles.
- **NEVER** call `setState()` synchronously inside an effect body that causes infinite or cascading render loops (follow React 19 rules).
- **NEVER** show unhandled promise rejection errors directly to students.
- **NEVER** assume the database or external AI service is always available; always provide fallback UI and retry mechanisms.

---

## 5. Validation & Checks Before Completion
1. `npx tsc --noEmit` passes with 0 type errors.
2. Verify responsive design on both mobile (375px) and desktop (1280px) viewports.
3. Verify that Loading, Error, Empty, and Data states can all be triggered without crashing.
4. Verify no server-side modules are bundled into the client build (`npm run build`).
