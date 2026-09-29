# SkillSync AI — Database & Prisma Policy

## 1. Purpose
Define database architecture standards, Prisma ORM usage, connection pooling rules, query safety, and student data integrity requirements for SkillSync AI.

## 2. Scope
Applies to:
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/prisma.ts`
- All database queries across API routes and services (`src/app/api/**`, `src/lib/**`, `scripts/**`)

---

## 3. Required Rules

### 3.1 Database Provider & Architecture
- **Engine:** PostgreSQL (hosted on Supabase).
- **ORM:** Prisma Client (`@prisma/client`).
- **Client Instantiation:** Always import the shared singleton from `@/lib/prisma`. Never instantiate `new PrismaClient()` in route handlers.

### 3.2 Dual Connection URLs & Connection Pooling
In serverless environments (Vercel), connection exhaustion is a primary failure mode. The database configuration must strictly maintain two distinct connection strings in `prisma/schema.prisma`:

1. **`DATABASE_URL` (Runtime / PgBouncer Pooler):**
   - Uses IPv4 PgBouncer transaction-mode pooler on port **6543**.
   - Mandatory query parameters: `pgbouncer=true&connection_limit=1&connect_timeout=30&pool_timeout=30`.
   - Used for all runtime queries in API routes and server components.
2. **`DIRECT_URL` (Session / Direct Connection):**
   - Uses direct connection on port **5432**.
   - Used for schema migrations, `prisma db push`, and seeding operations.

Connection strings must pass through `sanitizeDatabaseUrl()` in `src/lib/prisma.ts` to strip wrapping quotes, bracketed passwords (`[password]`), and URL-encode special characters.

### 3.3 Multi-Tenant Isolation & Ownership Scoping
SkillSync stores private educational records. Cross-tenant leakage is strictly forbidden:
- Every query modifying or fetching user-owned entities MUST filter by `userId`:
  - `Assessment` (`where: { id, userId }`)
  - `LearningProfile` (`where: { userId_subjectId: { userId, subjectId } }` or `where: { userId }`)
  - `LearningPlan` (`where: { id, userId }`)
  - `TutorSession` (`where: { id, userId }`)
  - `Quiz` (`where: { id, userId }`)
  - `ProgressRecord` (`where: { userId }`)
- If a record does not exist for that `userId`, return a **404 Not Found** (NOT a 403 Forbidden) to prevent resource ID enumeration.

```typescript
// CORRECT: Scoped query
const assessment = await prisma.assessment.findFirst({
  where: { id: assessmentId, userId: session.user.id },
});

// WRONG: Insecure query allowing cross-tenant enumeration
const assessment = await prisma.assessment.findUnique({
  where: { id: assessmentId },
});
```

### 3.4 Append-Only Learning Progress & History Preservation
- Student progress records are immutable historical snapshots.
- **NEVER** overwrite, purge, or delete `ProgressRecord` rows when a student takes a new quiz or assessment.
- Always append a new `ProgressRecord` entry recording `overallMastery`, `topicScores`, `trigger`, and `createdAt`.
- When updating learning plans, archive previous active plans by marking `status: "archived"` or `status: "superseded"` rather than deleting rows.

### 3.5 Atomic Transactions
Use `prisma.$transaction()` whenever an operation updates multiple related tables to prevent partial state corruption:
```typescript
await prisma.$transaction(async (tx) => {
  await tx.answer.createMany({ data: answerRecords });
  await tx.topicScore.createMany({ data: topicScoreRecords });
  await tx.assessment.update({
    where: { id: assessmentId },
    data: { status: "completed", overallScore, completedAt: new Date() },
  });
});
```

### 3.6 Performance & Query Optimization
- Use `select` to retrieve only required fields. Never fetch entire user or profile records when only `id` and `name` are needed.
- Use `include` judiciously with relation-level `select` to avoid fetching large unbounded collections.
- Ensure all foreign keys and compound query filters are properly indexed in `prisma/schema.prisma`:
  - `@@index([userId])`
  - `@@index([userId, subjectId])`
  - `@@index([createdAt])`
  - `@@index([topicId])`
  - `@@index([sessionId])`

---

## 4. Forbidden Behavior

- **NEVER** use `prisma.$queryRawUnsafe()` with user-controlled string interpolation. Always use parameterized queries or tagged template `prisma.$queryRaw`.
- **NEVER** execute database migrations or DDL commands (`DROP TABLE`, `TRUNCATE`, `ALTER TABLE`) directly in runtime application code.
- **NEVER** commit SQLite database files (e.g., `dev.db`, `*.sqlite`, `*.db`) to the git repository.
- **NEVER** create unindexed foreign keys in high-traffic models (`Answer`, `TopicScore`, `TutorMessage`, `ProgressRecord`).
- **NEVER** mutate user records across tenants without explicit session-based authorization.

---

## 5. Validation & Checks Before Completion
1. Validate schema: `npx prisma validate`.
2. Generate client: `npx prisma generate`.
3. Verify connection pool parameters are preserved.
4. Ensure no un-indexed foreign key queries or raw string SQL queries were introduced.
