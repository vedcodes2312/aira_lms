# 📐 AIRA — Technical Design Document (TDD)
### Version: 2.0 | Status: Production Prototype | Architecture: Multi-Tier Micro-Modular

---

## 📑 Table of Contents
1. [Executive Overview & Vision](#1-executive-overview--vision)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Database Architecture & Entity Relationship Diagram (ERD)](#3-database-architecture--entity-relationship-diagram-erd)
4. [Object-Oriented UML Class Diagram](#4-object-oriented-uml-class-diagram)
5. [Component & Sequence Workflows (UML Sequence Diagrams)](#5-component--sequence-workflows)
   - [5.1 Course Generation Pipeline](#51-course-generation-pipeline-uml-sequence)
   - [5.2 Active Quiz, Badge Unlock & Certificate Pipeline](#52-active-quiz-badge-unlock--certificate-pipeline-uml-sequence)
   - [5.3 Multi-Lingual & Hinglish Translation Caching](#53-multi-lingual--hinglish-translation-caching-uml-sequence)
6. [UML State Machine: Learner Progression Lifecycle](#6-uml-state-machine-learner-progression-lifecycle)
7. [UML Component & Deployment Architecture](#7-uml-component--deployment-architecture)
8. [API Interface Specifications](#8-api-interface-specifications)
9. [Security, Auth & Role-Based Access Control (RBAC)](#9-security-auth--role-based-access-control-rbac)
10. [Deployment, Resilience & Caching Strategy](#10-deployment-resilience--caching-strategy)

---

## 1. Executive Overview & Vision

**AIRA (AI-powered Real-time Adaptive LMS)** is a personalized deep-tech educational platform engineered to eliminate the "one-size-fits-all" barrier in Artificial Intelligence and Quantum Computing education.

### Core Architectural Goals:
* **Persona Calibration:** Dynamically synthesize curriculums tailored to 5+ professional backgrounds (Educator, Developer, Finance Executive, Medical Practitioner, Beginner).
* **Deterministic Structured Pedagogy:** Enforce a 9-stage cognitive framework per lesson via strict Pydantic JSON schemas.
* **Active Recall & Mastery Gamification:** Integrate `lmscn` interactive quizzes, 3D spaced repetition flashcards, and score-gated badges ($\ge 80\%$).
* **Verifiable Credentials:** Issue cryptographically verifiable Certificates of Completion with one-click LinkedIn Profile integration.
* **Pan-Indian Accessibility:** On-demand multi-lingual translation supporting English, Hinglish, Hindi, Tamil, Telugu, and Marathi with zero-cost database caching.

---

## 2. High-Level System Architecture

```mermaid
graph TD
    subgraph Client_Tier["🖥️ CLIENT TIER (Next.js 16 App Router + Tailwind CSS)"]
        UI_Landing["Landing Page (app/page.tsx)"]
        UI_Auth["Auth (/login, /signup)"]
        UI_Onboarding["Onboarding Wizard (/onboarding)"]
        UI_Dashboard["Dashboard & Badge Showcase (/dashboard)"]
        UI_Course["Course Explorer & Lesson Reader (/course/[id])"]
        UI_Flashcards["3D Spaced Flashcards (/flashcards)"]
        UI_Quiz["lmscn Active Quiz Engine (/quiz)"]
        UI_Certificate["Verified Certificate & LinkedIn Sync (/certificate/[uuid])"]
        UI_Admin["Admin Panel & Live DB Inspector (/admin)"]
    end

    subgraph Gateway_Tier["⚡ GATEWAY & APPLICATION TIER (FastAPI + Pydantic)"]
        Auth_Middleware["JWT Auth Guard & Password Hashing (bcrypt)"]
        Router_Auth["/auth Router"]
        Router_Onboarding["/onboarding Router"]
        Router_Courses["/courses Router (Synthesis & Reader)"]
        Router_Admin["/admin Router (KPIs, Deletion, DB Explorer)"]
        Router_Public["/courses/public (Open Verifications)"]
    end

    subgraph AI_Engine_Tier["🧠 AI PEDAGOGY & ORCHESTRATION TIER"]
        Prompt_Builder["9-Stage Pedagogical Prompt Synthesizer"]
        LLM_Client["Gemini 2.0 / 1.5 Flash Inference Engine"]
        Schema_Sanitizer["Strict JSON Validator & Normalizer"]
        Translation_Engine["Multi-Lingual / Hinglish Translation Engine"]
    end

    subgraph Storage_Tier["💾 PERSISTENCE TIER (SQLite / PostgreSQL + SQLAlchemy ORM)"]
        DB_Users["Users Table"]
        DB_Courses["Courses Table"]
        DB_Modules["Modules Table"]
        DB_Lessons["Lessons Table"]
        DB_Quizzes["Quizzes Table"]
        DB_Progress["LessonProgress Table"]
        DB_Attempts["QuizAttempts Table"]
        DB_Badges["Badges Table"]
        DB_Certs["Certificates Table"]
        DB_Trans["LessonTranslations Table"]
    end

    %% Client to Backend
    Client_Tier --> Gateway_Tier

    %% Middleware Interceptors
    Gateway_Tier --> Auth_Middleware

    %% Gateway to AI
    Router_Courses --> Prompt_Builder
    Prompt_Builder --> LLM_Client
    LLM_Client --> Schema_Sanitizer
    Schema_Sanitizer --> Router_Courses
    Router_Courses --> Translation_Engine

    %% Gateway to Database
    Gateway_Tier --> Storage_Tier
```

---

## 3. Database Architecture & Entity Relationship Diagram (ERD)

The AIRA persistence layer is designed with strict relational constraints, foreign keys with cascade deletions, and indexing for fast query resolution across learner progress, translation caching, and certification.

```mermaid
erDiagram
    USERS ||--o{ COURSES : "creates / owns (1:N)"
    USERS ||--o{ LESSON_PROGRESS : "tracks progress (1:N)"
    USERS ||--o{ QUIZ_ATTEMPTS : "submits attempts (1:N)"
    USERS ||--o{ BADGES : "earns (1:N)"
    USERS ||--o{ CERTIFICATES : "receives (1:N)"

    COURSES ||--|{ MODULES : "composed of (1:N)"
    COURSES ||--o{ LESSON_PROGRESS : "has records (1:N)"
    COURSES ||--o{ QUIZ_ATTEMPTS : "records test history (1:N)"
    COURSES ||--o{ BADGES : "awards badge on completion (1:1)"
    COURSES ||--o{ CERTIFICATES : "generates credential (1:1)"

    MODULES ||--|{ LESSONS : "groups (1:N)"
    LESSONS ||--|{ QUIZZES : "contains evaluation questions (1:N)"
    LESSONS ||--o{ LESSON_PROGRESS : "logged per learner (1:N)"
    LESSONS ||--o{ QUIZ_ATTEMPTS : "tested in (1:N)"
    LESSONS ||--o{ LESSON_TRANSLATIONS : "cached in multiple languages (1:N)"

    USERS {
        int id PK "Auto Increment"
        string username UK "Unique Learner Handle"
        string password_hash "Bcrypt Salted Hash"
        string full_name "Full Display Name"
        string bio "Learner Headline & Bio"
        string avatar_url "Avatar Identifier"
        string profession "e.g. Developer, Teacher, Doctor"
        string knowledge_level "Beginner | Intermediate | Advanced"
        string learning_domain "AI | Quantum Computing"
        string learning_goal "Upskilling | Research | Career Pivot"
        string explanation_style "Code-Heavy | Intuitive | Mathematical"
        int onboarding_done "0 or 1"
        int is_admin "0: User, 1: Super Admin"
        string preferred_language "en | hi-en | hi | ta | te | mr"
        int is_public "1: Public Showcase, 0: Private"
        int show_real_name "1: Show Name, 0: Username only"
        int show_courses "1: Show Courses, 0: Hide"
        int show_badges "1: Show Badges, 0: Hide"
        int show_certificates "1: Show Certs, 0: Hide"
        int show_interests "1: Show Goals, 0: Hide"
        datetime created_at "ISO-8601 Timestamp"
    }

    COURSES {
        int id PK "Auto Increment"
        int user_id FK "References USERS(id) ON DELETE CASCADE"
        string domain "AI | Quantum Computing"
        string topic "e.g. Neural Networks, Shor's Algorithm"
        string title "Persona-Calibrated Course Title"
        text description "Pedagogical Syllabus Overview"
        string difficulty "Beginner | Intermediate | Advanced"
        string language "Base Course Language"
        datetime created_at "ISO-8601 Timestamp"
    }

    MODULES {
        int id PK "Auto Increment"
        int course_id FK "References COURSES(id) ON DELETE CASCADE"
        string title "Module Title"
        int order "Sequential Ordering Index"
    }

    LESSONS {
        int id PK "Auto Increment"
        int module_id FK "References MODULES(id) ON DELETE CASCADE"
        string title "Lesson Title"
        text content_json "9-Stage Pedagogical JSON String"
        int order "Sequential Ordering Index"
    }

    QUIZZES {
        int id PK "Auto Increment"
        int lesson_id FK "References LESSONS(id) ON DELETE CASCADE"
        text question "Conceptual / Practical MCQ Question"
        text options_json "JSON Array of 4 Options"
        int correct_answer "0-based Index of Correct Option"
        text explanation "Detailed Pedagogical Rationale"
    }

    LESSON_PROGRESS {
        int id PK "Auto Increment"
        int user_id FK "References USERS(id) ON DELETE CASCADE"
        int course_id FK "References COURSES(id) ON DELETE CASCADE"
        int lesson_id FK "References LESSONS(id) ON DELETE CASCADE"
        int completed "0: Unfinished, 1: Completed"
        datetime completed_at "Timestamp of Completion"
    }

    QUIZ_ATTEMPTS {
        int id PK "Auto Increment"
        int user_id FK "References USERS(id) ON DELETE CASCADE"
        int course_id FK "References COURSES(id) ON DELETE CASCADE"
        int lesson_id FK "References LESSONS(id) ON DELETE CASCADE"
        int score "Raw Score Achieved"
        int max_score "Total Possible Points"
        int percentage "Calculated Accuracy Percentage"
        int passed "1 if percentage >= 80%, else 0"
        datetime attempted_at "Attempt Timestamp"
    }

    BADGES {
        int id PK "Auto Increment"
        int user_id FK "References USERS(id) ON DELETE CASCADE"
        int course_id FK "References COURSES(id) ON DELETE CASCADE"
        string name "e.g. Neural Architect, Quantum Pioneer"
        string domain "AI | Quantum Computing"
        text description "Achievement Narrative"
        string icon "Badge Icon Identifier"
        datetime earned_at "Unlock Timestamp"
    }

    CERTIFICATES {
        int id PK "Auto Increment"
        int user_id FK "References USERS(id) ON DELETE CASCADE"
        int course_id FK "References COURSES(id) ON DELETE CASCADE"
        string cert_uuid UK "e.g. AIRA-2026-8243E325"
        string recipient_name "Learner Full Name / Handle"
        string course_title "Course Title Completed"
        string domain "Specialization Domain"
        string badge_name "Honorary Badge Earned"
        int score_percentage "Aggregate Mastery Score"
        datetime issued_at "Issuance Timestamp"
    }

    LESSON_TRANSLATIONS {
        int id PK "Auto Increment"
        int lesson_id FK "References LESSONS(id) ON DELETE CASCADE"
        string language "Language Code (e.g. hi-en, hi, ta, te, mr)"
        text content_json "Translated 9-Stage JSON Schema"
        datetime created_at "Cached Timestamp"
    }
```

---

## 4. Object-Oriented UML Class Diagram

The following UML Class Diagram models the core SQLAlchemy ORM models, Pydantic data transfer objects (DTOs), and service layer controllers.

```mermaid
classDiagram
    direction TB

    %% ORM Entities
    class User {
        +int id
        +string username
        +string password_hash
        +string profession
        +string knowledge_level
        +string learning_domain
        +string learning_goal
        +string explanation_style
        +int onboarding_done
        +int is_admin
        +string preferred_language
        +datetime created_at
        +verify_password(plain_pwd) bool
    }

    class Course {
        +int id
        +int user_id
        +string domain
        +string topic
        +string title
        +string description
        +string difficulty
        +string language
        +datetime created_at
        +get_total_lessons() int
        +get_completion_rate(user_id) float
    }

    class Module {
        +int id
        +int course_id
        +string title
        +int order
    }

    class Lesson {
        +int id
        +int module_id
        +string title
        +string content_json
        +int order
        +get_parsed_content() LessonContent
    }

    class Quiz {
        +int id
        +int lesson_id
        +string question
        +string options_json
        +int correct_answer
        +string explanation
        +validate_answer(selected_idx) bool
    }

    class LessonProgress {
        +int id
        +int user_id
        +int course_id
        +int lesson_id
        +int completed
        +datetime completed_at
    }

    class QuizAttempt {
        +int id
        +int user_id
        +int course_id
        +int lesson_id
        +int score
        +int max_score
        +int percentage
        +int passed
        +datetime attempted_at
    }

    class Badge {
        +int id
        +int user_id
        +int course_id
        +string name
        +string domain
        +string description
        +string icon
        +datetime earned_at
    }

    class Certificate {
        +int id
        +int user_id
        +int course_id
        +string cert_uuid
        +string recipient_name
        +string course_title
        +string domain
        +string badge_name
        +int score_percentage
        +datetime issued_at
        +generate_linkedin_url() string
    }

    class LessonTranslation {
        +int id
        +int lesson_id
        +string language
        +string content_json
        +datetime created_at
    }

    %% Service Layer Interfaces
    class LLMPedagogyService {
        +generate_course_curriculum(domain, topic, persona) CoursePayload
        +translate_lesson_content(content_json, target_lang) dict
        +extract_flashcards(content_json) list~Flashcard~
        -_build_pedagogy_prompt(persona) string
        -_sanitize_json_response(raw_text) dict
    }

    class CourseService {
        +create_course(user_id, domain, topic) Course
        +get_course_details(course_id, user_id) CourseDetailResponse
        +toggle_lesson_progress(course_id, lesson_id, user_id) dict
        +submit_quiz(course_id, lesson_id, user_id, score, max_score) QuizResult
        +get_or_create_certificate(course_id, user_id) CertificateResponse
        +get_flashcards(course_id, user_id) list~Flashcard~
    }

    class AuthService {
        +register_user(username, password) User
        +authenticate_user(username, password) string
        +get_current_user(token) User
        +require_admin(user) void
    }

    %% Relationships
    User "1" *-- "0..*" Course : owns
    User "1" *-- "0..*" LessonProgress : logs
    User "1" *-- "0..*" QuizAttempt : submits
    User "1" *-- "0..*" Badge : collects
    User "1" *-- "0..*" Certificate : earns

    Course "1" *-- "1..*" Module : contains
    Course "1" *-- "0..1" Badge : triggers
    Course "1" *-- "0..1" Certificate : yields
    Module "1" *-- "1..*" Lesson : contains
    Lesson "1" *-- "1..*" Quiz : evaluates with
    Lesson "1" *-- "0..*" LessonTranslation : cached in

    CourseService ..> LLMPedagogyService : uses
    CourseService ..> Course : manages
    AuthService ..> User : authenticates
```

---

## 5. Component & Sequence Workflows

### 5.1 Course Generation Pipeline (UML Sequence)
1. Client issues `POST /courses/generate` with `{ domain, topic }`.
2. Backend validates user onboarding state and retrieves persona traits.
3. Prompt Engine constructs the 9-stage pedagogical prompt with persona constraints.
4. Gemini returns structured JSON (`response_mime_type="application/json"`).
5. Sanitizer strips extraneous fences and validates JSON keys against Pydantic models.
6. Atomic transaction commits `Course` $\rightarrow$ `Modules` $\rightarrow$ `Lessons` $\rightarrow$ `Quizzes`.

```mermaid
sequenceDiagram
    autonumber
    actor Learner as 👤 Learner
    participant Frontend as 🖥️ Next.js UI
    participant Backend as ⚡ FastAPI Gateway
    participant LLM as 🧠 Gemini 2.0 Flash
    participant DB as 💾 SQLite DB

    Learner->>Frontend: Selects Domain & Topic -> Clicks "Generate Course"
    Frontend->>Backend: POST /courses/generate {domain, topic} (JWT)
    Backend->>DB: Query User Persona (profession, level, goal, style)
    DB-->>Backend: Persona Record
    Backend->>LLM: Invoke 9-Stage Structured Pedagogy Prompt
    LLM-->>Backend: Strict JSON (Modules, Lessons, Code, Real-World, Quizzes)
    Backend->>Backend: Validate Schema with Pydantic Normalizer
    Backend->>DB: Atomic Begin Transaction
    Backend->>DB: INSERT INTO courses (...)
    Backend->>DB: INSERT INTO modules (...)
    Backend->>DB: INSERT INTO lessons (...)
    Backend->>DB: INSERT INTO quizzes (...)
    Backend->>DB: Commit Transaction
    DB-->>Backend: OK
    Backend-->>Frontend: HTTP 200 { course_id, title, modules: [...] }
    Frontend-->>Learner: Display Interactive Course Tree & First Lesson
```

---

### 5.2 Active Quiz, Badge Unlock & Certificate Pipeline (UML Sequence)

```mermaid
sequenceDiagram
    autonumber
    actor Learner as 👤 Learner
    participant UI as 🖥️ Next.js Quiz Engine
    participant API as ⚡ FastAPI Courses Router
    participant DB as 💾 SQLite Persistence
    participant LinkedIn as 🌐 LinkedIn OAuth / Profile

    Learner->>UI: Submits Quiz Answers (e.g. 5/5 Correct)
    UI->>API: POST /courses/{id}/lessons/{lid}/quiz-attempt {score: 5, max_score: 5}
    API->>DB: INSERT INTO quiz_attempts (score, percentage=100, passed=1)
    API->>DB: UPDATE lesson_progress SET completed=1 WHERE lesson_id=lid
    API->>DB: Check Course Completion: Count(completed_lessons) == Total(lessons)
    
    alt Course Reached 100% Completion
        API->>DB: Check if Badge exists for (user_id, course_id)
        opt Badge Not Yet Awarded
            API->>DB: INSERT INTO badges ("Neural Architect", domain, icon)
        end
        opt Certificate Not Yet Issued
            API->>DB: INSERT INTO certificates (cert_uuid="AIRA-2026-...", score=100)
        end
        API-->>UI: HTTP 200 { passed: true, badge_awarded: true, cert_unlocked: true }
        UI-->>Learner: 🎉 Trigger Confetti + Gold Badge Modal + Certificate Banner
    else In-Progress (< 100%)
        API-->>UI: HTTP 200 { passed: true, badge_awarded: false, progress_pct: 75 }
        UI-->>Learner: ✅ Green Checkmark + Next Lesson Button
    end

    opt Learner Clicks "Add to LinkedIn"
        Learner->>UI: Click "Add to LinkedIn Profile"
        UI->>LinkedIn: Redirect to LinkedIn Certification Add URL with Cert UUID & Org Name
        LinkedIn-->>Learner: Pre-filled License & Certification Form
    end
```

---

### 5.3 Multi-Lingual & Hinglish Translation Caching (UML Sequence)

```mermaid
sequenceDiagram
    autonumber
    actor Learner as 👤 Learner
    participant UI as 🖥️ Lesson Reader UI
    participant API as ⚡ FastAPI Translation Router
    participant DB as 💾 SQLite DB (lesson_translations)
    participant LLM as 🧠 Gemini Translation Engine

    Learner->>UI: Clicks Language Pill ("Hinglish 🇮🇳" / "Hindi" / "Tamil")
    UI->>API: POST /courses/{id}/lessons/{lid}/translate {target_language: "hi-en"}
    API->>DB: SELECT * FROM lesson_translations WHERE lesson_id=lid AND language='hi-en'
    
    alt Cache Hit (Already Translated)
        DB-->>API: Return Cached JSON Record (< 5ms)
        API-->>UI: HTTP 200 { cached: true, content_json: [...] }
        UI-->>Learner: Instant Render in Hinglish (0s API Latency)
    else Cache Miss (First Translation Request)
        DB-->>API: NULL
        API->>LLM: Translate 9-stage JSON into Hinglish (Preserve Technical Terms)
        LLM-->>API: Translated Structured JSON
        API->>DB: INSERT INTO lesson_translations (lesson_id, language, content_json)
        DB-->>API: Committed
        API-->>UI: HTTP 200 { cached: false, content_json: [...] }
        UI-->>Learner: Render Translated Lesson
    end
```

---

## 6. UML State Machine: Learner Progression Lifecycle

This State Machine models the state changes of a learner's progression through a course, from generation to LinkedIn certification.

```mermaid
stateDiagram-v2
    [*] --> Unregistered
    Unregistered --> Authenticated : POST /auth/signup & /auth/login
    Authenticated --> Calibrated : POST /onboarding (Submit Persona)
    Calibrated --> CourseGenerated : POST /courses/generate
    
    state CourseLifecycle {
        [*] --> Module1_Lesson1_Unstarted
        Module1_Lesson1_Unstarted --> ReadingLesson : Open Lesson
        ReadingLesson --> FlashcardsReviewed : Flip 3D Spaced Flashcards
        FlashcardsReviewed --> QuizInProgress : Start Active Quiz
        
        QuizInProgress --> QuizFailed : Score < 80%
        QuizFailed --> QuizInProgress : Retry Quiz
        
        QuizInProgress --> LessonCompleted : Score >= 80% (Passed)
        LessonCompleted --> NextLesson : Select Next Lesson
        NextLesson --> ReadingLesson
        
        LessonCompleted --> AllLessonsCompleted : Total Completed == Total Lessons
    }

    CourseGenerated --> CourseLifecycle : Begin Learning
    
    state CompletionLifecycle {
        AllLessonsCompleted --> BadgeAwarded : Auto-Generate Domain Badge
        BadgeAwarded --> CertificateIssued : Generate Cryptographic Cert UUID
        CertificateIssued --> LinkedInSynced : Click "Add to LinkedIn"
        CertificateIssued --> VerifiedPublicly : GET /courses/public/verify-certificate/{uuid}
    }

    CourseLifecycle --> CompletionLifecycle
    CompletionLifecycle --> [*]
```

---

## 7. UML Component & Deployment Architecture

```mermaid
graph TB
    subgraph Client_Environment["🖥️ CLIENT RUNTIME (Browser / Mobile)"]
        ReactApp["Next.js 16 App Router (React 19)"]
        ZustandAuth["Auth Store (JWT in LocalStorage / Cookie)"]
        UI_Components["Tailwind UI + Framer Motion (Glassmorphism)"]
        PrintService["Window Print Engine (PDF Export)"]
    end

    subgraph Reverse_Proxy["🌐 INGRESS / GATEWAY"]
        CORS["CORS Middleware (Allowed Origins: localhost:3000, aira.ai)"]
        RateLimiter["FastAPI Request Throttler"]
    end

    subgraph Backend_Environment["⚡ APPLICATION RUNTIME (FastAPI + Uvicorn)"]
        JWTGuard["OAuth2 Bearer JWT Authenticator"]
        RouterHub["API Routers Hub (/auth, /onboarding, /courses, /admin)"]
        PedagogyPipeline["9-Stage Curriculum Generator"]
        TranslationMgr["Multi-Lingual Cache Manager"]
        CertService["Cryptographic Cert & LinkedIn URL Builder"]
        AdminInspector["Live SQLite Schema & Row Inspector"]
    end

    subgraph AI_Cloud["☁️ EXTERNAL AI PROVIDER"]
        GeminiFlash["Google Gemini 2.0 / 1.5 Flash"]
        ModelRouter["Multi-Model Router (Fallback to HF/Groq)"]
    end

    subgraph Persistence_Layer["💾 PERSISTENCE (SQLite Engine / PostgreSQL)"]
        aira_db[("aira.db (SQLite3 WAL Mode)")]
        Table_Users["users"]
        Table_Courses["courses, modules, lessons, quizzes"]
        Table_Progress["lesson_progress, quiz_attempts"]
        Table_Badges["badges, certificates"]
        Table_Trans["lesson_translations"]
    end

    ReactApp -->|HTTP/REST + JWT| Reverse_Proxy
    Reverse_Proxy --> JWTGuard
    JWTGuard --> RouterHub
    RouterHub --> PedagogyPipeline
    RouterHub --> TranslationMgr
    RouterHub --> CertService
    RouterHub --> AdminInspector

    PedagogyPipeline -->|REST JSON| GeminiFlash
    TranslationMgr -->|REST JSON| GeminiFlash
    GeminiFlash -.->|Fallback| ModelRouter

    RouterHub -->|SQLAlchemy ORM| aira_db
    aira_db --- Table_Users
    aira_db --- Table_Courses
    aira_db --- Table_Progress
    aira_db --- Table_Badges
    aira_db --- Table_Trans
```

---

## 8. API Interface Specifications

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/auth/signup` | `POST` | Public | Register new learner account with bcrypt hash |
| `/auth/login` | `POST` | Public | Authenticate and issue JWT Bearer token |
| `/onboarding` | `POST` | User | Submit profession, domain, goal & style preferences |
| `/onboarding/me` | `GET` | User | Fetch current user profile & admin status |
| `/topics?domain={AI\|QC}` | `GET` | User | Get curated topics for selected frontier |
| `/courses` | `GET` | User | List all user courses with real-time progress |
| `/courses/generate` | `POST` | User | Generate new persona-calibrated course via AI |
| `/courses/{id}` | `GET` | User/Admin | Get comprehensive course details and lesson tree |
| `/courses/{id}/lessons/{lid}/toggle-complete` | `POST` | User | Toggle lesson completion state & recalculate % |
| `/courses/{id}/lessons/{lid}/quiz-attempt` | `POST` | User | Submit quiz score, evaluate badge threshold ($\ge 80\%$) |
| `/courses/{id}/flashcards` | `GET` | User/Admin | Retrieve 3D spaced repetition flashcard deck |
| `/courses/{id}/certificate` | `GET` | User/Admin | Issue or fetch verifiable Certificate & LinkedIn link |
| `/courses/public/verify-certificate/{uuid}` | `GET` | Public | Cryptographic certificate verification endpoint |
| `/courses/{id}/lessons/{lid}/translate` | `POST` | User | Translate lesson to Hinglish, Hindi, Tamil, Telugu, etc. |
| `/profile/me` | `GET` | User | Fetch personal details, learning persona & privacy toggles |
| `/profile/me` | `PUT` | User | Update display name, bio, avatar, domain & showcase privacy |
| `/profile/public/{username}` | `GET` | Public | Public showcase endpoint honoring learner privacy settings |
| `/admin/stats` | `GET` | Admin | Platform KPI analytics (users, courses, badges, avg scores) |
| `/admin/courses` | `GET` | Admin | All platform courses with progress & creator usernames |
| `/admin/courses/{id}` | `DELETE` | Admin | Cascade-delete any user's course |
| `/admin/users` | `GET` | Admin | All registered platform users |
| `/admin/users/{id}` | `DELETE` | Admin | Delete learner account and associated data |
| `/admin/database/tables` | `GET` | Admin | Live table summary list from `aira.db` |
| `/admin/database/table/{name}` | `GET` | Admin | Live row inspector for any SQLite table |

---

## 9. Security, Auth & Role-Based Access Control (RBAC)

* **Authentication Protocol:** OAuth2 Password Bearer flow issuing Signed JWT tokens (`HS256`, 7-day expiration).
* **Password Hashing:** `bcrypt` with dynamic work factor salt ($12$ rounds).
* **Role Hierarchy:**
  * **Learner (`is_admin = 0`):** Isolated course CRUD, own quiz attempts, personal badges & certificates.
  * **Super Admin (`is_admin = 1`):** Platform-wide visibility, course deletion rights, user management, and direct Live SQLite Database table inspector.
* **Client Route Guard:** `<ProtectedRoute>` higher-order component checking token presence, redirecting unauthenticated traffic to `/login` and non-admins away from `/admin`.

---

## 10. Deployment, Resilience & Caching Strategy

* **Frontend:** Next.js 16 (App Router) on Node.js / Vercel with automatic SSR hydration guards.
* **Backend:** FastAPI with Uvicorn ASGI server.
* **Database:** SQLite (file-based `backend/aira.db`) with automatic connection pooling and multi-threaded connection allowances (`check_same_thread=False`).
* **AI Fault Tolerance:**
  * Strict schema validation retry guards.
  * Translation persistence in `lesson_translations` ensures repeated reads incur 0ms network latency and 0 API token cost.

