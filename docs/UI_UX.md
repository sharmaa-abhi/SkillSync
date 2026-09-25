# SkillSync AI — UI/UX Documentation

**Version:** 1.0
**Status:** Pre-Implementation (Design Phase)

> ⚠️ **Note:** No UI has been implemented yet. This document defines the planned UX specification.

---

## Design Principles

1. **Clarity Over Complexity** — Every screen should have a single clear purpose. Don't overwhelm students with data.
2. **Progress is Motivating** — Make improvement visible. Use visual indicators to show growth.
3. **AI Transparency** — Show why AI recommends something, not just what it recommends.
4. **Mobile-First, Desktop-Enhanced** — Start with mobile layout, enhance for larger screens.
5. **Accessible by Default** — Semantic HTML, keyboard navigation, sufficient contrast.
6. **Minimal Friction** — Reduce clicks between the student and their learning path.

---

## Visual Direction

### Theme

Modern, clean, educational — not corporate. Friendly but professional. Inspired by platforms like Duolingo (engagement), Khan Academy (education focus), and Notion (clean UI).

### Dark Mode

- Primary mode: Light
- Dark mode: Planned for future

### Key Visual Elements

- Rounded corners on cards and buttons (border-radius: 12px)
- Subtle shadows for depth (shadow-md)
- Gradient accents for CTAs and progress indicators
- Smooth transitions (200ms ease)
- Micro-animations on state changes

---

## Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Headings (h1) | Inter | 2rem (32px) | 700 (Bold) |
| Headings (h2) | Inter | 1.5rem (24px) | 600 (SemiBold) |
| Headings (h3) | Inter | 1.25rem (20px) | 600 (SemiBold) |
| Body | Inter | 1rem (16px) | 400 (Regular) |
| Small text | Inter | 0.875rem (14px) | 400 (Regular) |
| Caption | Inter | 0.75rem (12px) | 400 (Regular) |
| Code/Mono | JetBrains Mono | 0.875rem | 400 |

Font loading: Google Fonts via Next.js `next/font/google`.

---

## Colors

### Primary Palette

| Name | Hex | Usage |
|---|---|---|
| Primary | `#6366F1` | Main brand color, CTAs, active states |
| Primary Light | `#818CF8` | Hover states, secondary buttons |
| Primary Dark | `#4F46E5` | Pressed states |

### Semantic Colors

| Name | Hex | Usage |
|---|---|---|
| Success / Strong | `#22C55E` | Strong mastery, correct answers |
| Warning / Medium | `#F59E0B` | Medium mastery, attention needed |
| Danger / Weak | `#EF4444` | Weak mastery, incorrect answers |
| Info | `#3B82F6` | Information, tips |

### Neutral Colors

| Name | Hex | Usage |
|---|---|---|
| Background | `#FAFAFA` | Page background |
| Surface | `#FFFFFF` | Card backgrounds |
| Border | `#E5E7EB` | Borders, dividers |
| Text Primary | `#111827` | Main text |
| Text Secondary | `#6B7280` | Supporting text |
| Text Muted | `#9CA3AF` | Placeholder text |

### Mastery Colors (Critical)

These colors appear throughout the dashboard and must be consistent:

| Level | Background | Text | Badge |
|---|---|---|---|
| Weak (0–40%) | `#FEF2F2` | `#DC2626` | Red badge |
| Medium (41–70%) | `#FFFBEB` | `#D97706` | Yellow badge |
| Strong (71–100%) | `#F0FDF4` | `#16A34A` | Green badge |

---

## Spacing

Use a 4px base grid:

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Inline spacing, icon gaps |
| `sm` | 8px | Tight spacing |
| `md` | 16px | Default component padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Card padding |
| `2xl` | 48px | Section gaps |
| `3xl` | 64px | Page sections |

---

## Components

### Buttons

| Variant | Usage | Style |
|---|---|---|
| Primary | Main CTAs | Solid primary color, white text |
| Secondary | Alternative actions | Border primary, primary text |
| Ghost | Tertiary actions | No border, primary text |
| Danger | Destructive actions | Solid red |
| Disabled | Unavailable actions | Gray background, reduced opacity |

States: Default → Hover (darken 10%) → Active (darken 20%) → Disabled (50% opacity)

Sizes: `sm` (32px height), `md` (40px height), `lg` (48px height)

### Cards

- White background, rounded-xl, shadow-sm
- Padding: 24px
- Border: 1px solid `#E5E7EB`
- Hover: shadow-md (on interactive cards)

### Forms

- Input height: 44px
- Label: semibold, above input
- Error: red text below input, red border
- Focus: primary color ring
- Placeholder: muted text color

### Navigation

- Top navbar on public pages
- Sidebar on dashboard (collapsible on mobile)
- Active route: primary color indicator

---

## Responsive Design

### Breakpoints

| Name | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single column, bottom nav or hamburger |
| Tablet | 768px – 1023px | Two columns, collapsible sidebar |
| Desktop | ≥ 1024px | Full sidebar, multi-column content |

### Mobile Adaptations

- Sidebar becomes a hamburger menu or bottom navigation
- Cards stack vertically
- Tables become scrollable or card-based
- Charts resize with container
- Assessment questions go full-width

---

## Accessibility

- All interactive elements have visible focus indicators
- Color is never the only indicator (icons/text supplement color coding)
- Form inputs have `<label>` associations
- Images and icons have alt text or `aria-label`
- Loading states use `aria-live="polite"` announcements
- Minimum touch target: 44×44px
- Contrast ratio: ≥ 4.5:1 for text, ≥ 3:1 for large text

---

## Loading States

- **Page load:** Full-page skeleton screen with pulsing placeholders
- **Component load:** Skeleton matching component shape
- **AI response:** Spinner with "AI is thinking..." text
- **Button action:** Button shows spinner, becomes disabled
- **Assessment submit:** Full-screen overlay with progress indicator

---

## Empty States

Every data-driven component has an empty state:

| Component | Empty State |
|---|---|
| Dashboard (no assessment) | "Take your first assessment to get started" + CTA |
| Learning Plan (none) | "Complete an assessment to generate your plan" |
| Progress (no data) | "Your progress will appear here after activities" |
| Tutor (no sessions) | "Start a tutoring session on any topic" |

---

## Error States

- **API error:** Toast notification with retry option
- **AI error:** Inline message: "AI is temporarily unavailable. Try again."
- **Form error:** Per-field error messages in red
- **404:** Custom "Page not found" with navigation back
- **Network error:** Banner: "You appear to be offline"

---

## Success States

- **Assessment submitted:** Confetti or check animation → redirect to results
- **Quiz completed:** Score animation → detailed results
- **Onboarding done:** Welcome message → redirect to subject selection
- **Tutor session ended:** Summary card of topics covered

---

## Page Specifications

### Landing Page

| Property | Detail |
|---|---|
| Route | `/` |
| Auth | Not required |
| Purpose | Introduce SkillSync AI and convert visitors to sign-ups |

**Main Components:**
- Hero section with headline, subheadline, CTA button
- Problem/solution section
- Feature highlights (3-4 cards)
- How it works (adaptive loop visualization)
- Call-to-action section
- Footer

**User Actions:**
- Click "Get Started" → `/register`
- Click "Login" → `/login`

**Mobile Behavior:**
- Full-width hero, stacked feature cards
- Simplified loop visualization

---

### Login Page

| Property | Detail |
|---|---|
| Route | `/login` |
| Auth | Not required (redirect if already authenticated) |
| Purpose | Authenticate existing users |

**Main Components:**
- Login form (email, password)
- "Remember me" checkbox
- "Forgot password" link (future)
- "Create account" link → `/register`

**User Actions:**
- Submit login form
- Navigate to register

**Loading State:** Button spinner during authentication
**Error State:** Inline error for invalid credentials
**Success State:** Redirect to `/dashboard`

---

### Register Page

| Property | Detail |
|---|---|
| Route | `/register` |
| Auth | Not required |
| Purpose | Create new accounts |

**Main Components:**
- Registration form (name, email, password, confirm password)
- Password strength indicator
- Terms acceptance checkbox
- "Already have an account?" link → `/login`

**User Actions:**
- Submit registration form

**Loading State:** Button spinner during registration
**Error State:** Per-field validation errors
**Success State:** Auto-login → redirect to `/onboarding`

---

### Onboarding Page

| Property | Detail |
|---|---|
| Route | `/onboarding` |
| Auth | Required |
| Purpose | Collect student profile information |

**Main Components:**
- Multi-step wizard (2-3 steps):
  1. Education level selection (dropdown or cards)
  2. Learning goals (text input or predefined options)
  3. Subject selection (card grid)
- Progress indicator (step dots)
- Back/Next buttons

**User Actions:**
- Select education level
- Enter learning goals
- Select subject
- Complete onboarding

**Loading State:** Skeleton during subject loading
**Empty State:** N/A (static form)
**Success State:** Animation → redirect to `/assessment`
**Mobile Behavior:** Full-width steps, large touch targets

---

### Assessment Page

| Property | Detail |
|---|---|
| Route | `/assessment` |
| Auth | Required |
| Purpose | Diagnostic assessment with topic-level evaluation |

**Main Components:**
- Question card (question text, 4 option buttons)
- Timer (countdown)
- Progress bar (question X of Y)
- Navigation (Previous/Next or skip)
- Submit button (on last question or as persistent action)
- Confirmation modal before submit

**Data Displayed:**
- Current question text and options
- Question number / total
- Time remaining
- Topic indicator (optional)

**API Dependencies:**
- `POST /api/assessment/start` — on page load
- `POST /api/assessment/:id/submit` — on submit

**User Actions:**
- Select an answer option
- Navigate between questions
- Submit assessment

**Loading State:** Skeleton while questions load
**Error State:** Retry button if question loading fails
**Empty State:** N/A (redirected if no active assessment)
**Mobile Behavior:** Full-width question card, large option buttons, sticky timer

---

### Dashboard Page

| Property | Detail |
|---|---|
| Route | `/dashboard` |
| Auth | Required |
| Purpose | Central hub — learning profile, plan, and recommendations |

**Main Components:**
- **Profile Overview Card:** Overall mastery percentage, strengths/weaknesses count
- **Topic Mastery Grid:** Color-coded cards showing mastery per topic
- **Learning Plan Card:** Current plan with progress and next action
- **Recommendation Card:** AI's next suggested activity with reasoning
- **Recent Activity List:** Last 5 activities with type, date, and score
- **Quick Actions:** Buttons for "Start Tutor Session", "Take Practice Quiz"

**Data Displayed:**
- Overall mastery score
- Per-topic mastery levels (color-coded)
- Active learning plan summary
- Next recommendation with reason
- Recent activity timeline

**API Dependencies:**
- `GET /api/progress/dashboard`
- `GET /api/analysis/profile`
- `GET /api/learning-plan/current`

**AI Dependencies:**
- Recommendations come from AI analysis

**Loading State:** Skeleton cards for each section
**Empty State (no assessment yet):** Prominent CTA: "Take your first assessment to get started"
**Error State:** Individual card error states with retry
**Mobile Behavior:** Stacked cards, full-width, scrollable

---

### AI Tutor Page

| Property | Detail |
|---|---|
| Route | `/tutor` |
| Auth | Required |
| Purpose | Interactive AI tutoring on weak topics |

**Main Components:**
- Topic selector sidebar/dropdown
- Chat interface (message bubbles)
- Message input with send button
- Session info card (topic, mastery level)
- End session button

**Data Displayed:**
- Selected topic name and current mastery
- Conversation messages (student + tutor)
- Typing indicator during AI response

**API Dependencies:**
- `POST /api/tutor/session` — start session
- `POST /api/tutor/session/:id/message` — send message
- `POST /api/tutor/session/:id/end` — end session

**AI Dependencies:**
- Every tutor response is AI-generated with student context

**User Actions:**
- Select a topic
- Type and send messages
- End session

**Loading State:** Typing indicator ("AI is thinking...") during response
**Empty State:** Topic selector with "Choose a topic to start learning"
**Error State:** Inline error below chat: "Couldn't get response. Try again."
**Mobile Behavior:** Full-screen chat, topic selector as dropdown at top

---

### Practice Page

| Property | Detail |
|---|---|
| Route | `/practice` |
| Auth | Required |
| Purpose | Adaptive quiz targeting weak topics |

**Main Components:**
- Quiz configuration (auto-select weak topics or manual selection)
- Question card (similar to assessment)
- Progress bar
- Results summary after completion
- Per-question review with explanations
- Profile update notification

**Data Displayed:**
- Quiz questions
- Selected answers
- Score after completion
- Correct/incorrect per question
- Explanations
- Mastery change notification

**API Dependencies:**
- `POST /api/quiz/generate` — generate quiz
- `POST /api/quiz/:id/submit` — submit answers

**AI Dependencies:**
- Questions may be AI-generated
- Difficulty is AI-adapted

**User Actions:**
- Configure quiz (or accept defaults)
- Answer questions
- Submit quiz
- Review results

**Loading State:** "Generating questions..." with spinner
**Empty State:** "Complete an assessment first to enable adaptive practice"
**Error State:** Retry button if quiz generation fails
**Mobile Behavior:** Full-width questions, large touch targets

---

### Progress Page

| Property | Detail |
|---|---|
| Route | `/progress` |
| Auth | Required |
| Purpose | Visual analytics of learning improvement |

**Main Components:**
- Overall mastery trend chart (line chart over time)
- Topic mastery radar/bar chart
- Activity timeline
- Topic-level detail cards with score history
- Summary statistics (assessments taken, study time, etc.)

**Data Displayed:**
- Mastery over time (line chart)
- Per-topic scores (bar chart or radar)
- Activity log
- Statistics

**API Dependencies:**
- `GET /api/progress`

**User Actions:**
- View charts
- Filter by time period
- Click on topic for detail

**Loading State:** Skeleton charts
**Empty State:** "No progress data yet. Complete activities to see your improvement."
**Error State:** Retry button on chart load failure
**Mobile Behavior:** Full-width charts (scrollable), stacked sections
