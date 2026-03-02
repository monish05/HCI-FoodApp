from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends

from ..db import get_db
from ..deps import get_current_user


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/me")
async def get_my_analytics(user=Depends(get_current_user)):
    db = get_db()
    doc = await db.analytics.find_one({"user_id": user["_id"]})
    if not doc:
        return {"analytics": {}}

    state = doc.get("state") or {}
    if not isinstance(state, dict):
        state = {}
    return {"analytics": state}


@router.put("/me")
async def save_my_analytics(payload: Dict[str, Any], user=Depends(get_current_user)):
    db = get_db()

    state = dict(payload or {})
    state.pop("_id", None)
    state.pop("user_id", None)
    state.pop("updated_at", None)

    await db.analytics.update_one(
        {"user_id": user["_id"]},
        {
            "$set": {
                "user_id": user["_id"],
                "state": state,
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )

    return {"analytics": state}
