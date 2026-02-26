from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from db import get_db
from deps import get_user_id
from models import UserPrefsIn

router = APIRouter(prefix="/api/user", tags=["user"])

@router.get("/me")
def me(user_id: str = Depends(get_user_id)):
    db = get_db()
    u = db["users"].find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u["id"] = str(u["_id"])
    u.pop("_id", None)
    return u


@router.get("/prefs")
def get_prefs(user_id: str = Depends(get_user_id)):
    db = get_db()
    u = db["users"].find_one({"_id": ObjectId(user_id)}, {"prefs": 1})
    return {"prefs": (u or {}).get("prefs", {})}

@router.post("/prefs")
def set_prefs(payload: UserPrefsIn, user_id: str = Depends(get_user_id)):
    db = get_db()
    db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"prefs": payload.model_dump()}},
        upsert=False
    )
    return {"ok": True}