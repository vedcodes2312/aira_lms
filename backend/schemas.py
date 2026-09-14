from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    username: str
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    onboarding_done: bool


# ── Onboarding ─────────────────────────────────────────────────────────────────

class OnboardingRequest(BaseModel):
    profession: str
    profession_other: Optional[str] = None
    knowledge_level: str
    learning_domain: str
    learning_goal: str
    explanation_style: str


# ── Topics ─────────────────────────────────────────────────────────────────────

class TopicResponse(BaseModel):
    domain: str
    topics: List[str]


# ── Badges & Progress ──────────────────────────────────────────────────────────

class BadgeOut(BaseModel):
    id: int
    course_id: int
    name: str
    domain: str
    description: str
    icon: str
    earned_at: datetime

    class Config:
        from_attributes = True


class QuizAttemptCreate(BaseModel):
    score: int
    max_score: int
    percentage: int
    passed: bool


class QuizAttemptOut(BaseModel):
    id: int
    lesson_id: int
    score: int
    max_score: int
    percentage: int
    passed: bool
    attempted_at: datetime

    class Config:
        from_attributes = True


class QuizAttemptResponse(BaseModel):
    attempt: QuizAttemptOut
    badge_unlocked: Optional[BadgeOut] = None
    all_quizzes_passed: bool = False
    lesson_marked_complete: bool = True


class FlashcardOut(BaseModel):
    id: str
    lesson_id: int
    lesson_title: str
    front: str
    back: str
    category: str


# ── Course & Lessons ───────────────────────────────────────────────────────────

class GenerateCourseRequest(BaseModel):
    domain: str
    topic: str


class QuizOut(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

    class Config:
        from_attributes = True


class LessonOut(BaseModel):
    id: int
    title: str
    content: dict
    order: int
    quizzes: List[QuizOut] = []
    is_completed: bool = False
    best_quiz_score: Optional[int] = None
    quiz_attempts_count: int = 0

    class Config:
        from_attributes = True


class ModuleOut(BaseModel):
    id: int
    title: str
    order: int
    lessons: List[LessonOut] = []

    class Config:
        from_attributes = True


class CourseSummary(BaseModel):
    id: int
    domain: str
    topic: str
    title: str
    description: str
    difficulty: Optional[str]
    created_at: datetime
    total_lessons: int = 0
    completed_lessons: int = 0
    progress_percentage: int = 0
    badge: Optional[BadgeOut] = None

    class Config:
        from_attributes = True


class CourseDetail(CourseSummary):
    modules: List[ModuleOut] = []


# ── Certificates & LinkedIn Verification ──────────────────────────────────────

class CertificateOut(BaseModel):
    id: int
    cert_uuid: str
    recipient_name: str
    course_id: int
    course_title: str
    domain: str
    badge_name: Optional[str] = None
    score_percentage: int
    issued_at: datetime
    linkedin_url: str

    class Config:
        from_attributes = True


class PublicCertificateVerification(BaseModel):
    valid: bool
    cert_uuid: str
    recipient_name: str
    course_title: str
    domain: str
    badge_name: Optional[str] = None
    score_percentage: int
    issued_at: datetime
    issuer: str = "AIRA AI & Quantum LMS Platform"
    verification_url: str


# ── Language Translation ───────────────────────────────────────────────────────

class LessonTranslateRequest(BaseModel):
    language: str  # "Hinglish", "Hindi", "Tamil", "Telugu", "Marathi", "English"


class LessonTranslateResponse(BaseModel):
    lesson_id: int
    language: str
    content: dict
    is_cached: bool = False
