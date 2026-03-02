from datetime import datetime

from fastapi import APIRouter, Depends

from ..db import get_db
from ..deps import get_current_user
from ..models import PreferenceUpdate, PreferenceResponse


router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("/me", response_model=PreferenceResponse)
async def get_my_preferences(user=Depends(get_current_user)):
    db = get_db()
    doc = await db.preferences.find_one({"user_id": user["_id"]})
    if not doc:
        return PreferenceResponse(user_id=user["_id"])
    doc.pop("_id", None)
    return PreferenceResponse(**doc)


@router.post("", response_model=PreferenceResponse)
async def create_preferences(payload: PreferenceUpdate, user=Depends(get_current_user)):
    db = get_db()
    doc = {
        "user_id": user["_id"],
        **payload.dict(),
        "updated_at": datetime.utcnow(),
    }
    await db.preferences.update_one(
        {"user_id": user["_id"]},
        {"$set": doc},
        upsert=True,
    )
    return PreferenceResponse(**doc)


@router.put("", response_model=PreferenceResponse)
async def update_preferences(payload: PreferenceUpdate, user=Depends(get_current_user)):
    db = get_db()
    doc = {
        "user_id": user["_id"],
        **payload.dict(),
        "updated_at": datetime.utcnow(),
    }
    await db.preferences.update_one(
        {"user_id": user["_id"]},
        {"$set": doc},
        upsert=True,
    )
    return PreferenceResponse(**doc)
