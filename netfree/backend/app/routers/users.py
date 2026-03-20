from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db, User
from datetime import datetime, date

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    phone: str


class UserStatusResponse(BaseModel):
    user_id: str
    mb_left: float
    daily_limit: float
    ads_watched: int
    esim_active: bool


@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.email == req.email) | (User.phone == req.phone)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ou téléphone déjà utilisé")

    user = User(email=req.email, phone=req.phone)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"user_id": user.id, "message": "Compte créé avec succès"}


@router.get("/{user_id}/status", response_model=UserStatusResponse)
def get_status(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Réinitialisation journalière automatique
    if user.last_reset and user.last_reset.date() < date.today():
        user.mb_left = 0
        user.ads_watched = 0
        user.last_reset = datetime.utcnow()
        db.commit()

    return UserStatusResponse(
        user_id=user.id,
        mb_left=user.mb_left,
        daily_limit=user.daily_limit,
        ads_watched=user.ads_watched,
        esim_active=user.esim_active,
    )
