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

@router.post("/add")
def add_to_fridge(payload: FridgeUpsertIn, user_id: str = Depends(get_user_id)):
    db = get_db()
    fr = db["fridges"].find_one({"user_id": ObjectId(user_id)})
    existing_items = fr.get("items", []) if fr else []
    
    # Merge items based on exact match of name
    for new_item in payload.items:
        found = False
        for ex in existing_items:
            if ex.get("name").lower() == new_item.name.lower():
                # Add amounts
                current_amt = float(ex.get("amount") or 0)
                add_amt = float(new_item.amount or 0)
                ex["amount"] = current_amt + add_amt
                found = True
                break
        if not found:
            dumped = new_item.model_dump()
            if not dumped.get("id"):
                import uuid
                dumped["id"] = str(uuid.uuid4())[:8]
            existing_items.append(dumped)
            
    db["fridges"].update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": {"items": existing_items,
                  "updated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z"}},
        upsert=True
    )
    return {"ok": True, "items": existing_items}