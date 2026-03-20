from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db, User, AdView

router = APIRouter()

MB_PER_AD = 50.0


class AdWatchedRequest(BaseModel):
    user_id: str
    mb_granted: float = MB_PER_AD


@router.post("/watched")
def ad_watched(req: AdWatchedRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if user.mb_left >= user.daily_limit:
        raise HTTPException(status_code=400, detail="Limite journalière atteinte")

    # Créditer les Mo
    user.mb_left = min(user.mb_left + req.mb_granted, user.daily_limit)
    user.ads_watched += 1

    # Enregistrer la vue
    view = AdView(user_id=req.user_id, mb_granted=req.mb_granted)
    db.add(view)
    db.commit()

    return {
        "success": True,
        "mb_granted": req.mb_granted,
        "mb_left": user.mb_left,
        "ads_watched": user.ads_watched,
    }


@router.get("/history/{user_id}")
def ad_history(user_id: str, db: Session = Depends(get_db)):
    views = db.query(AdView).filter(AdView.user_id == user_id).all()
    return [{"mb_granted": v.mb_granted, "viewed_at": v.viewed_at} for v in views]
