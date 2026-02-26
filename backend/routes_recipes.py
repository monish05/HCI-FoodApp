import re
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends

from db import get_db
from deps import get_user_id

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


# -------------------------
# Helpers
# -------------------------

def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())


# MVP 过敏关键词表（你之后可以扩展/迁移到配置文件）
ALLERGEN_KEYWORDS: Dict[str, List[str]] = {
    "peanut": ["peanut", "groundnut"],
    "tree nuts": ["almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", "macadamia", "brazil nut", "pine nut"],
    "milk": ["milk", "cheese", "butter", "cream", "yogurt", "whey", "casein"],
    "egg": ["egg", "eggs", "mayonnaise", "mayo"],
    "wheat": ["wheat", "flour", "bread", "pasta", "noodle", "gluten"],
    "soy": ["soy", "soya", "tofu", "edamame", "soy sauce"],
    "fish": ["fish", "salmon", "tuna", "cod", "tilapia", "anchovy"],
    "shellfish": ["shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"],
    "sesame": ["sesame", "tahini"],
}

# dietary -> tags mapping（按你的 tags 体系调整）
DIETARY_TAGS: Dict[str, List[str]] = {
    "Vegetarian": ["Vegetarian", "Meatless"],
    "Vegan": ["Vegan"],
    "Gluten-Free": ["Gluten-Free"],
    "Dairy-Free": ["Dairy-Free"],
    "Halal": ["Halal"],
    "Kosher": ["Kosher"],
}


def recipe_time(recipe: Dict[str, Any]) -> int:
    """Prefer totalTime, fallback cookTime. Return large number if missing."""
    t = recipe.get("totalTime")
    if isinstance(t, (int, float)):
        return int(t)
    t = recipe.get("cookTime")
    if isinstance(t, (int, float)):
        return int(t)
    return 10**9


def recipe_ingredient_text(recipe: Dict[str, Any]) -> str:
    """Return a normalized ingredient text blob for keyword matching."""
    ings = recipe.get("ingredients")
    if isinstance(ings, list):
        return " | ".join([str(x) for x in ings])
    if isinstance(ings, str):
        return ings
    return ""


def violates_allergies(recipe: Dict[str, Any], allergies: List[str]) -> bool:
    """
    Hard block:
    - If user's allergy matches canonical (e.g., Peanut), use keyword list.
    - Else fallback to substring match of user's custom allergy term.
    """
    text = _norm(recipe_ingredient_text(recipe))
    if not text:
        return False

    for a in allergies:
        key = _norm(a)
        if not key:
            continue

        # Try canonical mapping first
        matched_canonical = False
        for canonical, kws in ALLERGEN_KEYWORDS.items():
            if _norm(canonical) == key:
                matched_canonical = True
                # match any keyword
                if any(_norm(kw) in text for kw in kws + [canonical]):
                    return True
                break

        # Custom allergy fallback (user typed)
        if not matched_canonical:
            if key in text:
                return True

    return False


def matches_dietary(recipe: Dict[str, Any], dietary: List[str]) -> bool:
    """AND semantics: all selected dietary constraints must be satisfied."""
    if not dietary:
        return True

    tags = recipe.get("tags") or []
    if not isinstance(tags, list):
        return True

    tags_norm = set(_norm(t) for t in tags)

    for d in dietary:
        allowed = DIETARY_TAGS.get(d, [d])
        if not any(_norm(x) in tags_norm for x in allowed):
            return False
    return True


# -------------------------
# Routes
# -------------------------

@router.get("")
def list_recipes(
    q: Optional[str] = None,
    tag: Optional[str] = None,
    maxTime: Optional[int] = None,
    limit: int = 200,
    user_id: str = Depends(get_user_id),
):
    db = get_db()
    col = db["recipes"]

    # Base DB query
    query: Dict[str, Any] = {}
    if q:
        query["title"] = {"$regex": q, "$options": "i"}
    if tag:
        query["tags"] = tag

    # If you explicitly pass maxTime, we try to use totalTime if present; fallback cookTime.
    # Since Mongo query can't easily do fallback, we do maxTime in python (safe).
    docs = list(col.find(query, {"_id": 0}).limit(limit))

    # Load user prefs
    u = db["users"].find_one({"_id": ObjectId(user_id)}, {"prefs": 1})
    prefs = (u or {}).get("prefs", {}) or {}
    dietary = prefs.get("dietary") or []
    allergies = prefs.get("allergies") or []
    time_pref = prefs.get("time_preference") or "any"

    # Default time cap based on profile (only if caller didn't specify maxTime)
    time_cap = None
    if maxTime is None:
        if time_pref == "quick":
            time_cap = 20
        elif time_pref == "under30":
            time_cap = 30
    else:
        time_cap = maxTime

    out: List[Dict[str, Any]] = []
    for r in docs:
        # 1) Allergy hard block
        if allergies and violates_allergies(r, allergies):
            continue

        # 2) Dietary constraints
        if dietary and not matches_dietary(r, dietary):
            continue

        # 3) Time cap (explicit maxTime OR profile default)
        if time_cap is not None and recipe_time(r) > int(time_cap):
            continue

        out.append(r)

    return {"recipes": out}