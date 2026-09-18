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


# ── Profile & Privacy Settings ────────────────────────────────────────────────

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    profession: Optional[str] = None
    knowledge_level: Optional[str] = None
    learning_domain: Optional[str] = None
    learning_goal: Optional[str] = None
    explanation_style: Optional[str] = None
    preferred_language: Optional[str] = None
    is_public: Optional[bool] = None
    show_real_name: Optional[bool] = None
    show_courses: Optional[bool] = None
    show_badges: Optional[bool] = None
    show_certificates: Optional[bool] = None
    show_interests: Optional[bool] = None


class UserProfileResponse(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = "bot-1"
    profession: Optional[str] = None
    knowledge_level: Optional[str] = None
    learning_domain: Optional[str] = None
    learning_goal: Optional[str] = None
    explanation_style: Optional[str] = None
    preferred_language: Optional[str] = "English"
    is_admin: bool = False
    onboarding_done: bool = False
    created_at: Optional[datetime] = None
    
    # Privacy
    is_public: bool = True
    show_real_name: bool = True
    show_courses: bool = True
    show_badges: bool = True
    show_certificates: bool = True
    show_interests: bool = True

    # Stats
    total_courses: int = 0
    completed_courses: int = 0
    total_badges: int = 0
    total_certificates: int = 0


class PublicCourseItem(BaseModel):
    id: int
    title: str
    domain: str
    topic: str
    difficulty: Optional[str]
    total_lessons: int
    completed_lessons: int
    progress_percentage: int
    badge_name: Optional[str] = None


class PublicBadgeItem(BaseModel):
    id: int
    name: str
    domain: str
    description: str
    icon: str
    earned_at: datetime


class PublicCertItem(BaseModel):
    cert_uuid: str
    course_title: str
    domain: str
    badge_name: Optional[str] = None
    score_percentage: int
    issued_at: datetime
    verification_url: str


class PublicProfileResponse(BaseModel):
    is_public: bool
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = "bot-1"
    profession: Optional[str] = None
    member_since: Optional[datetime] = None
    
    # Interests
    show_interests: bool = False
    learning_domain: Optional[str] = None
    knowledge_level: Optional[str] = None
    learning_goal: Optional[str] = None
    explanation_style: Optional[str] = None
    
    # Showcases
    show_courses: bool = False
    courses: List[PublicCourseItem] = []
    
    show_badges: bool = False
    badges: List[PublicBadgeItem] = []
    
    show_certificates: bool = False
    certificates: List[PublicCertItem] = []
    
    # Aggregate Stats
    total_courses: int = 0
    completed_courses: int = 0
    total_badges: int = 0
    total_certificates: int = 0


# ── Course Search & Explore ───────────────────────────────────────────────────

class ExploreCourseItem(BaseModel):
    id: int
    domain: str
    topic: str
    title: str
    description: str
    difficulty: Optional[str] = "Beginner"
    creator_id: int
    creator_username: str
    creator_avatar: Optional[str] = "bot-1"
    created_at: datetime
    total_lessons: int
    total_modules: int
    enrolled_count: int
    is_enrolled: bool = False
    progress_percentage: int = 0
    badge_name: Optional[str] = None
    is_creator: bool = False
    is_ai_generated: bool = True


class EnrollCourseResponse(BaseModel):
    message: str
    enrolled: bool
    course_id: int

