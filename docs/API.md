# SkillSync AI — API Documentation

**Version:** 2.0
**Status:** 🟢 Partially Implemented (Auth, Assessment & Analysis APIs Live)

> Core API endpoints for authentication, registration, assessment, and AI analysis are implemented. Tutor, quiz, and progress APIs are in active development.

---

## Base URL

```
Development: http://localhost:3000/api
Production:  https://<deployment-url>/api
```

## Authentication

All protected endpoints require a valid NextAuth.js session. Include the session cookie automatically managed by NextAuth.

**Unauthenticated requests** to protected endpoints return:

```json
{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required.", "status": 401 } }
```

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description.",
    "status": 400
  }
}
```

---

## Authentication APIs

### POST /api/auth/[...nextauth]

> Handled by NextAuth.js. See [NextAuth documentation](https://next-auth.js.org/).

**STATUS: PLANNED**

Supported operations:
- `POST /api/auth/signin` — Sign in with credentials
- `POST /api/auth/signout` — Sign out
- `GET /api/auth/session` — Get current session

---

### POST /api/auth/register

**STATUS: PLANNED**

Register a new user account.

| Property | Value |
|---|---|
| Method | POST |
| Auth | None |
| Purpose | Create a new user account |

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "name": "Aarav Sharma"
}
```

**Validation:**
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `name`: Required, minimum 2 characters

**Success Response (201):**

```json
{
  "user": {
    "id": "clx...",
    "email": "student@example.com",
    "name": "Aarav Sharma",
    "onboardingCompleted": false
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| 400 | VALIDATION_ERROR | Invalid input data |
| 409 | EMAIL_EXISTS | Email already registered |
| 500 | INTERNAL_ERROR | Server error |

---

## User APIs

### GET /api/users/me

**STATUS: PLANNED**

Get the current user's profile.

| Property | Value |
|---|---|
| Method | GET |
| Auth | Required |
| Purpose | Retrieve authenticated user profile |

**Success Response (200):**

```json
{
  "user": {
    "id": "clx...",
    "email": "student@example.com",
    "name": "Aarav Sharma",
    "educationLevel": "B.Tech CSE - 3rd Year",
    "learningGoals": "Pass DBMS exam with 70%+",
    "onboardingCompleted": true,
    "createdAt": "2026-09-24T10:00:00Z"
  }
}
```

---

### PUT /api/users/onboarding

**STATUS: PLANNED**

Complete the onboarding process.

| Property | Value |
|---|---|
| Method | PUT |
| Auth | Required |
| Purpose | Save onboarding data and mark as complete |

**Request Body:**

```json
{
  "educationLevel": "B.Tech CSE - 3rd Year",
  "learningGoals": "Pass DBMS exam with 70%+"
}
```

**Success Response (200):**

```json
{
  "user": {
    "id": "clx...",
    "educationLevel": "B.Tech CSE - 3rd Year",
    "learningGoals": "Pass DBMS exam with 70%+",
    "onboardingCompleted": true
  }
}
```

---

## Subject APIs

### GET /api/subjects

**STATUS: PLANNED**

List all available subjects.

| Property | Value |
|---|---|
| Method | GET |
| Auth | Required |
| Purpose | List subjects for selection |

**Success Response (200):**

```json
{
  "subjects": [
    {
      "id": "clx...",
      "name": "Database Management Systems",
      "description": "Study of database design, SQL, normalization, and more.",
      "icon": "🗄️",
      "topicCount": 8
    }
  ]
}
```

---

### GET /api/subjects/:subjectId/topics

**STATUS: PLANNED**

List all topics for a subject.

| Property | Value |
|---|---|
| Method | GET |
| Auth | Required |
| Purpose | List topics within a subject |

**Parameters:**
- `subjectId` (path): Subject ID

**Success Response (200):**

```json
{
  "topics": [
    {
      "id": "clx...",
      "name": "ER Model",
      "description": "Entity-Relationship modeling and diagrams",
      "order": 1,
      "difficulty": "beginner"
    }
  ]
}
```

---

## Assessment APIs

### POST /api/assessment/start

**STATUS: PLANNED**

Start a new diagnostic assessment.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Create assessment and return questions |

**Request Body:**

```json
{
  "subjectId": "clx..."
}
```

**Success Response (201):**

```json
{
  "assessment": {
    "id": "clx...",
    "subjectId": "clx...",
    "totalQuestions": 30,
    "timeLimitMinutes": 30,
    "questions": [
      {
        "id": "clx...",
        "text": "Which of the following is a key property of 2NF?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "topicId": "clx...",
        "topicName": "Normalization"
      }
    ]
  }
}
```

> **Note:** `correctAnswer` is NOT included in the response to prevent cheating.

---

### POST /api/assessment/:assessmentId/submit

**STATUS: PLANNED**

Submit assessment answers.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Submit answers, calculate scores |

**Parameters:**
- `assessmentId` (path): Assessment ID

**Request Body:**

```json
{
  "answers": [
    { "questionId": "clx...", "selectedOption": 2 },
    { "questionId": "clx...", "selectedOption": 0 },
    { "questionId": "clx...", "selectedOption": null }
  ],
  "timeTakenSeconds": 1200
}
```

**Success Response (200):**

```json
{
  "result": {
    "assessmentId": "clx...",
    "overallScore": 55.0,
    "totalQuestions": 30,
    "correctAnswers": 16,
    "topicScores": [
      {
        "topicId": "clx...",
        "topicName": "ER Model",
        "totalQuestions": 5,
        "correctAnswers": 4,
        "percentage": 80.0,
        "masteryLevel": "strong"
      },
      {
        "topicId": "clx...",
        "topicName": "Normalization",
        "totalQuestions": 5,
        "correctAnswers": 1,
        "percentage": 20.0,
        "masteryLevel": "weak"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| 400 | ALREADY_SUBMITTED | Assessment already submitted |
| 404 | ASSESSMENT_NOT_FOUND | Assessment does not exist |
| 403 | NOT_OWNER | Assessment belongs to another user |

---

### GET /api/assessment/:assessmentId/results

**STATUS: PLANNED**

Get assessment results with detailed breakdown.

| Property | Value |
|---|---|
| Method | GET |
| Auth | Required |
| Purpose | Retrieve scored assessment results |

**Success Response (200):**

Same structure as submit response, plus:

```json
{
  "result": {
    "...": "...",
    "answers": [
      {
        "questionId": "clx...",
        "questionText": "Which of the following...",
        "selectedOption": 2,
        "correctAnswer": 1,
        "isCorrect": false,
        "explanation": "The correct answer is...",
        "topicName": "Normalization"
      }
    ]
  }
}
```

---

## AI Analysis APIs

### POST /api/analysis/generate

**STATUS: PLANNED**

Trigger AI analysis of assessment results.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Run AI analysis on assessment results, create/update learning profile |

**Request Body:**

```json
{
  "assessmentId": "clx..."
}
```

**Success Response (200):**

```json
{
  "analysis": {
    "overallAssessment": "The student has foundational understanding but...",
    "topicMastery": [
      {
        "topicName": "Normalization",
        "masteryLevel": "weak",
        "score": 20,
        "reasoning": "Student only answered 1/5 correctly..."
      }
    ],
    "weaknesses": [
      {
        "topicName": "Normalization",
        "priority": 1,
        "reason": "Foundational topic..."
      }
    ],
    "recommendations": ["Start with Normalization..."],
    "confidence": 0.85
  },
  "learningProfile": {
    "id": "clx...",
    "overallMastery": 55,
    "strengths": ["ER Model", "Indexing"],
    "weaknesses": ["Normalization", "Transactions", "Concurrency Control"]
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| 404 | ASSESSMENT_NOT_FOUND | Assessment does not exist |
| 400 | ASSESSMENT_NOT_COMPLETED | Assessment not yet submitted |
| 502 | AI_SERVICE_ERROR | AI service failed |
| 504 | AI_TIMEOUT | AI response timed out |

---

### GET /api/analysis/profile

**STATUS: PLANNED**

Get the current learning profile for a subject.

| Property | Value |
|---|---|
| Method | GET |
| Auth | Required |
| Purpose | Retrieve student learning profile |

**Query Parameters:**
- `subjectId` (required): Subject ID

**Success Response (200):**

```json
{
  "profile": {
    "id": "clx...",
    "overallMastery": 55,
    "topicMastery": [
      {
        "topicName": "Normalization",
        "masteryLevel": "weak",
        "currentScore": 20,
        "previousScore": null,
        "trend": "new"
      }
    ],
    "strengths": ["ER Model", "Indexing"],
    "weaknesses": ["Normalization", "Transactions"],
    "assessmentCount": 1,
    "quizCount": 0,
    "lastAssessedAt": "2026-09-24T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| 404 | PROFILE_NOT_FOUND | No learning profile exists for this subject |

---

## Learning Plan APIs

### POST /api/learning-plan/generate

**STATUS: PLANNED**

Generate a personalized learning plan using AI.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Generate AI-powered study plan based on learning profile |

**Request Body:**

```json
{
  "subjectId": "clx..."
}
```

**Success Response (201):**

```json
{
  "plan": {
    "id": "clx...",
    "title": "DBMS Recovery Plan — Focus on Normalization & Transactions",
    "estimatedDuration": "8-10 hours",
    "status": "active",
    "items": [
      {
        "id": "clx...",
        "topicName": "Normalization",
        "order": 1,
        "priority": "critical",
        "estimatedMinutes": 180,
        "objectives": ["Understand functional dependencies", "..."],
        "activities": ["AI Tutor session on...", "..."],
        "status": "pending"
      }
    ]
  }
}
```

---

### GET /api/learning-plan/current

**STATUS: PLANNED**

Get the current active learning plan.

| Property | Value |
|---|---|
| Method | GET |
| Auth | Required |
| Purpose | Retrieve active learning plan |

**Query Parameters:**
- `subjectId` (required): Subject ID

---

## Tutor APIs

### POST /api/tutor/session

**STATUS: PLANNED**

Start a new AI tutor session.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Create a tutoring session on a specific topic |

**Request Body:**

```json
{
  "topicId": "clx..."
}
```

**Success Response (201):**

```json
{
  "session": {
    "id": "clx...",
    "topicName": "Normalization",
    "status": "active",
    "messages": []
  }
}
```

---

### POST /api/tutor/session/:sessionId/message

**STATUS: PLANNED**

Send a message in a tutor session.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Send student message, get AI tutor response |

**Request Body:**

```json
{
  "content": "I don't understand 2NF. Can you explain?"
}
```

**Success Response (200):**

```json
{
  "studentMessage": {
    "id": "clx...",
    "role": "student",
    "content": "I don't understand 2NF. Can you explain?",
    "createdAt": "2026-09-24T10:05:00Z"
  },
  "tutorResponse": {
    "id": "clx...",
    "role": "tutor",
    "content": "Of course! Let me break down 2NF step by step...\n\n**First, let's understand what 2NF requires:**\n\nA table is in 2NF if...",
    "createdAt": "2026-09-24T10:05:03Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| 404 | SESSION_NOT_FOUND | Session does not exist |
| 400 | SESSION_ENDED | Session has been completed |
| 502 | AI_SERVICE_ERROR | AI tutor failed to respond |

---

### POST /api/tutor/session/:sessionId/end

**STATUS: PLANNED**

End a tutor session.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Mark session as completed, update profile |

**Success Response (200):**

```json
{
  "session": {
    "id": "clx...",
    "status": "completed",
    "messageCount": 8,
    "duration": "15 minutes"
  }
}
```

---

## Quiz APIs

### POST /api/quiz/generate

**STATUS: PLANNED**

Generate an adaptive quiz targeting weak topics.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Generate AI-powered adaptive quiz |

**Request Body:**

```json
{
  "subjectId": "clx...",
  "questionCount": 5,
  "topicIds": ["clx...", "clx..."]
}
```

> If `topicIds` is omitted, the system automatically targets the student's weakest topics.

**Success Response (201):**

```json
{
  "quiz": {
    "id": "clx...",
    "title": "Normalization Practice",
    "difficulty": "easy-to-medium",
    "totalQuestions": 5,
    "questions": [
      {
        "id": "clx...",
        "text": "Which of the following is required for 2NF?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "topic": "Normalization",
        "difficulty": "easy",
        "order": 1
      }
    ]
  }
}
```

> **Note:** `correctAnswer` is NOT included to prevent cheating.

---

### POST /api/quiz/:quizId/submit

**STATUS: PLANNED**

Submit quiz answers.

| Property | Value |
|---|---|
| Method | POST |
| Auth | Required |
| Purpose | Submit answers, score quiz, update learning profile |

**Request Body:**

```json
{
  "answers": [
    { "questionId": "clx...", "selectedOption": 1 }
  ]
}
```

**Success Response (200):**

```json
{
  "result": {
    "quizId": "clx...",
    "score": 60.0,
    "totalQuestions": 5,
    "correctAnswers": 3,
    "questions": [
      {
        "questionId": "clx...",
        "selectedOption": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "explanation": "Correct! 2NF requires..."
      }
    ],
    "profileUpdate": {
      "topicChanges": [
        {
          "topicName": "Normalization",
          "previousScore": 20,
          "newScore": 35,
          "trend": "improving"
        }
      ]
    }
  }
}
```

---

## Progress APIs

### GET /api/progress

**STATUS: PLANNED**

Get progress history for a subject.

| Property | Value |
|---|---|
| Method | GET |
| Auth | Required |
| Purpose | Retrieve progress timeline |

**Query Parameters:**
- `subjectId` (required): Subject ID

**Success Response (200):**

```json
{
  "progress": {
    "currentMastery": 55,
    "timeline": [
      {
        "date": "2026-09-24T10:00:00Z",
        "trigger": "assessment",
        "overallMastery": 55,
        "topicScores": {
          "ER Model": 80,
          "Normalization": 20,
          "SQL Queries": 60
        }
      }
    ],
    "topicTrends": [
      {
        "topicName": "Normalization",
        "scores": [20],
        "trend": "new"
      }
    ],
    "summary": {
      "assessmentsTaken": 1,
      "quizzesCompleted": 0,
      "tutorSessions": 0,
      "totalStudyMinutes": 20
    }
  }
}
```

---

### GET /api/progress/dashboard

**STATUS: PLANNED**

Get dashboard summary data.

| Property | Value |
|---|---|
| Method | GET |
| Auth | Required |
| Purpose | Aggregated dashboard data |

**Success Response (200):**

```json
{
  "dashboard": {
    "overallMastery": 55,
    "strongTopics": 2,
    "weakTopics": 3,
    "mediumTopics": 1,
    "activePlan": {
      "title": "DBMS Recovery Plan",
      "progress": "0/3 items completed"
    },
    "nextRecommendation": {
      "type": "tutor",
      "topic": "Normalization",
      "reason": "Your weakest topic — start here"
    },
    "recentActivity": [
      {
        "type": "assessment",
        "subject": "DBMS",
        "score": 55,
        "date": "2026-09-24T10:00:00Z"
      }
    ]
  }
}
```

---

## API Summary

| Method | Route | Purpose | Status |
|---|---|---|:---:|
| POST | `/api/auth/register` | Register new user into Supabase Auth & PostgreSQL with retry | ACTIVE |
| POST | `/api/auth/[...nextauth]` | NextAuth session authentication handlers | ACTIVE |
| GET | `/api/health` | System health check & environment configuration inspection | ACTIVE |
| GET | `/api/subjects` | List all curriculum tracks & active topics | ACTIVE |
| POST | `/api/assessment/start` | Start diagnostic assessment (zero answer leakage) | ACTIVE |
| POST | `/api/assessment/submit` | Submit assessment answers & compute topic scores | ACTIVE |
| POST | `/api/analysis` | Run Gemini AI analysis & detect prerequisite gaps | ACTIVE |
| POST | `/api/learning-plan` | Generate personalized study milestones | ACTIVE |
| POST | `/api/tutor` | Socratic conversational AI tutoring with student context | ACTIVE |
| POST | `/api/tutor/summarize` | Generate structured markdown study notes & revision cards | ACTIVE |
| POST | `/api/quiz` | Adaptive practice question generation & mastery sync | ACTIVE |
| GET | `/api/review` | Spaced repetition card queue based on SM-2 forgetting curve | ACTIVE |
| GET | `/api/analytics/cohort` | Benchmark student mastery against cohort historical bottlenecks | ACTIVE |

---

## Future API Specifications (Phase 3 & 4 — v2 Endpoints)

The following endpoints represent the v2 API contract planned for Multimodal Voice, Vision, FSRS, and Institutional scaling.

### 1. WebSocket /api/v2/voice/stream (Phase 3)
Full-duplex bidirectional audio streaming with Gemini 2.0 Live.

| Property | Value |
|---|---|
| Protocol | WebSocket (`wss://`) |
| Auth | Bearer Token in connection handshake (`Sec-WebSocket-Protocol`) |
| Direction | Bidirectional PCM 16kHz / Opus audio chunks |

**Inbound Client Frame:**
```json
{
  "type": "audio_chunk",
  "data": "base64_encoded_pcm_or_opus...",
  "timestamp": 1727712000000
}
```

**Outbound Server Frame:**
```json
{
  "type": "tutor_audio",
  "data": "base64_encoded_audio...",
  "interrupted": false,
  "transcript": "Let's check your base case first. What happens when n = 0?"
}
```

---

### 2. POST /api/v2/vision/solve (Phase 3)
Processes uploaded student handwritten notes, math formulas, or circuit diagrams.

| Property | Value |
|---|---|
| Method | POST (Multipart / Form-Data or JSON Base64) |
| Auth | Required (Bearer Session) |
| Purpose | Extract equations, detect step-by-step errors, generate Socratic hints |

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "topic": "Quadratic Equations",
  "problemContext": "Factorise 2x^2 + 5x + 3"
}
```

**Response (200 OK):**
```json
{
  "detectedWorking": [
    { "step": 1, "latex": "2x^2 + 5x + 3 = 0", "isCorrect": true },
    { "step": 2, "latex": "ac = 2 \\times 3 = 6;\\quad p+q = 5 \\implies p=2, q=3", "isCorrect": true },
    { "step": 3, "latex": "2x^2 + 2x + 3x + 3", "isCorrect": true },
    { "step": 4, "latex": "2x(x + 1) + 3(x - 1)", "isCorrect": false, "errorType": "Sign distribution error" }
  ],
  "socraticHint": "Look closely at step 4 when factoring out +3 from (3x + 3). Does +3 * (-1) equal +3?",
  "recommendedAction": "review_distributive_law"
}
```

---

### 3. POST /api/v2/fsrs/review (Phase 3)
Calculates personalized retention intervals using FSRS v4 memory parameters.

**Request Body:**
```json
{
  "cardId": "card_9812",
  "grade": 3,
  "elapsedDays": 4.2
}
```

**Response (200 OK):**
```json
{
  "stability": 8.45,
  "difficulty": 4.12,
  "retrievability": 0.91,
  "nextReviewDays": 8,
  "nextDueDate": "2026-10-08T15:30:00.000Z"
}
```

---

### 4. GET /api/v2/educator/classrooms/:id/bottlenecks (Phase 4)
Returns aggregate class knowledge distribution and detected syllabus bottlenecks for faculty.

**Response (200 OK):**
```json
{
  "classroomId": "class_gate_2027",
  "totalStudents": 64,
  "activeSubject": "DBMS",
  "criticalBottlenecks": [
    {
      "topic": "Normalization",
      "weakPercentage": 68.75,
      "prerequisiteGaps": ["Functional Dependencies"],
      "recommendedAction": "Schedule 30-min live review on BCNF decomposition before Exam 2"
    }
  ],
  "masteryDistribution": {
    "weak": 24,
    "medium": 28,
    "strong": 12
  }
}
```
