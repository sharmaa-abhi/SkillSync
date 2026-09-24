# LearnLoop AI — Contributing Guide

**Version:** 1.0

---

## Getting Started

1. Clone the repository
2. Follow the setup instructions in [ENVIRONMENT.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/ENVIRONMENT.md)
3. Read [AI_CODING_RULES.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/AI_CODING_RULES.md) before writing code
4. Check [PROJECT_STATUS.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/PROJECT_STATUS.md) for current priorities

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, demo-ready code |
| `dev` | Active development (merge to main when stable) |
| `feature/<name>` | Individual feature branches |
| `fix/<name>` | Bug fix branches |

### Workflow

```
1. Create feature branch from `dev`
2. Implement changes
3. Test locally
4. Create pull request to `dev`
5. After review, merge to `dev`
6. When stable, merge `dev` to `main`
```

For hackathon speed, working directly on `dev` is acceptable if the team is small and communication is clear.

---

## Commit Conventions

Use clear, descriptive commit messages:

```
<type>: <short description>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation changes
  style:    Formatting, no code change
  refactor: Code restructuring, no behavior change
  test:     Adding or updating tests
  chore:    Build, config, dependency changes
```

### Examples

```
feat: add diagnostic assessment page with timer
fix: correct topic score calculation for unanswered questions
docs: update API.md with quiz endpoints
refactor: extract AI prompt builder into separate module
test: add unit tests for mastery classification
chore: update prisma schema and regenerate client
```

---

## Pull Requests

### PR Checklist

- [ ] Code follows the conventions in AI_CODING_RULES.md
- [ ] No hardcoded secrets or API keys
- [ ] Loading, error, and empty states handled (for UI changes)
- [ ] API input validated with Zod (for API changes)
- [ ] AI output validated with Zod (for AI changes)
- [ ] Tested locally
- [ ] Documentation updated if behavior changed

### PR Description Template

```markdown
## What
Brief description of what this PR does.

## Why
Motivation or issue being addressed.

## How
Technical approach taken.

## Testing
How this was tested.

## Documentation
Which docs were updated (if any).
```

---

## Code Style

### General

- TypeScript for all files
- Use Prettier for formatting (if configured)
- Use ESLint for linting
- Follow naming conventions in AI_CODING_RULES.md

### File Organization

```
src/
├── app/          → Pages and API routes (Next.js App Router)
├── components/   → React components
│   ├── ui/       → Reusable base components
│   └── <feature>/→ Feature-specific components
├── lib/          → Utilities, services, AI logic
├── contexts/     → React contexts
├── hooks/        → Custom hooks
├── types/        → TypeScript type definitions
└── styles/       → Global styles
```

### Import Order

```typescript
// 1. React/Next.js imports
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { z } from "zod";

// 3. Internal imports (absolute paths)
import { Button } from "@/components/ui/Button";
import { useLearningProfile } from "@/hooks/useLearningProfile";

// 4. Types
import type { LearningProfile } from "@/types";

// 5. Styles (if any)
import styles from "./page.module.css";
```

---

## Testing Requirements

- **Required:** Unit tests for scoring calculations and AI output validation
- **Recommended:** Integration tests for critical API routes
- **Optional (hackathon):** E2E tests, UI component tests

Run tests before pushing:

```bash
npm run test
```

---

## Documentation Requirements

When your change modifies behavior, update the relevant documentation:

| Change Type | Update |
|---|---|
| New API endpoint | API.md |
| Schema change | DATABASE.md |
| AI workflow change | AI_WORKFLOW.md |
| New page/component | UI_UX.md |
| New environment variable | ENVIRONMENT.md |
| Feature completed | PROJECT_STATUS.md |
| Any significant change | CHANGELOG.md |

---

## AI Coding Workflow

If you are an AI coding agent:

1. **Read** AI_CODING_RULES.md first.
2. **Check** PROJECT_STATUS.md for priorities.
3. **Inspect** existing code before writing new code.
4. **Follow** established patterns in the codebase.
5. **Validate** AI output with Zod schemas.
6. **Handle** all error states.
7. **Update** documentation when behavior changes.
8. **Test** your changes.

See [AI_CODING_RULES.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/loopAi/AI_CODING_RULES.md) for the complete rule set.

---

## Questions?

If something is unclear:

1. Check the relevant documentation file
2. Look at existing code for patterns
3. Ask the team before making assumptions
