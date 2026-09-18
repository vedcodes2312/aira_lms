import json
import re
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
    Certificate,
    LessonTranslation,
    Enrollment,
)
from schemas import (
    GenerateCourseRequest,
    CourseSummary,
    CourseDetail,
    ModuleOut,
    LessonOut,
    QuizOut,
    BadgeOut,
    QuizAttemptCreate,
    QuizAttemptOut,
    QuizAttemptResponse,
    FlashcardOut,
    CertificateOut,
    PublicCertificateVerification,
    LessonTranslateRequest,
    LessonTranslateResponse,
    ExploreCourseItem,
    EnrollCourseResponse,
)
from auth import get_current_user
from llm import generate_course

router = APIRouter(prefix="/courses", tags=["courses"])


def _get_course_badge(course_id: int, user_id: int, db: Session) -> Optional[BadgeOut]:
    b = db.query(Badge).filter(Badge.course_id == course_id, Badge.user_id == user_id).first()
    if b:
        return BadgeOut(
            id=b.id,
            course_id=b.course_id,
            name=b.name,
            domain=b.domain,
            description=b.description,
            icon=b.icon,
            earned_at=b.earned_at,
        )
    return None


def _serialize_course(course: Course, user_id: int, db: Session) -> CourseDetail:
    # Get completed lesson IDs for this user & course
    completed_rows = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.course_id == course.id,
            LessonProgress.user_id == user_id,
            LessonProgress.completed == 1,
        )
        .all()
    )
    completed_lesson_ids = {r.lesson_id for r in completed_rows}

    # Get quiz attempts for this user & course
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.course_id == course.id, QuizAttempt.user_id == user_id)
        .all()
    )
    best_scores = {}
    attempt_counts = {}
    for a in attempts:
        attempt_counts[a.lesson_id] = attempt_counts.get(a.lesson_id, 0) + 1
        if a.lesson_id not in best_scores or a.percentage > best_scores[a.lesson_id]:
            best_scores[a.lesson_id] = a.percentage

    total_lessons = 0
    completed_lessons = 0

    modules_out = []
    for mod in course.modules:
        lessons_out = []
        for les in mod.lessons:
            total_lessons += 1
            is_comp = les.id in completed_lesson_ids
            if is_comp:
                completed_lessons += 1

            try:
                content = json.loads(les.content_json)
            except Exception:
                content = {}

            quizzes_out = []
            for q in les.quizzes:
                try:
                    options = json.loads(q.options_json)
                except Exception:
                    options = []
                quizzes_out.append(
                    QuizOut(
                        id=q.id,
                        question=q.question,
                        options=options,
                        correct_answer=q.correct_answer,
                        explanation=q.explanation,
                    )
                )

            lessons_out.append(
                LessonOut(
                    id=les.id,
                    title=les.title,
                    content=content,
                    order=les.order,
                    quizzes=quizzes_out,
                    is_completed=is_comp,
                    best_quiz_score=best_scores.get(les.id),
                    quiz_attempts_count=attempt_counts.get(les.id, 0),
                )
            )
        modules_out.append(ModuleOut(id=mod.id, title=mod.title, order=mod.order, lessons=lessons_out))

    progress_percentage = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
    badge = _get_course_badge(course.id, user_id, db)

    return CourseDetail(
        id=course.id,
        domain=course.domain,
        topic=course.topic,
        title=course.title,
        description=course.description,
        difficulty=course.difficulty,
        created_at=course.created_at,
        total_lessons=total_lessons,
        completed_lessons=completed_lessons,
        progress_percentage=progress_percentage,
        badge=badge,
        modules=modules_out,
    )


@router.get("/explore", response_model=List[ExploreCourseItem])
def explore_courses(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Search and explore all AI-generated courses across the platform with creator details and enrollment status."""
    query = db.query(Course)

    if domain and domain.lower() != "all":
        query = query.filter(Course.domain.ilike(f"%{domain}%"))

    if difficulty and difficulty.lower() != "all":
        query = query.filter(Course.difficulty.ilike(f"%{difficulty}%"))

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.join(User, Course.user_id == User.id).filter(
            (Course.title.ilike(s))
            | (Course.topic.ilike(s))
            | (Course.description.ilike(s))
            | (Course.domain.ilike(s))
            | (User.username.ilike(s))
            | (User.full_name.ilike(s))
        )

    courses = query.order_by(Course.created_at.desc()).all()

    # Get user enrollments
    user_enrolled_ids = set()
    if current_user:
        enrollments = db.query(Enrollment.course_id).filter(Enrollment.user_id == current_user.id).all()
        user_enrolled_ids = {e[0] for e in enrollments}

    results = []
    for c in courses:
        creator = db.query(User).filter(User.id == c.user_id).first()
        all_lessons = [les for mod in c.modules for les in mod.lessons]
        total_lessons = len(all_lessons)
        total_modules = len(c.modules)

        # Enrolled count (creators + enrollments)
        enrolled_count = db.query(Enrollment).filter(Enrollment.course_id == c.id).count() + 1

        is_creator = current_user.id == c.user_id if current_user else False
        is_enrolled = is_creator or (c.id in user_enrolled_ids)

        # Calculate current user's progress
        progress_pct = 0
        badge_name = None
        if current_user and is_enrolled and total_lessons > 0:
            completed_count = (
                db.query(LessonProgress)
                .filter(
                    LessonProgress.course_id == c.id,
                    LessonProgress.user_id == current_user.id,
                    LessonProgress.completed == 1,
                )
                .count()
            )
            progress_pct = int((completed_count / total_lessons * 100))
            b = db.query(Badge).filter(Badge.course_id == c.id, Badge.user_id == current_user.id).first()
            if b:
                badge_name = b.name

        results.append(
            ExploreCourseItem(
                id=c.id,
                domain=c.domain,
                topic=c.topic,
                title=c.title,
                description=c.description,
                difficulty=c.difficulty or "Beginner",
                creator_id=c.user_id,
                creator_username=creator.username if creator else "community",
                creator_avatar=creator.avatar_url if (creator and creator.avatar_url) else "bot-1",
                created_at=c.created_at,
                total_lessons=total_lessons,
                total_modules=total_modules,
                enrolled_count=enrolled_count,
                is_enrolled=is_enrolled,
                progress_percentage=progress_pct,
                badge_name=badge_name,
                is_creator=is_creator,
                is_ai_generated=True,
            )
        )
    return results


@router.post("/{course_id}/enroll", response_model=EnrollCourseResponse)
def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Enroll the current user into an existing course so they track their own independent progress from scratch."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.user_id == current_user.id:
        return EnrollCourseResponse(
            message="You are the creator of this course and are already enrolled.",
            enrolled=True,
            course_id=course.id,
        )

    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if existing:
        return EnrollCourseResponse(
            message=f"You are already enrolled in '{course.title}'.",
            enrolled=True,
            course_id=course.id,
        )

    enrollment = Enrollment(user_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    db.commit()

    return EnrollCourseResponse(
        message=f"Successfully enrolled in '{course.title}'! Your personal progress has started.",
        enrolled=True,
        course_id=course.id,
    )


@router.get("", response_model=list[CourseSummary])
def list_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all courses created by or enrolled by the current user with real-time personal progress."""
    created_courses = db.query(Course).filter(Course.user_id == current_user.id).all()
    created_ids = {c.id for c in created_courses}

    enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    enrolled_ids = [e.course_id for e in enrollments if e.course_id not in created_ids]
    enrolled_courses = db.query(Course).filter(Course.id.in_(enrolled_ids)).all() if enrolled_ids else []

    all_courses = created_courses + enrolled_courses
    all_courses.sort(key=lambda x: x.created_at, reverse=True)

    results = []
    for c in all_courses:
        all_lessons = [les for mod in c.modules for les in mod.lessons]
        total_lessons = len(all_lessons)
        lesson_ids = [les.id for les in all_lessons]

        completed_count = 0
        if lesson_ids:
            completed_count = (
                db.query(LessonProgress)
                .filter(
                    LessonProgress.course_id == c.id,
                    LessonProgress.user_id == current_user.id,
                    LessonProgress.lesson_id.in_(lesson_ids),
                    LessonProgress.completed == 1,
                )
                .count()
            )

        progress_percentage = int((completed_count / total_lessons * 100)) if total_lessons > 0 else 0
        badge = _get_course_badge(c.id, current_user.id, db)

        results.append(
            CourseSummary(
                id=c.id,
                domain=c.domain,
                topic=c.topic,
                title=c.title,
                description=c.description,
                difficulty=c.difficulty,
                created_at=c.created_at,
                total_lessons=total_lessons,
                completed_lessons=completed_count,
                progress_percentage=progress_percentage,
                badge=badge,
            )
        )
    return results


@router.get("/badges/me", response_model=List[BadgeOut])
def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    badges = db.query(Badge).filter(Badge.user_id == current_user.id).order_by(Badge.earned_at.desc()).all()
    return badges


@router.post("/generate", response_model=CourseDetail)
def generate(
    req: GenerateCourseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.onboarding_done:
        raise HTTPException(status_code=400, detail="Please complete onboarding first")
    if not current_user.profession:
        raise HTTPException(status_code=400, detail="User profile incomplete")

    try:
        data = generate_course(
            topic=req.topic,
            domain=req.domain,
            profession=current_user.profession,
            knowledge_level=current_user.knowledge_level,
            learning_goal=current_user.learning_goal,
            explanation_style=current_user.explanation_style,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    # Persist to DB
    course = Course(
        user_id=current_user.id,
        domain=req.domain,
        topic=req.topic,
        title=data.get("title", req.topic),
        description=data.get("description", ""),
        difficulty=data.get("difficulty", current_user.knowledge_level),
    )
    db.add(course)
    db.flush()

    for mod_order, mod_data in enumerate(data.get("modules", []), start=1):
        module = Module(
            course_id=course.id,
            title=mod_data.get("title", f"Module {mod_order}"),
            order=mod_data.get("order", mod_order),
        )
        db.add(module)
        db.flush()

        for les_order, les_data in enumerate(mod_data.get("lessons", []), start=1):
            content = les_data.get("content", {})
            lesson = Lesson(
                module_id=module.id,
                title=les_data.get("title", f"Lesson {les_order}"),
                content_json=json.dumps(content),
                order=les_data.get("order", les_order),
            )
            db.add(lesson)
            db.flush()

            for quiz_data in les_data.get("quiz", []):
                quiz = Quiz(
                    lesson_id=lesson.id,
                    question=quiz_data.get("question", ""),
                    options_json=json.dumps(quiz_data.get("options", [])),
                    correct_answer=int(quiz_data.get("correct_answer", 0)),
                    explanation=quiz_data.get("explanation", ""),
                )
                db.add(quiz)

    db.commit()
    db.refresh(course)

    course = db.query(Course).filter(Course.id == course.id).first()
    return _serialize_course(course, current_user.id, db)


@router.get("/{course_id}", response_model=CourseDetail)
def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return _serialize_course(course, current_user.id, db)


@router.post("/{course_id}/lessons/{lesson_id}/toggle-complete")
def toggle_lesson_complete(
    course_id: int,
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    progress = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.course_id == course_id,
            LessonProgress.lesson_id == lesson_id,
            LessonProgress.user_id == current_user.id,
        )
        .first()
    )

    if progress:
        progress.completed = 1 if progress.completed == 0 else 0
        progress.completed_at = datetime.now(timezone.utc)
    else:
        progress = LessonProgress(
            user_id=current_user.id,
            course_id=course_id,
            lesson_id=lesson_id,
            completed=1,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(progress)

    db.commit()

    # Recalculate course completion
    all_lessons = [les.id for mod in course.modules for les in mod.lessons]
    completed_count = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.course_id == course_id,
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id.in_(all_lessons),
            LessonProgress.completed == 1,
        )
        .count()
    )
    pct = int((completed_count / len(all_lessons) * 100)) if all_lessons else 0

    return {
        "is_completed": bool(progress.completed == 1),
        "completed_lessons": completed_count,
        "total_lessons": len(all_lessons),
        "progress_percentage": pct,
    }


@router.post("/{course_id}/lessons/{lesson_id}/quiz-attempt", response_model=QuizAttemptResponse)
def submit_quiz_attempt(
    course_id: int,
    lesson_id: int,
    req: QuizAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Record the attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        course_id=course_id,
        lesson_id=lesson_id,
        score=req.score,
        max_score=req.max_score,
        percentage=req.percentage,
        passed=1 if req.passed else 0,
        attempted_at=datetime.now(timezone.utc),
    )
    db.add(attempt)

    # Automatically mark lesson completed if passed
    if req.passed:
        prog = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.course_id == course_id,
                LessonProgress.lesson_id == lesson_id,
                LessonProgress.user_id == current_user.id,
            )
            .first()
        )
        if prog:
            prog.completed = 1
            prog.completed_at = datetime.now(timezone.utc)
        else:
            prog = LessonProgress(
                user_id=current_user.id,
                course_id=course_id,
                lesson_id=lesson_id,
                completed=1,
                completed_at=datetime.now(timezone.utc),
            )
            db.add(prog)

    db.commit()
    db.refresh(attempt)

    # Check Badge criteria:
    # Award achievement badge if user scored >= 80% on all lesson quizzes in this course!
    all_lessons = [les.id for mod in course.modules for les in mod.lessons]
    all_passed_high = True
    for lid in all_lessons:
        highest_score = (
            db.query(QuizAttempt.percentage)
            .filter(
                QuizAttempt.course_id == course_id,
                QuizAttempt.lesson_id == lid,
                QuizAttempt.user_id == current_user.id,
            )
            .order_by(QuizAttempt.percentage.desc())
            .first()
        )
        if not highest_score or highest_score[0] < 80:
            all_passed_high = False
            break

    badge_unlocked: Optional[BadgeOut] = None
    if all_passed_high and len(all_lessons) > 0:
        existing_badge = (
            db.query(Badge)
            .filter(Badge.course_id == course_id, Badge.user_id == current_user.id)
            .first()
        )
        if not existing_badge:
            badge_name = (
                "Neural Architect" if course.domain == "AI" else "Quantum Pioneer"
            )
            if "transformer" in course.topic.lower() or "llm" in course.topic.lower():
                badge_name = "LLM Mastermind"
            elif "algorithm" in course.topic.lower() or "shor" in course.topic.lower():
                badge_name = "Quantum Algorist"

            new_badge = Badge(
                user_id=current_user.id,
                course_id=course_id,
                name=badge_name,
                domain=course.domain,
                description=f"Scored >=80% on all quizzes in '{course.title}'",
                icon="Trophy" if course.domain == "AI" else "Atom",
                earned_at=datetime.now(timezone.utc),
            )
            db.add(new_badge)
            db.commit()
            db.refresh(new_badge)
            existing_badge = new_badge

        if existing_badge:
            badge_unlocked = BadgeOut(
                id=existing_badge.id,
                course_id=existing_badge.course_id,
                name=existing_badge.name,
                domain=existing_badge.domain,
                description=existing_badge.description,
                icon=existing_badge.icon,
                earned_at=existing_badge.earned_at,
            )

    return QuizAttemptResponse(
        attempt=QuizAttemptOut(
            id=attempt.id,
            lesson_id=attempt.lesson_id,
            score=attempt.score,
            max_score=attempt.max_score,
            percentage=attempt.percentage,
            passed=bool(attempt.passed),
            attempted_at=attempt.attempted_at,
        ),
        badge_unlocked=badge_unlocked,
        all_quizzes_passed=all_passed_high,
        lesson_marked_complete=req.passed,
    )


@router.get("/{course_id}/flashcards", response_model=List[FlashcardOut])
def get_course_flashcards(
    course_id: int,
    lesson_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    flashcards: List[FlashcardOut] = []
    card_idx = 1

    for mod in course.modules:
        for les in mod.lessons:
            if lesson_id is not None and les.id != lesson_id:
                continue

            try:
                content = json.loads(les.content_json)
            except Exception:
                content = {}

            # 1. Important concepts
            concepts = content.get("important_concepts", "")
            if isinstance(concepts, str) and concepts.strip():
                # Split lines
                for line in concepts.split("\n"):
                    line = line.strip(" -*•")
                    if not line:
                        continue
                    if ":" in line:
                        term, defn = line.split(":", 1)
                    elif " - " in line:
                        term, defn = line.split(" - ", 1)
                    else:
                        term, defn = line, content.get("summary", line)

                    if term.strip() and defn.strip():
                        flashcards.append(
                            FlashcardOut(
                                id=f"fc-{card_idx}",
                                lesson_id=les.id,
                                lesson_title=les.title,
                                front=term.strip(),
                                back=defn.strip(),
                                category="Important Concept",
                            )
                        )
                        card_idx += 1

            # 2. Key Takeaways
            takeaways = content.get("key_takeaways", [])
            if isinstance(takeaways, list):
                for i, t in enumerate(takeaways, start=1):
                    if isinstance(t, str) and t.strip():
                        flashcards.append(
                            FlashcardOut(
                                id=f"fc-{card_idx}",
                                lesson_id=les.id,
                                lesson_title=les.title,
                                front=f"Key Takeaway #{i} ({les.title})",
                                back=t.strip(),
                                category="Key Takeaway",
                            )
                        )
                        card_idx += 1

            # 3. Mechanism / How it works
            how_it_works = content.get("how_it_works", "")
            if isinstance(how_it_works, str) and len(how_it_works.strip()) > 20:
                flashcards.append(
                    FlashcardOut(
                        id=f"fc-{card_idx}",
                        lesson_id=les.id,
                        lesson_title=les.title,
                        front=f"How It Works: {les.title}",
                        back=how_it_works.strip(),
                        category="Mechanism Breakdown",
                    )
                )
                card_idx += 1

    return flashcards


# ── Certificates & LinkedIn Verification ──────────────────────────────────────

@router.get("/{course_id}/certificate", response_model=CertificateOut)
def get_or_issue_certificate(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check authorization (creator, admin, or enrolled)
    is_enrolled = (course.user_id == current_user.id) or db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first() is not None

    if not current_user.is_admin and not is_enrolled:
        raise HTTPException(status_code=403, detail="Please enroll in this course to earn a certificate")

    # Check progress
    all_lessons = [les.id for mod in course.modules for les in mod.lessons]
    total_lessons = len(all_lessons)
    if total_lessons == 0:
        raise HTTPException(status_code=400, detail="Course has no lessons")

    completed_count = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.course_id == course_id,
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id.in_(all_lessons),
            LessonProgress.completed == 1,
        )
        .count()
    )

    if completed_count < total_lessons and not current_user.is_admin:
        raise HTTPException(
            status_code=400,
            detail=f"Course is not 100% complete yet ({completed_count}/{total_lessons} lessons completed)",
        )

    # Check if certificate exists
    cert = (
        db.query(Certificate)
        .filter(Certificate.course_id == course_id, Certificate.user_id == current_user.id)
        .first()
    )

    if not cert:
        import secrets
        badge = db.query(Badge).filter(Badge.course_id == course_id, Badge.user_id == current_user.id).first()
        badge_name = badge.name if badge else ("Neural Architect" if course.domain == "AI" else "Quantum Pioneer")

        cert_uuid = f"AIRA-{datetime.now(timezone.utc).year}-{secrets.token_hex(4).upper()}"
        
        # Calculate average quiz score
        avg_score_row = (
            db.query(QuizAttempt.percentage)
            .filter(QuizAttempt.course_id == course_id, QuizAttempt.user_id == current_user.id)
            .all()
        )
        avg_score = int(sum(r[0] for r in avg_score_row) / len(avg_score_row)) if avg_score_row else 100

        # Formatted recipient name (capitalized nicely)
        raw_name = current_user.username.replace("_", " ").title()

        cert = Certificate(
            user_id=current_user.id,
            course_id=course_id,
            cert_uuid=cert_uuid,
            recipient_name=raw_name,
            course_title=course.title,
            domain=course.domain,
            badge_name=badge_name,
            score_percentage=max(avg_score, 80),
            issued_at=datetime.now(timezone.utc),
        )
        db.add(cert)
        db.commit()
        db.refresh(cert)

    import urllib.parse
    cert_url = f"http://localhost:3000/certificate/{cert.cert_uuid}"
    linkedin_url = (
        f"https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME"
        f"&name={urllib.parse.quote(cert.course_title)}"
        f"&organizationName=AIRA%20AI%20%26%20Quantum%20LMS"
        f"&issueYear={cert.issued_at.year}"
        f"&issueMonth={cert.issued_at.month}"
        f"&certUrl={urllib.parse.quote(cert_url)}"
        f"&certId={cert.cert_uuid}"
    )

    return CertificateOut(
        id=cert.id,
        cert_uuid=cert.cert_uuid,
        recipient_name=cert.recipient_name,
        course_id=cert.course_id,
        course_title=cert.course_title,
        domain=cert.domain,
        badge_name=cert.badge_name,
        score_percentage=cert.score_percentage,
        issued_at=cert.issued_at,
        linkedin_url=linkedin_url,
    )


@router.get("/public/verify-certificate/{cert_uuid}", response_model=PublicCertificateVerification)
def verify_certificate_public(cert_uuid: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.cert_uuid == cert_uuid).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found or invalid verification ID")

    return PublicCertificateVerification(
        valid=True,
        cert_uuid=cert.cert_uuid,
        recipient_name=cert.recipient_name,
        course_title=cert.course_title,
        domain=cert.domain,
        badge_name=cert.badge_name,
        score_percentage=cert.score_percentage,
        issued_at=cert.issued_at,
        issuer="AIRA AI & Quantum LMS Platform",
        verification_url=f"http://localhost:3000/certificate/{cert.cert_uuid}",
    )


# ── Lesson Translation & Multi-Lingual Engine ─────────────────────────────────

@router.post("/{course_id}/lessons/{lesson_id}/translate", response_model=LessonTranslateResponse)
def translate_lesson(
    course_id: int,
    lesson_id: int,
    req: LessonTranslateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    target_lang = req.language.strip()
    if target_lang.lower() in ["english", "en"]:
        try:
            content = json.loads(lesson.content_json)
        except Exception:
            content = {}
        return LessonTranslateResponse(lesson_id=lesson.id, language="English", content=content, is_cached=True)

    # Check cache in DB
    cached = (
        db.query(LessonTranslation)
        .filter(LessonTranslation.lesson_id == lesson_id, LessonTranslation.language.ilike(target_lang))
        .first()
    )
    if cached:
        try:
            cached_content = json.loads(cached.content_json)
            return LessonTranslateResponse(lesson_id=lesson.id, language=target_lang, content=cached_content, is_cached=True)
        except Exception:
            pass

    # Generate translation via LLM
    try:
        original_content = json.loads(lesson.content_json)
    except Exception:
        original_content = {}

    from llm import translate_lesson_content
    translated_content = translate_lesson_content(original_content, target_lang)

    # Persist translation cache
    new_trans = LessonTranslation(
        lesson_id=lesson_id,
        language=target_lang,
        content_json=json.dumps(translated_content),
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_trans)
    db.commit()

    return LessonTranslateResponse(
        lesson_id=lesson_id,
        language=target_lang,
        content=translated_content,
        is_cached=False,
    )
