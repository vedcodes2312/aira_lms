import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import (
    get_db,
    User,
    Course,
    Module,
    Lesson,
    Quiz,
    LessonProgress,
    QuizAttempt,
    Badge,
)
from auth import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_admin_stats(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_courses = db.query(Course).count()
    total_lessons = db.query(Lesson).count()
    total_quizzes = db.query(Quiz).count()
    total_quiz_attempts = db.query(QuizAttempt).count()
    total_badges = db.query(Badge).count()

    attempts = db.query(QuizAttempt.percentage).all()
    avg_score = round(sum(a[0] for a in attempts) / len(attempts), 1) if attempts else 0.0

    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_lessons": total_lessons,
        "total_quizzes": total_quizzes,
        "total_quiz_attempts": total_quiz_attempts,
        "total_badges_earned": total_badges,
        "average_quiz_score": avg_score,
    }


@router.get("/courses")
def get_all_courses(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    results = []
    for c in courses:
        user = db.query(User).filter(User.id == c.user_id).first()
        all_lessons = [les for mod in c.modules for les in mod.lessons]
        total_lessons = len(all_lessons)

        completed_count = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.course_id == c.id,
                LessonProgress.user_id == c.user_id,
                LessonProgress.completed == 1,
            )
            .count()
        )

        badge = db.query(Badge).filter(Badge.course_id == c.id, Badge.user_id == c.user_id).first()

        results.append({
            "id": c.id,
            "user_id": c.user_id,
            "username": user.username if user else "Unknown",
            "domain": c.domain,
            "topic": c.topic,
            "title": c.title,
            "description": c.description,
            "difficulty": c.difficulty,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "total_lessons": total_lessons,
            "completed_lessons": completed_count,
            "progress_percentage": int((completed_count / total_lessons * 100)) if total_lessons > 0 else 0,
            "badge_name": badge.name if badge else None,
        })
    return results


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Delete related quiz attempts, progress, badges, quizzes, lessons, modules
    db.query(QuizAttempt).filter(QuizAttempt.course_id == course_id).delete()
    db.query(LessonProgress).filter(LessonProgress.course_id == course_id).delete()
    db.query(Badge).filter(Badge.course_id == course_id).delete()

    for mod in course.modules:
        for les in mod.lessons:
            db.query(Quiz).filter(Quiz.lesson_id == les.id).delete()
            db.delete(les)
        db.delete(mod)

    db.delete(course)
    db.commit()
    return {"message": f"Course '{course.title}' (ID: {course_id}) was permanently deleted by admin"}


@router.get("/users")
def get_all_users(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.id.asc()).all()
    results = []
    for u in users:
        course_count = db.query(Course).filter(Course.user_id == u.id).count()
        badge_count = db.query(Badge).filter(Badge.user_id == u.id).count()
        results.append({
            "id": u.id,
            "username": u.username,
            "profession": u.profession,
            "knowledge_level": u.knowledge_level,
            "learning_domain": u.learning_domain,
            "learning_goal": u.learning_goal,
            "explanation_style": u.explanation_style,
            "onboarding_done": bool(u.onboarding_done),
            "is_admin": bool(u.is_admin),
            "course_count": course_count,
            "badge_count": badge_count,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return results


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    courses = db.query(Course).filter(Course.user_id == user_id).all()
    for c in courses:
        db.query(QuizAttempt).filter(QuizAttempt.course_id == c.id).delete()
        db.query(LessonProgress).filter(LessonProgress.course_id == c.id).delete()
        db.query(Badge).filter(Badge.course_id == c.id).delete()
        for mod in c.modules:
            for les in mod.lessons:
                db.query(Quiz).filter(Quiz.lesson_id == les.id).delete()
                db.delete(les)
            db.delete(mod)
        db.delete(c)

    db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).delete()
    db.query(LessonProgress).filter(LessonProgress.user_id == user_id).delete()
    db.query(Badge).filter(Badge.user_id == user_id).delete()
    db.delete(user)
    db.commit()

    return {"message": f"User '{user.username}' and all associated courses were permanently deleted"}


@router.get("/database/tables")
def get_database_tables(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """List all SQLite tables with row counts."""
    tables = [
        "users",
        "courses",
        "modules",
        "lessons",
        "quizzes",
        "quiz_attempts",
        "badges",
        "lesson_progress",
    ]
    summary = []
    for t in tables:
        count = db.execute(text(f"SELECT COUNT(*) FROM {t}")).scalar()
        summary.append({"table_name": t, "row_count": count})
    return summary


@router.get("/database/table/{table_name}")
def get_table_data(
    table_name: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """View up to 100 rows and schema columns of any table in SQLite."""
    valid_tables = [
        "users",
        "courses",
        "modules",
        "lessons",
        "quizzes",
        "quiz_attempts",
        "badges",
        "lesson_progress",
    ]
    if table_name not in valid_tables:
        raise HTTPException(status_code=400, detail="Invalid table name")

    # Get column info
    col_res = db.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
    columns = [row[1] for row in col_res]

    # Get rows
    rows_res = db.execute(text(f"SELECT * FROM {table_name} LIMIT 100")).fetchall()
    rows = []
    for r in rows_res:
        row_dict = {}
        for idx, col in enumerate(columns):
            val = r[idx]
            # Format long JSON or password hash for safety/cleanliness
            if col == "password_hash":
                row_dict[col] = "•••••••• [bcrypt hash]"
            elif isinstance(val, str) and len(val) > 200:
                row_dict[col] = val[:200] + "…"
            else:
                row_dict[col] = val
        rows.append(row_dict)

    return {
        "table_name": table_name,
        "columns": columns,
        "total_returned": len(rows),
        "rows": rows,
    }
