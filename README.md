# AIRA — Personalized AI & Quantum Computing Learning Platform
## Prototype v0.1

> **"Learn the Future Your Way"** — AIRA generates a personalised, multi-lesson course on any AI or Quantum Computing topic, tailored to your profession, knowledge level, and learning style, powered by Google Gemini.

---

## Quick Start

### 1. Backend (FastAPI)

```bash
cd backend

# Copy and fill in your Gemini API key
copy .env.example .env
# Edit .env → set GEMINI_API_KEY=your_key_here

# Create venv and install deps
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** — interactive docs at http://localhost:8000/docs

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## Get a Free Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key (free tier, no credit card)
3. Paste it into `backend/.env` as `GEMINI_API_KEY=...`

---

## User Flow

```
Sign Up (username + password)
  → Onboarding (profession, level, domain, goal, style)
  → Dashboard
  → Pick Domain (AI or Quantum Computing)
  → Pick Topic
  → Generate My Course  ← calls Gemini 2.0 Flash (~15–25s)
  → Course Overview
  → Lesson Reader (9 structured sections)
  → Quiz (lmscn Quiz component, MCQ with scoring)
  → Back to Dashboard
```

---

## Project Structure

```
aira/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── database.py          # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # bcrypt + JWT
│   ├── llm.py               # Gemini 2.0 Flash integration
│   ├── routers/
│   │   ├── auth.py          # POST /auth/signup, /auth/login
│   │   ├── onboarding.py    # POST /onboarding, GET /onboarding/me
│   │   ├── topics.py        # GET /topics?domain=AI|QC
│   │   └── courses.py       # GET /courses, POST /courses/generate, GET /courses/{id}
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                         # Root redirect
│   │   ├── signup/page.tsx                  # Signup
│   │   ├── login/page.tsx                   # Login
│   │   ├── onboarding/page.tsx              # Profile setup
│   │   ├── dashboard/page.tsx               # Course list
│   │   ├── generate/page.tsx                # Topic picker
│   │   └── course/[id]/
│   │       ├── page.tsx                     # Course overview
│   │       ├── lesson/[lessonId]/page.tsx   # Lesson reader
│   │       └── quiz/[lessonId]/page.tsx     # Quiz (lmscn)
│   ├── components/
│   │   ├── lms/quiz.tsx    # lmscn Quiz component
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   └── lib/
│       ├── api.ts          # Typed API client
│       └── utils.ts
│
├── chatlogs.txt             # Build log
└── README.md
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| LLM | Gemini 2.0 Flash | Free tier, fast, good JSON output |
| Auth | bcrypt + JWT | Simple, no external deps, Python 3.13 compatible |
| DB | SQLite + SQLAlchemy | Zero setup, file-based |
| Quiz UI | lmscn Quiz component | Polished shadcn-based MCQ with scoring |
| Frontend | Next.js 16 + Tailwind v4 | App Router, fast HMR |

---

## What's Not Built (Prototype Scope)

- ❌ Email / phone / OTP verification
- ❌ Forgot password
- ❌ Payments
- ❌ Progress tracking / streaks
- ❌ Background job queues / streaming
- ❌ Multi-language support
