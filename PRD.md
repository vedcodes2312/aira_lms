# AIRA — Prototype PRD
### Minimal Build: Core Personalization Loop Only

**Tagline:** Learn the Future Your Way.
**Scope of this document:** A stripped-down version of AIRA meant to prove the core idea — *the same topic explained differently to different learners* — as fast as possible. No verification flows, no payments, no compliance overhead. Just enough product to demo and test the personalization engine.

---

## 1. Prototype Goal

Prove that AIRA can:
1. Take a learner's basic profile (profession, level, goal, style).
2. Generate a personalized, structured, multi-lesson course on an AI or Quantum Computing topic.
3. Let the learner read it and take a simple quiz.

Everything else is out of scope until this loop is validated.

---

## 2. Explicitly Out of Scope for the Prototype

- ❌ OTP / phone verification
- ❌ Email verification / "confirm your account" flows
- ❌ Forgot-password / password-reset flows
- ❌ Payments, pricing tiers, Razorpay/UPI
- ❌ WhatsApp/SMS notifications
- ❌ Offline mode / Lite Mode / PWA installability
- ❌ Multiple regional languages (English only, or English + one language if trivial)
- ❌ DPDP/compliance workflows, consent management screens
- ❌ Learning streaks, recommendations engine, analytics dashboards
- ❌ Caching layer, background job queues

These all return in the full production PRD, not here.

---

## 3. Authentication (Simplified)

- **Username + Password only.**
- Signup: username, password (and password confirmation), that's it — no email, no phone, no OTP, no CAPTCHA.
- Login: username + password.
- No email/phone verification step — account is active immediately after signup.
- No "forgot password" flow in the prototype (acceptable to just re-signup or manually reset in DB during testing).
- Passwords are still hashed before storage (never store plaintext), but there is no external identity provider.

---

## 4. Learner Profile (Simplified Onboarding)

Single-page form immediately after signup (no multi-step wizard needed):

1. **Profession/Role** — dropdown: Student / Teacher / Business Professional / Developer / Researcher / Other (free text)
2. **Knowledge Level** — Beginner / Intermediate / Advanced
3. **Learning Domain** — Artificial Intelligence / Quantum Computing
4. **Learning Goal** — Understand basics / Use in my profession / Build applications / Learn programming / Conduct research
5. **Preferred Explanation Style** — Simple / Practical / Technical / Balanced

(Language selector, board/exam context, and connectivity preference are deferred to the full product.)

---

## 5. Core Feature Set (What's Actually Built)

| Feature | Prototype Behavior |
|---|---|
| Signup/Login | Username + password, no verification |
| Onboarding | One simple form, stored on the user record |
| Domain Selection | Two options: AI or Quantum Computing |
| Topic Selection | Flat list of topics per domain (from the base topic list) |
| Generate Course | Button triggers a single synchronous call to the LLM |
| Course Display | Title, description, objectives, modules, lessons — rendered as-is |
| Lesson Structure | Introduction, Main Explanation, How It Works, Real-World Example, Applications, Important Concepts, Limitations, Summary, Key Takeaways |
| Quiz | Simple MCQ quiz generated along with the lesson, shown at the end |
| Progress | Minimal: mark a lesson "read" when opened; no streaks or scoring history |

---

## 6. User Flow

```
Sign Up (username/password)
   → Onboarding form (profession, level, domain, goal, style)
   → Dashboard (just: "Pick a topic to generate your course")
   → Select Domain → Select Topic → Generate My Course
   → Course Overview → Lesson Reader → Quiz → Back to Dashboard
```

No email confirmation step, no OTP screen, no payment wall anywhere in this flow.

---

## 7. Success Criteria for the Prototype

- A user can sign up and log in with just a username and password in under 10 seconds.
- A user can generate a course for a chosen topic in under ~15–20 seconds.
- The same topic, generated for two different professions/levels, visibly produces different explanations and examples.
- Lessons are multi-paragraph and structured — not one-line answers.
- A basic quiz appears at the end of each lesson with a correct answer and explanation.

---

## 8. What Comes Next (Not in This Doc)

Once the core loop is validated: add OTP-based login, regional language generation, payments, compliance, notifications, and the fuller dashboard/progress system — as covered in the full production PRD.