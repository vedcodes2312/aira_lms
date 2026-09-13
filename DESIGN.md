# AIRA — Prototype Design Document
### Minimal Architecture & UX for the Core Loop Only

---

## 1. Design Principle for This Phase

Build the smallest possible system that proves personalization works. Every screen, table, and service in this document exists only to support: **sign up → set profile → generate course → read lesson → take quiz.**

---

## 2. Simplified Architecture

```
        ┌─────────────────────┐
        │  Learner (Browser)   │
        └──────────┬───────────┘
                    │ HTTPS/JSON
        ┌──────────▼───────────┐
        │   Frontend (Next.js)  │
        └──────────┬───────────┘
                    │
        ┌──────────▼───────────┐
        │   Backend API          │
        │   (FastAPI)             │
        │  - username/password    │
        │    auth (JWT/session)   │
        │  - course generation    │
        │    endpoint (sync call) │
        └──────────┬───────────┘
                    │
        ┌──────────▼───────────┐
        │   LLM Provider API     │
        │   (structured output)  │
        └──────────┬───────────┘
                    │
        ┌──────────▼───────────┐
        │   Database (Postgres   │
        │   or SQLite for local  │
        │   dev)                 │
        └─────────────────────────┘
```

No Redis, no job queue, no notification service, no CDN, no payment service. The LLM call happens synchronously inside the request — acceptable for prototype-scale traffic and simplicity.

---

## 3. Screens (Minimal Set)

| Screen | Purpose | Notes |
|---|---|---|
| **Signup** | username + password + confirm password | No email/phone field |
| **Login** | username + password | No "forgot password" link needed yet |
| **Onboarding** | One form: profession, level, domain, goal, style | Single page, single submit |
| **Dashboard** | "Pick a topic" entry point + list of previously generated courses (if any) | No streaks, no recommendations |
| **Domain Selection** | Two cards: AI / Quantum Computing | |
| **Topic Selection** | Flat scrollable list | Optional simple search |
| **Course Generation (loading)** | Basic spinner + "Generating your course..." | No fancy skeleton needed |
| **Course Overview** | Title, description, objectives, module/lesson list | |
| **Lesson Reader** | All lesson sections rendered top to bottom | No "Explain Again" needed yet (can stub a disabled button) |
| **Quiz** | Question, options, submit, shows correct answer + explanation | One question at a time or all at once — either is fine for prototype |

---

## 4. Auth Design (Username/Password, No Verification)

**Signup:**
```
POST /api/auth/signup
{ "username": "...", "password": "..." }
→ Hash password (bcrypt/argon2)
→ Create user row
→ Return JWT (or set session cookie)
→ No email sent, no verification token, account is immediately usable
```

**Login:**
```
POST /api/auth/login
{ "username": "...", "password": "..." }
→ Verify password hash
→ Return JWT (or set session cookie)
```

No password-reset endpoint is required for the prototype phase; if needed during testing, resolve directly at the database level.

---

## 5. Data Model (Minimal)

```
Users
─────
id
username (unique)
password_hash
profession
knowledge_level
learning_goal
explanation_style
created_at

Courses
───────
id
user_id (FK → Users)
domain
topic
title
description
difficulty
created_at

Modules
───────
id
course_id (FK → Courses)
title
order

Lessons
───────
id
module_id (FK → Modules)
title
content (JSON: intro, main_explanation, how_it_works,
         real_world_example, applications, important_concepts,
         limitations, summary, key_takeaways)
order

Quizzes
───────
id
lesson_id (FK → Lessons)
question
options (JSON array)
correct_answer
explanation
```

No `Progress` table strictly required for v0 — a lesson can simply track `opened_at` inline, or this table can be added trivially once the core loop works.

---

## 6. Course Generation Flow (Simplified)

1. Frontend calls `POST /api/courses/generate` with `{ domain, topic }` and the auth token.
2. Backend loads the user's profile fields directly from the `Users` table.
3. Backend builds a prompt string combining profile + topic (same structure as production, just without language/caching logic).
4. Backend calls the LLM synchronously, requesting structured JSON output.
5. Backend validates the JSON shape (basic check — required keys present).
6. Backend saves Course → Modules → Lessons → Quizzes in one transaction.
7. Backend returns the full course object to the frontend for immediate rendering.

If the LLM response fails validation, retry once with a stricter formatting instruction; otherwise return a simple error message to the frontend ("Couldn't generate this course, please try again").

---

## 7. What's Intentionally Left Rough

- No loading skeletons beyond a basic spinner.
- No responsive polish beyond "works on a normal phone/laptop screen."
- No empty-state illustrations — plain text is fine ("No courses yet — generate your first one").
- No accessibility pass yet (revisit once the loop is validated).
- No rate limiting on course generation (fine at prototype traffic levels).