import re
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..deps import get_current_user
from ..models import (
    FridgeItemCreate,
    FridgeItemUpdate,
    FridgeItemResponse,
    FridgeConsumeRequest,
    FridgeConsumeResponse,
)


router = APIRouter(prefix="/fridge", tags=["fridge"])


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def _matches(ingredient: str, item_name: str) -> bool:
    ing = _normalize(ingredient)
    name = _normalize(item_name)
    return ing and name and (ing in name or name in ing)


@router.get("", response_model=list[FridgeItemResponse])
async def list_fridge(user=Depends(get_current_user)):
    db = get_db()
    cursor = db.fridge_items.find({"user_id": user["_id"]})
    items = []
    async for doc in cursor:
        items.append(
            FridgeItemResponse(
                id=str(doc["_id"]),
                name=doc.get("name"),
                count=int(doc.get("count", 1)),
                days_left=int(doc.get("days_left", 7)),
                category=doc.get("category"),
            )
        )
    return items


@router.post("", response_model=FridgeItemResponse)
async def create_fridge_item(payload: FridgeItemCreate, user=Depends(get_current_user)):
    db = get_db()
    name = payload.name.strip()
    name_key = _normalize(name)
    existing = await db.fridge_items.find_one({
        "user_id": user["_id"],
        "name_key": name_key,
        "days_left": payload.days_left,
        "category": payload.category or "Other",
    })
    if existing:
        new_count = int(existing.get("count", 1)) + payload.count
        updates = {
            "count": new_count,
            "days_left": payload.days_left,
            "category": payload.category or existing.get("category") or "Other",
            "updated_at": datetime.utcnow(),
        }
        await db.fridge_items.update_one(
            {"_id": existing["_id"], "user_id": user["_id"]},
            {"$set": updates},
        )
        existing.update(updates)
        return FridgeItemResponse(
            id=str(existing["_id"]),
            name=existing.get("name"),
            count=int(existing.get("count", 1)),
            days_left=int(existing.get("days_left", 7)),
            category=existing.get("category"),
        )

    doc = {
        "user_id": user["_id"],
        "name": name,
        "name_key": name_key,
        "count": payload.count,
        "days_left": payload.days_left,
        "category": payload.category or "Other",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.fridge_items.insert_one(doc)
    return FridgeItemResponse(
        id=str(result.inserted_id),
        name=doc["name"],
        count=doc["count"],
        days_left=doc["days_left"],
        category=doc.get("category"),
    )


@router.put("/{item_id}", response_model=FridgeItemResponse)
async def update_fridge_item(item_id: str, payload: FridgeItemUpdate, user=Depends(get_current_user)):
    db = get_db()
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if "name" in updates:
        updates["name"] = updates["name"].strip()
        updates["name_key"] = _normalize(updates["name"])
    if "category" in updates and not updates["category"]:
        updates["category"] = "Other"
    if updates:
        updates["updated_at"] = datetime.utcnow()
        await db.fridge_items.update_one(
            {"_id": ObjectId(item_id), "user_id": user["_id"]},
            {"$set": updates},
        )
    doc = await db.fridge_items.find_one({"_id": ObjectId(item_id), "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    return FridgeItemResponse(
        id=str(doc["_id"]),
        name=doc.get("name"),
        count=int(doc.get("count", 1)),
        days_left=int(doc.get("days_left", 7)),
        category=doc.get("category"),
    )


@router.delete("/{item_id}")
async def delete_fridge_item(item_id: str, user=Depends(get_current_user)):
    db = get_db()
    result = await db.fridge_items.delete_one({"_id": ObjectId(item_id), "user_id": user["_id"]})
    return {"deleted": result.deleted_count == 1}


@router.post("/consume", response_model=FridgeConsumeResponse)
async def consume_recipe(payload: FridgeConsumeRequest, user=Depends(get_current_user)):
    db = get_db()
    recipe = None
    try:
        recipe = await db.food_recipes.find_one({"_id": ObjectId(payload.recipe_id)})
    except Exception:
        recipe = await db.food_recipes.find_one({"_id": payload.recipe_id})

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    ingredients_raw = recipe.get("ingredients", "")
    ingredients = [i.strip() for i in ingredients_raw.split("|") if i.strip()]
    fridge_items = await db.fridge_items.find({"user_id": user["_id"]}).to_list(length=None)

    missing = []
    updated = 0
    removed = 0

    for ing in ingredients:
        matches = [item for item in fridge_items if _matches(ing, item.get("name", ""))]
        if not matches:
            missing.append(ing)
            continue
        # pick the item with the lowest days_left (closest expiry)
        match = sorted(matches, key=lambda i: int(i.get("days_left", 9999)))[0]
        current_count = int(match.get("count", 1))
        new_count = current_count - 1
        if new_count <= 0:
            await db.fridge_items.delete_one({"_id": match["_id"], "user_id": user["_id"]})
            removed += 1
            fridge_items = [item for item in fridge_items if item["_id"] != match["_id"]]
        else:
            await db.fridge_items.update_one(
                {"_id": match["_id"], "user_id": user["_id"]},
                {"$set": {"count": new_count, "updated_at": datetime.utcnow()}},
            )
            updated += 1
            match["count"] = new_count

    return FridgeConsumeResponse(removed=removed, updated=updated, missing=missing)
