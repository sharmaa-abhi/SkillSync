# SkillSync AI — Hackathon Demo Flow

**Duration:** 2–3 minutes
**Focus:** The AI adaptive learning loop — not a feature tour.

---

## Demo Story

> **Meet Aarav.** He's a 3rd-year B.Tech CSE student preparing for his DBMS exam. He knows he's struggling, but he doesn't know *which specific topics* are weak. SkillSync AI will figure that out and create a personalized path to help him improve.

---

## Demo Script

### 0:00 – 0:15 | Opening (Landing Page)

**Screen:** Landing page

**Action:** Show the landing page briefly.

**Say:**
> "This is SkillSync AI — an AI-powered adaptive learning platform. Unlike generic study tools, SkillSync continuously adapts to what each student actually understands. Let me show you how."

**Click:** "Get Started" button

---

### 0:15 – 0:30 | Registration & Onboarding

**Screen:** Register → Onboarding

**Action:** Quick registration (use pre-filled or fast typing).

**Say:**
> "Aarav signs up and tells us he's a 3rd-year B.Tech student. His goal: pass DBMS with 70% or higher."

**Action:** Complete onboarding steps. Select "Database Management Systems" as subject.

**Say:**
> "He selects DBMS as his subject. Now, before we can help him, we need to understand what he knows and doesn't know."

---

### 0:30 – 1:00 | Diagnostic Assessment

**Screen:** Assessment page

**Action:** Show the assessment interface. Answer a few questions quickly (intentionally get some Normalization and Transaction questions wrong).

**Say:**
> "SkillSync gives Aarav a diagnostic assessment covering all DBMS topics — ER Model, Normalization, SQL, Transactions, Indexing, and more. Each question is mapped to a specific topic."

**Action:** Submit the assessment.

**Say:**
> "Let's see what happens when he submits."

---

### 1:00 – 1:30 | AI Analysis & Learning Profile

**Screen:** Results → Dashboard (Learning Profile)

**Action:** Show the topic-by-topic results. Highlight the AI analysis.

**Say:**
> "Here's where the AI kicks in. SkillSync doesn't just show a score — it analyzes *every topic individually*. Look: Aarav scored 80% on ER Model — that's strong. But Normalization is at 20% and Transactions at 40% — those are weak."

**Action:** Point to the weakness reasoning.

**Say:**
> "The AI explains *why* — Aarav struggles with functional dependencies and can't distinguish isolation levels. This isn't a generic summary — it's a detailed learning profile."

**Expected Result:** Dashboard shows color-coded topic mastery — green for strong, red for weak.

---

### 1:30 – 1:50 | Personalized Learning Plan

**Screen:** Dashboard → Learning Plan

**Action:** Show the AI-generated learning plan.

**Say:**
> "Based on this profile, the AI generates a personalized study plan. Notice it starts with Normalization — Aarav's weakest foundational topic — not random review. Each item has specific objectives and estimated time."

**Expected Result:** Plan shows prioritized items: Normalization (critical) → Transactions (high) → Concurrency Control (medium).

---

### 1:50 – 2:15 | AI Tutor

**Screen:** AI Tutor page

**Action:** Start a tutor session on "Normalization." Type a question like "I don't understand 2NF."

**Say:**
> "Now Aarav starts an AI tutoring session on Normalization — his weakest topic. The AI tutor isn't a generic chatbot. It knows Aarav scored 20% and struggles with partial dependencies. Watch how it teaches *at his level*."

**Action:** Show the AI tutor response — it should teach, not just answer.

**Say:**
> "It explains concepts step by step, uses examples, and checks understanding. This is personalized tutoring."

**Expected Result:** AI response references the student's level and provides educational explanation.

---

### 2:15 – 2:40 | Adaptive Quiz & Profile Update

**Screen:** Practice page

**Action:** Start an adaptive quiz. Show that questions target Normalization. Answer and submit.

**Say:**
> "After studying, Aarav takes an adaptive practice quiz. Notice the questions focus on Normalization — his weak area — not topics he already knows. The difficulty matches his current level."

**Action:** Submit the quiz. Show the profile update.

**Say:**
> "After the quiz, his learning profile updates. Normalization went from 20% to 35%. The trend shows 'improving.' And look — the next recommendation has changed because his profile changed."

**Expected Result:** Dashboard shows updated mastery score and changed recommendation.

---

### 2:40 – 3:00 | Closing — The Loop

**Screen:** Dashboard with updated profile

**Say:**
> "This is the SkillSync AI adaptive loop: Assess → Analyze → Personalize → Learn → Practice → Update → Personalize again. Every activity feeds back into the student's profile. The learning path is never static — it evolves with the student."

> "SkillSync AI doesn't give every student the same path. It continuously adapts based on what each student actually understands."

---

## Demo Preparation Checklist

- [ ] Database seeded with DBMS subject, topics, and questions
- [ ] Google Gemini API key configured and working
- [ ] Application running locally on `localhost:3000`
- [ ] Test user already registered (or fast registration prepared)
- [ ] Assessment questions allow intentional wrong answers on specific topics
- [ ] AI analysis endpoint is responsive (< 5 seconds)
- [ ] AI tutor endpoint is responsive (< 3 seconds)
- [ ] Dashboard correctly shows color-coded mastery
- [ ] Learning plan generates correctly
- [ ] Practice quiz targets weak topics
- [ ] Profile updates after quiz submission
- [ ] Screen resolution appropriate for projection
- [ ] Browser in fullscreen or presentation mode
- [ ] No browser tabs with unrelated content

## Backup Plan

If AI service is slow or unavailable during demo:

1. **Pre-generate** AI analysis and store it in the database before the demo
2. Have screenshots of each key screen ready
3. Explain the adaptive loop conceptually if live demo fails
4. Show the AI prompt structure and explain what would happen

## Key Demo Phrases

- "The AI doesn't just give a score — it identifies *specific* weak topics."
- "Notice the AI explains *why* this topic is weak."
- "The learning plan is personalized — it prioritizes what Aarav needs most."
- "The AI tutor knows Aarav's profile — it teaches at his level."
- "The quiz targets weak topics, not random review."
- "After every activity, the profile updates and recommendations change."
- "The loop never stops — it continuously adapts."
