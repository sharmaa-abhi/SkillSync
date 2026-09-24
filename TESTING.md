# LearnLoop AI — Testing Strategy

**Version:** 1.0
**Status:** Pre-Implementation (No tests exist yet)

> ⚠️ **Note:** No tests have been written yet. This document defines the planned testing strategy.

---

## Testing Stack (Planned)

| Tool | Purpose |
|---|---|
| **Jest** | Unit and integration testing |
| **React Testing Library** | Component testing |
| **MSW (Mock Service Worker)** | API mocking |
| **Playwright or Cypress** | End-to-end testing (if time permits) |
| **Zod** | Runtime validation (doubles as test assertions for AI output) |

---

## Unit Testing

### Scope

Test individual functions and utilities in isolation.

### What to Test

| Module | Tests |
|---|---|
| `calculateMastery()` | Correct percentage calculation, rounding, edge cases |
| `classifyMastery()` | Threshold boundaries (0, 40, 41, 70, 71, 100) |
| `validateAIOutput()` | Valid JSON, schema match, sanity checks |
| `buildPrompt()` | Correct context injection, format compliance |
| `calculateTopicScores()` | Per-topic scoring from raw answers |
| `hashPassword()` | Produces valid bcrypt hash |
| `formatDuration()` | Correct time formatting |

### Example

```typescript
describe("classifyMastery", () => {
  it("classifies 0% as weak", () => {
    expect(classifyMastery(0)).toBe("weak");
  });
  it("classifies 40% as weak", () => {
    expect(classifyMastery(40)).toBe("weak");
  });
  it("classifies 41% as medium", () => {
    expect(classifyMastery(41)).toBe("medium");
  });
  it("classifies 70% as medium", () => {
    expect(classifyMastery(70)).toBe("medium");
  });
  it("classifies 71% as strong", () => {
    expect(classifyMastery(71)).toBe("strong");
  });
  it("classifies 100% as strong", () => {
    expect(classifyMastery(100)).toBe("strong");
  });
});
```

---

## Integration Testing

### Scope

Test API routes with mocked database and AI services.

### What to Test

| Route | Tests |
|---|---|
| `POST /api/auth/register` | Successful registration, duplicate email, invalid input |
| `POST /api/assessment/start` | Assessment creation, question loading |
| `POST /api/assessment/:id/submit` | Score calculation, topic scoring, profile creation |
| `POST /api/analysis/generate` | AI analysis trigger, profile update |
| `POST /api/tutor/session/:id/message` | Message storage, AI response |
| `POST /api/quiz/generate` | Quiz creation, question generation |
| `POST /api/quiz/:id/submit` | Scoring, profile update |

---

## API Testing

### Authentication Tests

| Test Case | Expected |
|---|---|
| Access protected route without session | 401 Unauthorized |
| Access protected route with valid session | 200 OK |
| Access another user's assessment | 403 Forbidden |
| Register with valid data | 201 Created |
| Register with duplicate email | 409 Conflict |
| Login with correct credentials | Session token returned |
| Login with wrong password | 401 Unauthorized |

### Input Validation Tests

| Test Case | Expected |
|---|---|
| Submit with empty body | 400 + validation error |
| Submit with wrong data types | 400 + validation error |
| Submit with extra unexpected fields | Fields ignored, valid data processed |
| Submit with missing required fields | 400 + specific field errors |
| Submit with SQL injection attempt | Safely handled (Prisma parameterized) |

---

## AI Testing

### AI Output Validation Tests

| Test Case | Expected |
|---|---|
| AI returns valid JSON matching schema | Parsed and used |
| AI returns invalid JSON | Retry triggered |
| AI returns valid JSON but wrong schema | Retry with schema hint |
| AI returns scores that don't match assessment | Rejected (sanity check) |
| AI returns hallucinated topic names | Rejected |
| AI returns confidence > 1 or < 0 | Rejected |
| AI returns empty weaknesses for a low-scoring student | Flagged as suspicious |
| AI times out | Timeout error displayed |
| AI returns empty response | Retry triggered |

### AI Mock Strategy

```typescript
// Mock AI service for testing
const mockAnalysis = {
  overallAssessment: "Test assessment summary",
  topicMastery: [
    { topicName: "ER Model", masteryLevel: "strong", score: 80, reasoning: "Good" },
    { topicName: "Normalization", masteryLevel: "weak", score: 20, reasoning: "Needs work" },
  ],
  weaknesses: [{ topicName: "Normalization", priority: 1, reason: "Foundational" }],
  recommendations: ["Study Normalization"],
  confidence: 0.85,
};

jest.mock("@/lib/ai/analysis", () => ({
  analyzeLearning: jest.fn().mockResolvedValue(mockAnalysis),
}));
```

---

## UI Testing

### Component Tests

| Component | Tests |
|---|---|
| `QuestionCard` | Renders question, highlights selected option, handles click |
| `Timer` | Counts down, calls onTimeout when done |
| `MasteryBadge` | Correct color for weak/medium/strong |
| `ChatMessage` | Renders student and tutor messages differently |
| `ProgressChart` | Renders with data, shows empty state |
| `LoginForm` | Validates inputs, shows errors, calls onSubmit |

### State Tests

| State | Test |
|---|---|
| Loading | Shows skeleton/spinner |
| Error | Shows error message with retry button |
| Empty | Shows empty state message with CTA |
| Data | Renders data correctly |

---

## Database Testing

| Test Case | Expected |
|---|---|
| Create user with valid data | User record created |
| Create user with duplicate email | Prisma unique constraint error |
| Create assessment with valid references | Assessment linked to user and subject |
| Update learning profile | Profile reflects new data |
| Create progress record | Historical record preserved |
| Query user's assessments | Only returns authenticated user's data |

---

## Accessibility Testing

| Test | Tool |
|---|---|
| Keyboard navigation through all pages | Manual testing |
| Screen reader compatibility | NVDA or VoiceOver |
| Color contrast compliance | axe DevTools |
| Focus indicator visibility | Manual testing |
| Form label associations | axe DevTools |
| ARIA attribute correctness | axe DevTools |

---

## Responsive Testing

| Breakpoint | Device | Tests |
|---|---|---|
| 375px | Mobile (iPhone SE) | All pages render without horizontal scroll, touch targets ≥ 44px |
| 768px | Tablet (iPad) | Two-column layout works, sidebar collapses |
| 1024px | Desktop | Full layout with sidebar |
| 1440px | Large desktop | Content doesn't stretch too wide |

---

## Error Testing

| Scenario | Expected Behavior |
|---|---|
| Network offline | "You appear to be offline" banner |
| API returns 500 | Toast: "Something went wrong. Please try again." |
| AI service down | Inline: "AI is temporarily unavailable." |
| Database connection lost | API returns 500, frontend shows error |
| Session expired | Redirect to login |
| Invalid route | 404 page |

---

## Security Testing

| Test Case | Expected |
|---|---|
| API key visible in client bundle | ❌ Must NOT appear |
| Raw SQL in API routes | ❌ Must use Prisma |
| User A accessing User B's data | 403 Forbidden |
| XSS in user-generated content | Escaped/sanitized |
| Password stored in plain text | ❌ Must be hashed |
| Error messages revealing stack traces | ❌ Generic message only |

---

## End-to-End Testing (If Time Permits)

### Critical Path E2E Test

```
1. Navigate to /register
2. Fill registration form
3. Submit → redirected to /onboarding
4. Complete onboarding → redirected to assessment
5. Complete assessment → see results
6. View dashboard with learning profile
7. Start AI tutor session
8. Send message and receive response
9. End session
10. Take practice quiz
11. Submit quiz → see results
12. View progress page with updated data
```

---

## Test Matrix

| Feature | Unit | Integration | UI | E2E | Status |
|---|---|---|---|---|---|
| Registration | ☐ | ☐ | ☐ | ☐ | PLANNED |
| Login | ☐ | ☐ | ☐ | ☐ | PLANNED |
| Onboarding | ☐ | ☐ | ☐ | ☐ | PLANNED |
| Assessment | ☐ | ☐ | ☐ | ☐ | PLANNED |
| Scoring | ☐ | ☐ | — | ☐ | PLANNED |
| AI Analysis | ☐ | ☐ | — | ☐ | PLANNED |
| Learning Profile | ☐ | ☐ | ☐ | ☐ | PLANNED |
| Learning Plan | ☐ | ☐ | ☐ | ☐ | PLANNED |
| AI Tutor | ☐ | ☐ | ☐ | ☐ | PLANNED |
| Adaptive Quiz | ☐ | ☐ | ☐ | ☐ | PLANNED |
| Progress Tracking | ☐ | ☐ | ☐ | ☐ | PLANNED |
| Profile Updates | ☐ | ☐ | — | ☐ | PLANNED |

---

## Edge Cases Checklist

- [ ] Empty assessment (0 questions answered)
- [ ] All answers correct (100% score)
- [ ] All answers wrong (0% score)
- [ ] Assessment with unanswered questions
- [ ] Assessment timeout with partial answers
- [ ] Duplicate assessment submission
- [ ] AI returns invalid JSON
- [ ] AI returns valid JSON but wrong schema
- [ ] AI timeout (> 15 seconds)
- [ ] AI returns scores that contradict actual scores
- [ ] Learning profile with no weak topics
- [ ] Learning profile with all topics weak
- [ ] Quiz with 0 questions (generation failure)
- [ ] Tutor session with empty message
- [ ] Multiple concurrent assessments
- [ ] Unauthorized access to another user's data
- [ ] Session expiry during assessment
- [ ] Browser refresh during assessment
- [ ] Network failure during AI response
