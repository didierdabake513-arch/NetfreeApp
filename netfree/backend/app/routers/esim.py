from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx
import os
from app.database import get_db, User

router = APIRouter()

# Clé API Gigs — à mettre dans un fichier .env en production
GIGS_API_KEY = os.getenv("GIGS_API_KEY", "ta_cle_gigs_ici")
GIGS_BASE_URL = "https://api.gigs.com/v1"


class ActivateRequest(BaseModel):
    user_id: str


@router.post("/activate")
async def activate_esim(req: ActivateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.esim_active:
        return {"message": "eSIM déjà active", "iccid": user.esim_iccid}

    # Appel à l'API Gigs pour créer un profil eSIM
    # Documentation : https://developers.gigs.com
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GIGS_BASE_URL}/sims",
            headers={
                "Authorization": f"Bearer {GIGS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "type": "eSIM",
                "plan": "free_300mb_daily",  # Nom du plan configuré dans Gigs
                "user": {
                    "email": user.email,
                    "phone": user.phone,
                },
            },
        )

    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"Erreur Gigs API: {response.text}")

    data = response.json()
    iccid = data.get("iccid", "SIM_TEST_123")
    qr_code = data.get("activationCode", "")

    # Sauvegarder dans la base
    user.esim_active = True
    user.esim_iccid = iccid
    db.commit()

    return {
        "success": True,
        "iccid": iccid,
        "qr_code": qr_code,  # À afficher à l'utilisateur pour scanner
        "message": "eSIM activée avec succès",
    }


@router.get("/status/{user_id}")
def esim_status(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return {"esim_active": user.esim_active, "iccid": user.esim_iccid}
