from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, User
from schemas import OnboardingRequest
from auth import get_current_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("")
def save_onboarding(
    req: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profession = req.profession
    if profession == "Other" and req.profession_other:
        profession = req.profession_other

    current_user.profession = profession
    current_user.knowledge_level = req.knowledge_level
    current_user.learning_domain = req.learning_domain
    current_user.learning_goal = req.learning_goal
    current_user.explanation_style = req.explanation_style
    current_user.onboarding_done = 1
    db.commit()
    return {"message": "Onboarding saved"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "profession": current_user.profession,
        "knowledge_level": current_user.knowledge_level,
        "learning_domain": current_user.learning_domain,
        "learning_goal": current_user.learning_goal,
        "explanation_style": current_user.explanation_style,
        "onboarding_done": bool(current_user.onboarding_done),
        "is_admin": bool(current_user.is_admin),
    }