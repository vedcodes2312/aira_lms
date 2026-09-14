from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aira.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    profession = Column(String, nullable=True)
    knowledge_level = Column(String, nullable=True)
    learning_domain = Column(String, nullable=True)
    learning_goal = Column(String, nullable=True)
    explanation_style = Column(String, nullable=True)
    onboarding_done = Column(Integer, default=0)  # 0 = not done, 1 = done
    is_admin = Column(Integer, default=0)  # 0 = user, 1 = admin
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    courses = relationship("Course", back_populates="user")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    domain = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="courses")
    modules = relationship("Module", back_populates="course", order_by="Module.order")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    order = Column(Integer, nullable=False)

    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", order_by="Lesson.order")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    content_json = Column(Text, nullable=False)  # JSON string
    order = Column(Integer, nullable=False)

    module = relationship("Module", back_populates="lessons")
    quizzes = relationship("Quiz", back_populates="lesson")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    question = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON list of 4 strings
    correct_answer = Column(Integer, nullable=False)  # index 0-3
    explanation = Column(Text, nullable=False)

    lesson = relationship("Lesson", back_populates="quizzes")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed = Column(Integer, default=1)  # 1 = completed, 0 = incomplete
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    score = Column(Integer, nullable=False)
    max_score = Column(Integer, nullable=False)
    percentage = Column(Integer, nullable=False)  # 0-100
    passed = Column(Integer, default=0)  # 1 = passed (>=70%), 0 = failed
    attempted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Neural Architect", "Quantum Pioneer"
    domain = Column(String, nullable=False)  # "AI" or "QC"
    description = Column(Text, nullable=False)
    icon = Column(String, default="Trophy")  # Trophy, Award, Zap, etc.
    earned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    cert_uuid = Column(String, unique=True, index=True, nullable=False)  # e.g. "AIRA-2026-A1B2C3"
    recipient_name = Column(String, nullable=False)
    course_title = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    badge_name = Column(String, nullable=True)
    score_percentage = Column(Integer, default=100)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class LessonTranslation(Base):
    __tablename__ = "lesson_translations"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    language = Column(String, nullable=False)  # "Hinglish", "Hindi", "Tamil", "Telugu", "Marathi"
    content_json = Column(Text, nullable=False)  # Translated 9-stage JSON
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
    
    # Safe SQLite migrations
    with engine.connect() as conn:
        from sqlalchemy import text
        res = conn.execute(text("PRAGMA table_info(users)"))
        user_cols = [row[1] for row in res.fetchall()]
        if "is_admin" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0"))
            conn.commit()
        if "preferred_language" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN preferred_language VARCHAR DEFAULT 'English'"))
            conn.commit()

        res_c = conn.execute(text("PRAGMA table_info(courses)"))
        course_cols = [row[1] for row in res_c.fetchall()]
        if "language" not in course_cols:
            conn.execute(text("ALTER TABLE courses ADD COLUMN language VARCHAR DEFAULT 'English'"))
            conn.commit()

    # Seed default admin user
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            import bcrypt
            pwd_hash = bcrypt.hashpw("adminpassword123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            admin_user = User(
                username="admin",
                password_hash=pwd_hash,
                profession="Administrator",
                knowledge_level="Advanced",
                learning_domain="Artificial Intelligence",
                learning_goal="Platform Oversight",
                explanation_style="Technical",
                onboarding_done=1,
                is_admin=1,
                preferred_language="English",
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()
