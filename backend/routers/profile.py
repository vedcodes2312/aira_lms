from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from database import (
    get_db,
    User,
    Course,
    Module,
    Lesson,
    LessonProgress,
    Badge,
    Certificate,
)
from auth import get_current_user
from schemas import (
    UserProfileUpdate,
    UserProfileResponse,
    PublicProfileResponse,
    PublicCourseItem,
    PublicBadgeItem,
    PublicCertItem,
)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve full profile, preferences, privacy settings and stats for current user."""
    total_courses = db.query(Course).filter(Course.user_id == current_user.id).count()
    
    # Calculate completed courses
    user_courses = db.query(Course).filter(Course.user_id == current_user.id).all()
    completed_courses = 0
    for c in user_courses:
        all_lessons = [les for mod in c.modules for les in mod.lessons]
        total_lessons = len(all_lessons)
        if total_lessons > 0:
            completed_count = (
                db.query(LessonProgress)
                .filter(
                    LessonProgress.course_id == c.id,
                    LessonProgress.user_id == current_user.id,
                    LessonProgress.completed == 1,
                )
                .count()
            )
            if completed_count >= total_lessons:
                completed_courses += 1

    total_badges = db.query(Badge).filter(Badge.user_id == current_user.id).count()
    total_certificates = db.query(Certificate).filter(Certificate.user_id == current_user.id).count()

    return UserProfileResponse(
        id=current_user.id,
        username=current_user.username,
        full_name=current_user.full_name,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url or "bot-1",
        profession=current_user.profession,
        knowledge_level=current_user.knowledge_level,
        learning_domain=current_user.learning_domain,
        learning_goal=current_user.learning_goal,
        explanation_style=current_user.explanation_style,
        preferred_language=current_user.preferred_language or "English",
        is_admin=bool(current_user.is_admin),
        onboarding_done=bool(current_user.onboarding_done),
        created_at=current_user.created_at,
        is_public=bool(current_user.is_public if current_user.is_public is not None else 1),
        show_real_name=bool(current_user.show_real_name if current_user.show_real_name is not None else 1),
        show_courses=bool(current_user.show_courses if current_user.show_courses is not None else 1),
        show_badges=bool(current_user.show_badges if current_user.show_badges is not None else 1),
        show_certificates=bool(current_user.show_certificates if current_user.show_certificates is not None else 1),
        show_interests=bool(current_user.show_interests if current_user.show_interests is not None else 1),
        total_courses=total_courses,
        completed_courses=completed_courses,
        total_badges=total_badges,
        total_certificates=total_certificates,
    )


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    req: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user personal details, learning preferences and public profile privacy toggles."""
    if req.full_name is not None:
        current_user.full_name = req.full_name.strip() or None
    if req.bio is not None:
        current_user.bio = req.bio.strip() or None
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    if req.profession is not None:
        current_user.profession = req.profession.strip() or None
    if req.knowledge_level is not None:
        current_user.knowledge_level = req.knowledge_level
    if req.learning_domain is not None:
        current_user.learning_domain = req.learning_domain
    if req.learning_goal is not None:
        current_user.learning_goal = req.learning_goal
    if req.explanation_style is not None:
        current_user.explanation_style = req.explanation_style
    if req.preferred_language is not None:
        current_user.preferred_language = req.preferred_language
        
    # Privacy toggles
    if req.is_public is not None:
        current_user.is_public = 1 if req.is_public else 0
    if req.show_real_name is not None:
        current_user.show_real_name = 1 if req.show_real_name else 0
    if req.show_courses is not None:
        current_user.show_courses = 1 if req.show_courses else 0
    if req.show_badges is not None:
        current_user.show_badges = 1 if req.show_badges else 0
    if req.show_certificates is not None:
        current_user.show_certificates = 1 if req.show_certificates else 0
    if req.show_interests is not None:
        current_user.show_interests = 1 if req.show_interests else 0

    db.commit()
    db.refresh(current_user)

    return get_my_profile(current_user=current_user, db=db)


@router.get("/public/{username}", response_model=PublicProfileResponse)
def get_public_profile(
    username: str,
    db: Session = Depends(get_db),
):
    """Public endpoint to view a learner's showcase profile honoring their privacy settings."""
    user = db.query(User).filter(User.username.ilike(username.strip())).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '@{username}' not found on AIRA",
        )

    # Check if profile is public
    is_public = bool(user.is_public if user.is_public is not None else 1)
    if not is_public:
        return PublicProfileResponse(
            is_public=False,
            username=user.username,
            avatar_url=user.avatar_url or "bot-1",
        )

    # Display name logic
    show_real_name = bool(user.show_real_name if user.show_real_name is not None else 1)
    display_name = user.full_name if (show_real_name and user.full_name) else user.username

    # Stats
    user_courses = db.query(Course).filter(Course.user_id == user.id).all()
    total_courses = len(user_courses)
    completed_courses = 0

    # Build courses showcase if enabled
    show_courses = bool(user.show_courses if user.show_courses is not None else 1)
    courses_out: List[PublicCourseItem] = []
    
    for c in user_courses:
        all_lessons = [les for mod in c.modules for les in mod.lessons]
        total_lessons = len(all_lessons)
        completed_count = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.course_id == c.id,
                LessonProgress.user_id == user.id,
                LessonProgress.completed == 1,
            )
            .count()
        ) if total_lessons > 0 else 0
        
        progress_pct = int((completed_count / total_lessons * 100)) if total_lessons > 0 else 0
        if progress_pct >= 100:
            completed_courses += 1
            
        badge = db.query(Badge).filter(Badge.course_id == c.id, Badge.user_id == user.id).first()

        if show_courses:
            courses_out.append(
                PublicCourseItem(
                    id=c.id,
                    title=c.title,
                    domain=c.domain,
                    topic=c.topic,
                    difficulty=c.difficulty,
                    total_lessons=total_lessons,
                    completed_lessons=completed_count,
                    progress_percentage=progress_pct,
                    badge_name=badge.name if badge else None,
                )
            )

    # Badges showcase if enabled
    show_badges = bool(user.show_badges if user.show_badges is not None else 1)
    user_badges = db.query(Badge).filter(Badge.user_id == user.id).order_by(Badge.earned_at.desc()).all()
    total_badges = len(user_badges)
    badges_out: List[PublicBadgeItem] = []
    if show_badges:
        for b in user_badges:
            badges_out.append(
                PublicBadgeItem(
                    id=b.id,
                    name=b.name,
                    domain=b.domain,
                    description=b.description,
                    icon=b.icon or "Trophy",
                    earned_at=b.earned_at,
                )
            )

    # Certificates showcase if enabled
    show_certificates = bool(user.show_certificates if user.show_certificates is not None else 1)
    user_certs = db.query(Certificate).filter(Certificate.user_id == user.id).order_by(Certificate.issued_at.desc()).all()
    total_certificates = len(user_certs)
    certs_out: List[PublicCertItem] = []
    if show_certificates:
        for cert in user_certs:
            certs_out.append(
                PublicCertItem(
                    cert_uuid=cert.cert_uuid,
                    course_title=cert.course_title,
                    domain=cert.domain,
                    badge_name=cert.badge_name,
                    score_percentage=cert.score_percentage,
                    issued_at=cert.issued_at,
                    verification_url=f"/certificate/{cert.cert_uuid}",
                )
            )

    # Interests
    show_interests = bool(user.show_interests if user.show_interests is not None else 1)

    return PublicProfileResponse(
        is_public=True,
        username=user.username,
        display_name=display_name,
        bio=user.bio,
        avatar_url=user.avatar_url or "bot-1",
        profession=user.profession,
        member_since=user.created_at,
        show_interests=show_interests,
        learning_domain=user.learning_domain if show_interests else None,
        knowledge_level=user.knowledge_level if show_interests else None,
        learning_goal=user.learning_goal if show_interests else None,
        explanation_style=user.explanation_style if show_interests else None,
        show_courses=show_courses,
        courses=courses_out,
        show_badges=show_badges,
        badges=badges_out,
        show_certificates=show_certificates,
        certificates=certs_out,
        total_courses=total_courses,
        completed_courses=completed_courses,
        total_badges=total_badges,
        total_certificates=total_certificates,
    )
