from fastapi import APIRouter, Depends
from bson import ObjectId
from db import get_db
from deps import get_user_id
from models import FridgeUpsertIn

router = APIRouter(prefix="/api/fridge", tags=["fridge"])

@router.get("/me")
def get_my_fridge(user_id: str = Depends(get_user_id)):
    db = get_db()
    fr = db["fridges"].find_one({"user_id": ObjectId(user_id)}, {"_id": 0})
    if not fr:
        return {"items": []}
    # ✅ 只返回 items，避免 ObjectId 序列化问题
    return {"items": fr.get("items", [])}

@router.post("/me")
def upsert_my_fridge(payload: FridgeUpsertIn, user_id: str = Depends(get_user_id)):
    db = get_db()
    db["fridges"].update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": {"items": [i.model_dump() for i in payload.items],
                  "updated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z"}},
        upsert=True
    )
    return {"ok": True}