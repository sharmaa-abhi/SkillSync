# SkillSync AI — Security Documentation

**Version:** 1.0
**Status:** Pre-Implementation

> ⚠️ **Note:** This documents the planned security measures. Since no code exists yet, all items are planned implementations. Items marked **[PRODUCTION]** are recommended for production but may be deferred during hackathon development.

---

## Authentication

### Current Plan

| Measure | Implementation | Status |
|---|---|---|
| Password hashing | bcrypt with salt rounds ≥ 10 | PLANNED |
| Session management | NextAuth.js JWT sessions | PLANNED |
| Session expiry | 24-hour session lifetime | PLANNED |
| Secure cookies | `httpOnly`, `secure`, `sameSite` flags | PLANNED |
| Login rate limiting | **[PRODUCTION]** | DEFERRED |
| Password complexity requirements | Minimum 8 characters | PLANNED |
| Account lockout after failed attempts | **[PRODUCTION]** | DEFERRED |
| Password reset flow | **[PRODUCTION]** | DEFERRED |

### Recommendations for Production

- Add OAuth providers (Google, GitHub) for passwordless login
- Implement multi-factor authentication (MFA)
- Add brute-force protection with exponential backoff
- Implement account lockout after 5 failed attempts

---

## Authorization

### Current Plan

| Measure | Implementation | Status |
|---|---|---|
| Route protection | NextAuth.js middleware | PLANNED |
| Data ownership checks | Verify `userId` on every query | PLANNED |
| Admin role | **[PRODUCTION]** Not needed for MVP | DEFERRED |

### Authorization Rules

```
- Users can ONLY access their own data
- Assessment results belong to the user who took them
- Learning profiles belong to the user
- Tutor sessions belong to the user
- No cross-user data access is permitted
```

### Implementation Pattern

```typescript
// Every data query must include userId check
const assessment = await prisma.assessment.findFirst({
  where: {
    id: assessmentId,
    userId: session.user.id,  // CRITICAL: Always filter by authenticated user
  },
});

if (!assessment) {
  return Response.json({ error: "Not found" }, { status: 404 });
  // Return 404, not 403, to prevent data enumeration
}
```

---

## API Key Protection

### Current Plan

| Measure | Implementation | Status |
|---|---|---|
| Server-side only AI keys | `process.env.GEMINI_API_KEY` in API routes only | PLANNED |
| No client-side API key exposure | Never import env vars in client components | PLANNED |
| `.env.local` gitignored | `.gitignore` includes `.env.local` | PLANNED |
| `.env.example` with placeholders | Public template with `your_key_here` values | PLANNED |

### Verification Checklist

- [ ] `GEMINI_API_KEY` never appears in any client-side bundle
- [ ] No `NEXT_PUBLIC_` prefix on secret environment variables
- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys in source code, comments, or documentation
- [ ] Build output does not contain API keys

---

## Environment Variables

### Classification

| Variable | Sensitivity | Client Accessible |
|---|---|---|
| `DATABASE_URL` | 🔴 Secret | ❌ No |
| `NEXTAUTH_SECRET` | 🔴 Secret | ❌ No |
| `GEMINI_API_KEY` | 🔴 Secret | ❌ No |
| `NEXTAUTH_URL` | 🟡 Config | ❌ No |
| `NEXT_PUBLIC_APP_URL` | 🟢 Public | ✅ Yes |

### Rules

- **NEVER** prefix secrets with `NEXT_PUBLIC_`
- **NEVER** commit `.env.local` or any file containing real secrets
- **ALWAYS** use `.env.example` with placeholder values
- **ALWAYS** access secrets only in server-side code (API routes, server components)

---

## Input Validation

### Current Plan

| Measure | Implementation | Status |
|---|---|---|
| Server-side validation | Zod schemas on all API routes | PLANNED |
| Client-side validation | HTML5 + React form validation (UX only) | PLANNED |
| Type coercion prevention | Strict Zod parsing | PLANNED |
| Maximum input lengths | Zod `.max()` on string fields | PLANNED |

### Validation Examples

```typescript
// Registration input
const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
});

// Assessment answer input
const AnswerSchema = z.object({
  questionId: z.string().cuid(),
  selectedOption: z.number().int().min(0).max(3).nullable(),
});

// Tutor message input
const MessageSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
});
```

---

## AI Prompt Security

### Current Plan

| Measure | Implementation | Status |
|---|---|---|
| Prompts are server-side only | Prompt templates in `lib/ai/prompts.ts` | PLANNED |
| No user input directly in system prompts | User input goes in CONTEXT section only | PLANNED |
| Output validation | Zod schema validation on all AI output | PLANNED |
| No PII in prompts | Use anonymized student data | PLANNED |

### Prompt Injection Prevention

```typescript
// CORRECT: User input is data, not instructions
const prompt = `
SYSTEM: You are an educational AI tutor...

CONTEXT:
Student question: ${sanitize(userMessage)}

TASK: Respond to the student's question about ${topicName}.
`;

// WRONG: User input could modify instructions
const prompt = `You are a tutor. ${userMessage}`;
```

### Sanitization

- Strip HTML tags from user-generated content
- Limit message length (max 2000 characters)
- Reject messages that contain obvious prompt injection patterns (as a best effort)
- Never include system prompts in API responses

---

## Student Data Protection

### Data Classification

| Data Type | Sensitivity | Storage | Access |
|---|---|---|---|
| Email | Medium | Database (encrypted at rest) | User only |
| Password | High | Database (bcrypt hash only) | Never retrievable |
| Assessment scores | Medium | Database | User only |
| Learning profile | Medium | Database | User only |
| Tutor conversations | Medium | Database | User only |
| AI analysis | Low | Database | User only |

### Rules

- Student data is private by default — only the authenticated student can access their own data
- Assessment scores and learning profiles are never shared between students
- Tutor conversation history is stored but only accessible to the student
- No student data is used for training or shared with third parties
- **[PRODUCTION]** Implement data export (GDPR-like compliance)
- **[PRODUCTION]** Implement account deletion with data purge

---

## Database Security

### Current Plan

| Measure | Implementation | Status |
|---|---|---|
| Parameterized queries | Prisma ORM (built-in) | PLANNED |
| Connection string protection | Environment variable | PLANNED |
| Database user permissions | Read/write only, no admin | PLANNED (depends on host) |
| Encryption at rest | **[PRODUCTION]** Managed database feature | DEFERRED |
| Database backups | **[PRODUCTION]** Automated backups | DEFERRED |

### SQL Injection Prevention

Prisma ORM uses parameterized queries by default. **Never** use `prisma.$queryRawUnsafe()` with user input.

```typescript
// SAFE: Prisma parameterized query
const user = await prisma.user.findUnique({ where: { email } });

// SAFE: Prisma raw query with parameters
const result = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

// DANGEROUS: Never do this
const result = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);
```

---

## Rate Limiting

### Current Plan (MVP)

Rate limiting is **not implemented** in the MVP. For the hackathon, this is acceptable with limited users.

### Production Recommendations

| Endpoint | Rate Limit |
|---|---|
| `POST /api/auth/register` | 5 requests per IP per hour |
| `POST /api/auth/signin` | 10 requests per IP per minute |
| `POST /api/analysis/generate` | 10 requests per user per hour |
| `POST /api/tutor/session/:id/message` | 30 requests per user per minute |
| `POST /api/quiz/generate` | 10 requests per user per hour |

### Implementation Options

- Vercel Edge Middleware with rate limiting
- `next-rate-limit` or `limiter` npm packages
- Redis-based rate limiting (production)

---

## Error Message Safety

### Rules

- **Never** expose stack traces in API responses
- **Never** expose database error details to the client
- **Never** expose internal paths or configuration
- **Always** return generic error messages to the user

```typescript
// CORRECT: Generic error message
catch (error) {
  console.error("[ASSESSMENT_SUBMIT]", error); // Log details server-side
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } },
    { status: 500 }
  );
}

// WRONG: Leaking details
catch (error) {
  return Response.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  );
}
```

---

## Sensitive Data Handling

### What NOT to Log

- Passwords (even hashed)
- Full API keys
- Session tokens
- Personal student data (email, name) in production logs

### What IS Safe to Log

- Request method and route
- User ID (anonymized in production)
- Error codes and types
- AI request/response metadata (not full content)
- Performance metrics

---

## Security Checklist

### Before Hackathon Demo

- [ ] No API keys in source code
- [ ] `.env.local` is gitignored
- [ ] All API routes check authentication
- [ ] All data queries filter by authenticated user
- [ ] API input is validated with Zod
- [ ] AI output is validated with Zod
- [ ] Error messages don't leak internals
- [ ] Passwords are hashed with bcrypt

### Before Production (Future)

- [ ] Rate limiting on all endpoints
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] CSP headers set
- [ ] Database encryption at rest
- [ ] Automated backups
- [ ] Audit logging
- [ ] Penetration testing
- [ ] GDPR compliance (data export, deletion)
- [ ] Security headers (Helmet.js or equivalent)
