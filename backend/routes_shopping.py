from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from db import get_db
from deps import get_user_id
from models import ShoppingUpsertIn, ShoppingItem

router = APIRouter(prefix="/api", tags=["shopping", "ingredients"])

@router.get("/ingredients")
def get_all_ingredients():
    db = get_db()
    # Fetch distinct ingredients from the recipes collection
    ingredients = db["recipes"].distinct("ingredients")
    # Filter out empty or non-string values and sort
    valid_ingredients = sorted([str(i).strip() for i in ingredients if i and str(i).strip()])
    return {"ingredients": list(set(valid_ingredients))}

@router.get("/shopping/me")
def get_my_shopping_list(user_id: str = Depends(get_user_id)):
    db = get_db()
    sl = db["shopping_lists"].find_one({"user_id": ObjectId(user_id)}, {"_id": 0})
    if not sl:
        return {"items": []}
    return {"items": sl.get("items", [])}

@router.post("/shopping/me")
def upsert_my_shopping_list(payload: ShoppingUpsertIn, user_id: str = Depends(get_user_id)):
    db = get_db()
    db["shopping_lists"].update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": {"items": [i.model_dump() for i in payload.items],
                  "updated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z"}},
        upsert=True
    )
    return {"ok": True}
