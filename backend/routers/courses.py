import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User, Course, Module, Lesson, Quiz
from schemas import GenerateCourseRequest, CourseSummary, CourseDetail, ModuleOut, LessonOut, QuizOut
from auth import get_current_user
from llm import generate_course

router = APIRouter(prefix="/courses", tags=["courses"])


def _serialize_course(course: Course) -> CourseDetail:
    modules_out = []
    for mod in course.modules:
        lessons_out = []
        for les in mod.lessons:
            content = json.loads(les.content_json)
            quizzes_out = [
                QuizOut(
                    id=q.id,
                    question=q.question,
                    options=json.loads(q.options_json),
                    correct_answer=q.correct_answer,
                    explanation=q.explanation,
                )
                for q in les.quizzes
            ]
            lessons_out.append(
                LessonOut(id=les.id, title=les.title, content=content, order=les.order, quizzes=quizzes_out)
            )
        modules_out.append(ModuleOut(id=mod.id, title=mod.title, order=mod.order, lessons=lessons_out))

    return CourseDetail(
        id=course.id,
        domain=course.domain,
        topic=course.topic,
        title=course.title,
        description=course.description,
        difficulty=course.difficulty,
        created_at=course.created_at,
        modules=modules_out,
    )


@router.get("", response_model=list[CourseSummary])
def list_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.user_id == current_user.id).order_by(Course.created_at.desc()).all()
    return [
        CourseSummary(
            id=c.id,
            domain=c.domain,
            topic=c.topic,
            title=c.title,
            description=c.description,
            difficulty=c.difficulty,
            created_at=c.created_at,
        )
        for c in courses
    ]


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

    # Reload with relationships
    course = db.query(Course).filter(Course.id == course.id).first()
    return _serialize_course(course)


@router.get("/{course_id}", response_model=CourseDetail)
def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return _serialize_course(course)
