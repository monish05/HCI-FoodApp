import re
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field

from ..db import get_db
from ..deps import get_current_user


router = APIRouter(prefix="/recipes", tags=["recipes"])


class RecipeCreate(BaseModel):
    title: str = Field(..., min_length=1)
    course: Optional[str] = None
    diet: Optional[str] = None
    cuisine: Optional[str] = None
    prep_time: Optional[int] = Field(default=None, ge=0)
    cook_time: Optional[int] = Field(default=None, ge=0)
    total_time: Optional[int] = Field(default=None, ge=0)
    image: Optional[str] = None
    url: Optional[str] = None
    ingredients: List[str] = Field(default_factory=list)
    steps: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


def _split_pipe(value: str) -> List[str]:
    if not value:
        return []
    return [part.strip() for part in value.split("|") if part.strip()]


def _clean_piece(value: str) -> str:
    text = (value or "").strip()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"^[-•*]+\s*", "", text)
    text = re.sub(r"^(?:step\s*)?\d+\s*[\).:-]\s*", "", text, flags=re.IGNORECASE)
    return text.strip(" -|\t\n\r")


def _is_valid_instruction_piece(value: str) -> bool:
    if not value:
        return False

    lowered = value.strip().lower()
    if lowered in {"and", "or", ".", ",", ";", ":", "-"}:
        return False

    if re.fullmatch(r"[\W_]+", lowered):
        return False

    return True


def _split_ingredients(value: str) -> List[str]:
    if not value:
        return []
    raw = str(value).replace("\r", "\n")
    parts = re.split(r"\s*\|\s*|\n+|\s*;\s*", raw)
    cleaned = [_clean_piece(part) for part in parts]
    return [part for part in cleaned if part]


def _split_instructions(value: str) -> List[str]:
    if not value:
        return []

    raw = str(value).replace("\r", "\n")

    if "|" in raw:
        parts = re.split(r"\s*\|\s*", raw)
    else:
        numbered_parts = re.split(
            r"(?:^|\n|\s)(?:step\s*)?\d+\s*[\).:-]\s*",
            raw,
            flags=re.IGNORECASE,
        )
        numbered_clean = [
            _clean_piece(part)
            for part in numbered_parts
            if _is_valid_instruction_piece(_clean_piece(part))
        ]
        if len(numbered_clean) >= 2:
            return numbered_clean
        parts = re.split(r"\n+|\s*;\s*", raw)

    cleaned = [_clean_piece(part) for part in parts]
    return [part for part in cleaned if _is_valid_instruction_piece(part)]


def _parse_minutes(value: str) -> int:
    if not value:
        return 0
    match = re.search(r"(\d+)", value)
    return int(match.group(1)) if match else 0


def _parse_total_minutes(prep_value: str, cook_value: str) -> int:
    return _parse_minutes(prep_value) + _parse_minutes(cook_value)


def _parse_float(value) -> float:
    try:
        return float(value)
    except Exception:
        return 0.0


def _parse_int(value) -> int:
    try:
        return int(value)
    except Exception:
        return 0


def _normalize_text(value: str) -> str:
    return re.sub(r"[^a-z]+", " ", (value or "").lower()).strip()


def _normalize_search_query(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def _image_from_doc(doc: dict) -> Optional[str]:
    return (
        (doc.get("image_url") or "").strip()
        or (doc.get("image") or "").strip()
        or None
    )


def _ingredient_matches(ingredient: str, fridge_names: List[str]) -> bool:
    if not ingredient:
        return False
    ing_norm = _normalize_text(ingredient)
    if not ing_norm:
        return False
    for name in fridge_names:
        if not name:
            continue
        if name in ing_norm or ing_norm in name:
            return True
    return False


def _expiry_score(ingredients: List[str], fridge_index: List[tuple]) -> int:
    score = 0
    if not ingredients or not fridge_index:
        return score
    for ing in ingredients:
        ing_norm = _normalize_text(ing)
        if not ing_norm:
            continue
        for name_norm, days_left in fridge_index:
            if name_norm in ing_norm or ing_norm in name_norm:
                score += max(0, 7 - days_left)
                break
    return score


def _normalize_list(items: List[str]) -> List[str]:
    return [item.strip().lower() for item in items if item and item.strip()]


def _matches_any(value: str, options: List[str]) -> bool:
    if not value or not options:
        return False
    value_lc = value.strip().lower()
    return any(value_lc == opt for opt in options)


@router.get("")
async def list_recipes(
    limit: int = Query(50, ge=1, le=200),
    q: Optional[str] = None,
    course: Optional[str] = None,
    max_time: Optional[int] = None,
    sort: Optional[str] = None,
    ignore_prefs: bool = False,
    user=Depends(get_current_user),
):
    db = get_db()
    prefs = await db.preferences.find_one({"user_id": user["_id"]}) or {}
    fridge_items = await db.fridge_items.find({"user_id": user["_id"]}).to_list(length=None)
    fridge_names = [_normalize_text(item.get("name", "")) for item in fridge_items]
    fridge_index = [
        (_normalize_text(item.get("name", "")), int(item.get("days_left", 0) or 0))
        for item in fridge_items
        if _normalize_text(item.get("name", ""))
    ]

    cuisines = _normalize_list(prefs.get("cuisines", []))
    diets = _normalize_list(prefs.get("diets", []))
    avoid_ingredients = _normalize_list(prefs.get("avoid_ingredients", []))
    max_cook_time = prefs.get("max_cook_time")

    # ✅ privacy filter: show catalog + this user's custom recipes
    and_filters = []
    and_filters.append({
        "$or": [
            {"user_id": user["_id"]},          # user-created recipes (private)
            {"user_id": {"$exists": False}},   # catalog recipes (shared)
            {"user_id": None},                 # legacy safety
        ]
    })

    # search filter
    or_filters = []
    q_value = _normalize_search_query(q or "")
    is_search = bool(q_value)
    if is_search:
        or_filters.append({"recipe_title": {"$regex": q_value, "$options": "i"}})
        or_filters.append({"tags": {"$regex": q_value, "$options": "i"}})
        or_filters.append({"ingredients": {"$regex": q_value, "$options": "i"}})
        if or_filters:
            and_filters.append({"$or": or_filters})

    if course and course.strip():
        and_filters.append({"course": {"$regex": f"^{re.escape(course.strip())}$", "$options": "i"}})

    query = {"$and": and_filters} if and_filters else {}
    sort_key = (sort or "relevance").lower()

    cursor = db.food_recipes.find(query)
    if not is_search:
        candidate_limit = max(limit * 8, 400)
        cursor = cursor.limit(candidate_limit)

    results = []
    async for doc in cursor:
        ingredients = _split_ingredients(doc.get("ingredients", ""))
        ingredients_lc = [ing.lower() for ing in ingredients]
        cook_minutes = _parse_total_minutes(doc.get("prep_time", ""), doc.get("cook_time", ""))

        if max_time and cook_minutes and cook_minutes > max_time:
            continue

        if not is_search and not ignore_prefs:
            if avoid_ingredients and any(
                any(avoid in ing for ing in ingredients_lc) for avoid in avoid_ingredients
            ):
                continue
            if max_cook_time and cook_minutes and cook_minutes > max_cook_time:
                continue

            score = 0
            if _matches_any(doc.get("cuisine"), cuisines):
                score += 2
            if _matches_any(doc.get("diet"), diets):
                score += 2
        else:
            score = 0

        needs_can_make = sort_key in {"relevance", "expiring"}
        can_make = False
        if needs_can_make and ingredients:
            can_make = all(_ingredient_matches(ing, fridge_names) for ing in ingredients)

        needs_expiring = sort_key == "expiring"
        expiring_score = _expiry_score(ingredients, fridge_index) if needs_expiring else 0
        is_expiring_soon = expiring_score > 0

        results.append(
            {
                "id": str(doc.get("_id")),
                "title": doc.get("recipe_title"),
                "image": _image_from_doc(doc),
                "url": doc.get("url"),
                "cuisine": doc.get("cuisine"),
                "course": doc.get("course"),
                "diet": doc.get("diet"),
                "prep_time": doc.get("prep_time"),
                "cook_time": doc.get("cook_time"),
                "total_time": cook_minutes,
                "ingredients": ingredients,
                "instructions_raw": doc.get("instructions", ""),
                "tags_raw": doc.get("tags", ""),
                "rating": _parse_float(doc.get("rating")),
                "vote_count": _parse_int(doc.get("vote_count")),
                "cook_minutes": cook_minutes,
                "_score": score,
                "_can_make": can_make,
                "expiring_score": expiring_score,
                "is_expiring_soon": is_expiring_soon,
                # ✅ for frontend
                "source": doc.get("source") or ("user" if doc.get("user_id") else "catalog"),
            }
        )

    if sort_key == "cook_time":
        results.sort(key=lambda r: (r.get("cook_minutes", 0), -r.get("_score", 0)))
    elif sort_key == "rating":
        results.sort(key=lambda r: (r.get("rating", 0), r.get("_score", 0)), reverse=True)
    elif sort_key == "vote_count":
        results.sort(key=lambda r: (r.get("vote_count", 0), r.get("_score", 0)), reverse=True)
    elif sort_key == "expiring":
        results.sort(
            key=lambda r: (
                r.get("expiring_score", 0),
                1 if r.get("_can_make") else 0,
                r.get("_score", 0),
            ),
            reverse=True,
        )
    else:
        results.sort(
            key=lambda r: (
                1 if r.get("_can_make") else 0,
                r.get("_score", 0),
                -(r.get("cook_minutes", 0) or 0),
            ),
            reverse=True,
        )

    trimmed = results[:limit]
    for item in trimmed:
        item["instructions"] = _split_instructions(item.pop("instructions_raw", ""))
        item["tags"] = _split_pipe(item.pop("tags_raw", ""))
        if sort_key != "expiring":
            item["expiring_score"] = _expiry_score(item.get("ingredients", []), fridge_index)
            item["is_expiring_soon"] = item["expiring_score"] > 0
        item.pop("_score", None)
        item.pop("cook_minutes", None)
        item.pop("_can_make", None)
    return {"recipes": trimmed}


@router.post("")
async def create_recipe(payload: RecipeCreate, user=Depends(get_current_user)):
    db = get_db()

    title = (payload.title or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    if not payload.ingredients or len([x for x in payload.ingredients if (x or "").strip()]) == 0:
        raise HTTPException(status_code=400, detail="Ingredients are required")

    if not payload.steps or len([x for x in payload.steps if (x or "").strip()]) == 0:
        raise HTTPException(status_code=400, detail="Steps are required")

    prep = int(payload.prep_time or 0)
    cook = int(payload.cook_time or 0)
    total_minutes = int(payload.total_time or (prep + cook) or 0)

    ingredients_str = " | ".join([_clean_piece(x) for x in payload.ingredients if _clean_piece(x)])
    instructions_str = " | ".join([_clean_piece(x) for x in payload.steps if _clean_piece(x)])
    tags_str = " | ".join([_clean_piece(x) for x in (payload.tags or []) if _clean_piece(x)])

    doc = {
        "user_id": user["_id"],
        "source": "user",

        "recipe_title": title,
        "image": (payload.image or "").strip() or None,
        "image_url": None,
        "url": (payload.url or "").strip() or None,
        "cuisine": (payload.cuisine or "").strip() or None,
        "course": (payload.course or "").strip() or None,
        "diet": (payload.diet or "").strip() or None,

        "prep_time": f"{prep} min" if prep else "",
        "cook_time": f"{cook} min" if cook else "",
        "ingredients": ingredients_str,
        "instructions": instructions_str,
        "tags": tags_str,
        "rating": 0,
        "vote_count": 0,
        "total_time": total_minutes,
    }

    result = await db.food_recipes.insert_one(doc)
    created = await db.food_recipes.find_one({"_id": result.inserted_id})
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create recipe")

    cook_minutes = _parse_total_minutes(created.get("prep_time", ""), created.get("cook_time", ""))
    return {
        "recipe": {
            "id": str(created.get("_id")),
            "title": created.get("recipe_title"),
            "image": _image_from_doc(created),
            "url": created.get("url"),
            "cuisine": created.get("cuisine"),
            "course": created.get("course"),
            "diet": created.get("diet"),
            "prep_time": created.get("prep_time"),
            "cook_time": created.get("cook_time"),
            "total_time": cook_minutes,
            "ingredients": _split_ingredients(created.get("ingredients", "")),
            "instructions": _split_instructions(created.get("instructions", "")),
            "tags": _split_pipe(created.get("tags", "")),
            "rating": _parse_float(created.get("rating")),
            "vote_count": _parse_int(created.get("vote_count")),
            "source": "user",
        }
    }


@router.get("/filters")
async def list_filters():
    db = get_db()
    cuisines_cursor = db.food_recipes.aggregate([
        {"$match": {"cuisine": {"$exists": True, "$ne": None, "$type": "string"}}},
        {"$project": {"cuisine": {"$trim": {"input": "$cuisine"}}}},
        {"$match": {"cuisine": {"$ne": ""}}},
        {"$group": {"_id": "$cuisine", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 7},
    ])
    diets_cursor = db.food_recipes.aggregate([
        {"$match": {"diet": {"$exists": True, "$ne": None, "$type": "string"}}},
        {"$project": {"diet": {"$trim": {"input": "$diet"}}}},
        {"$match": {"diet": {"$ne": ""}}},
        {"$group": {"_id": "$diet", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 7},
    ])
    cuisines = [doc["_id"] async for doc in cuisines_cursor]
    diets = [doc["_id"] async for doc in diets_cursor]
    return {"cuisines": cuisines, "diets": diets}


@router.get("/ingredients")
async def list_ingredients(limit: int = Query(500, ge=1, le=2000), user=Depends(get_current_user)):
    db = get_db()
    pipeline = [
        {"$match": {"ingredients": {"$exists": True, "$ne": None, "$type": "string"}}},
        {"$project": {"ingredients": {"$split": ["$ingredients", "|"]}}},
        {"$unwind": "$ingredients"},
        {"$project": {"ingredient": {"$trim": {"input": "$ingredients"}}}},
        {"$match": {"ingredient": {"$ne": ""}}},
        {"$group": {"_id": "$ingredient"}},
        {"$sort": {"_id": 1}},
        {"$limit": limit},
    ]
    cursor = db.food_recipes.aggregate(pipeline)
    ingredients = [doc["_id"] async for doc in cursor]
    return {"ingredients": ingredients}


@router.get("/{recipe_id}/similar")
async def get_similar(recipe_id: str, user=Depends(get_current_user)):
    db = get_db()
    doc = None
    try:
        doc = await db.food_recipes.find_one({"_id": ObjectId(recipe_id)})
    except Exception:
        doc = await db.food_recipes.find_one({"_id": recipe_id})

    if not doc:
        return {"recipes": []}

    filters = []
    if doc.get("cuisine"):
        filters.append({"cuisine": {"$regex": f"^{re.escape(doc.get('cuisine'))}$", "$options": "i"}})
    if doc.get("diet"):
        filters.append({"diet": {"$regex": f"^{re.escape(doc.get('diet'))}$", "$options": "i"}})
    if doc.get("course"):
        filters.append({"course": {"$regex": f"^{re.escape(doc.get('course'))}$", "$options": "i"}})

    query = {"_id": {"$ne": doc.get("_id")}}
    if filters:
        query["$or"] = filters

    cursor = db.food_recipes.find(query).limit(8)
    results = []
    async for item in cursor:
        total_time = _parse_total_minutes(item.get("prep_time", ""), item.get("cook_time", ""))
        results.append(
            {
                "id": str(item.get("_id")),
                "title": item.get("recipe_title"),
                "image": _image_from_doc(item),
                "url": item.get("url"),
                "cuisine": item.get("cuisine"),
                "course": item.get("course"),
                "diet": item.get("diet"),
                "prep_time": item.get("prep_time"),
                "cook_time": item.get("cook_time"),
                "total_time": total_time,
                "ingredients": _split_ingredients(item.get("ingredients", "")),
                "instructions": _split_instructions(item.get("instructions", "")),
                "tags": _split_pipe(item.get("tags", "")),
                "rating": _parse_float(item.get("rating")),
                "vote_count": _parse_int(item.get("vote_count")),
                "source": item.get("source") or ("user" if item.get("user_id") else "catalog"),
            }
        )

    return {"recipes": results}


@router.get("/{recipe_id}")
async def get_recipe(recipe_id: str, user=Depends(get_current_user)):
    db = get_db()
    doc = None
    try:
        doc = await db.food_recipes.find_one({"_id": ObjectId(recipe_id)})
    except Exception:
        doc = await db.food_recipes.find_one({"_id": recipe_id})

    if not doc:
        return {"recipe": None}

    ingredients = _split_ingredients(doc.get("ingredients", ""))
    return {
        "recipe": {
            "id": str(doc.get("_id")),
            "title": doc.get("recipe_title"),
            "image": _image_from_doc(doc),
            "url": doc.get("url"),
            "cuisine": doc.get("cuisine"),
            "course": doc.get("course"),
            "diet": doc.get("diet"),
            "prep_time": doc.get("prep_time"),
            "cook_time": doc.get("cook_time"),
            "ingredients": ingredients,
            "instructions": _split_instructions(doc.get("instructions", "")),
            "tags": _split_pipe(doc.get("tags", "")),
            "rating": _parse_float(doc.get("rating")),
            "vote_count": _parse_int(doc.get("vote_count")),
            "source": doc.get("source") or ("user" if doc.get("user_id") else "catalog"),
        }
    }


@router.delete("/{recipe_id}")
async def delete_recipe(recipe_id: str, user=Depends(get_current_user)):
    db = get_db()

    base_query = {"user_id": user["_id"], "source": "user"}

    try:
        query = {**base_query, "_id": ObjectId(recipe_id)}
    except Exception:
        query = {**base_query, "_id": recipe_id}

    result = await db.food_recipes.delete_one(query)

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found (or not owned by user)")

    return {"ok": True}