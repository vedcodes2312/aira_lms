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


# ── Course Generation ───────────────────────────────────────────────────────────

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

    class Config:
        from_attributes = True


class CourseDetail(CourseSummary):
    modules: List[ModuleOut] = []
