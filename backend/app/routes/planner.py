from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query

from ..db import get_db
from ..deps import get_current_user


router = APIRouter(prefix="/planner", tags=["planner"])
_INDEX_READY = False


def _to_week_start(value: Optional[str]) -> datetime:
    if value:
        try:
            base = datetime.strptime(value, "%Y-%m-%d")
        except Exception:
            base = datetime.utcnow()
    else:
        base = datetime.utcnow()

    return base - timedelta(days=base.weekday())


async def _ensure_indexes(db) -> None:
    global _INDEX_READY
    if _INDEX_READY:
        return
    await db.meal_plans.create_index(
        [("user_id", 1), ("week_start", 1)],
        unique=True,
        name="uniq_user_week_plan",
    )
    _INDEX_READY = True


def _resolve_week_start(start: Optional[str], payload: Optional[Dict[str, Any]] = None) -> datetime:
    payload_start = None
    if isinstance(payload, dict):
        payload_start = payload.get("week_start")
    return _to_week_start(start or payload_start)


def _format_date(value: datetime) -> str:
    return value.strftime("%Y-%m-%d")


def _empty_week_plan(week_start: datetime) -> Dict[str, Any]:
    days: List[Dict[str, Any]] = []
    for index in range(7):
        day = week_start + timedelta(days=index)
        days.append(
            {
                "date": _format_date(day),
                "day": day.strftime("%a"),
                "meals": {
                    "breakfast": None,
                    "lunch": None,
                    "dinner": None,
                },
            }
        )

    return {
        "week_start": _format_date(week_start),
        "days": days,
    }


def _normalize_plan(payload: Dict[str, Any], week_start: datetime) -> Dict[str, Any]:
    base = _empty_week_plan(week_start)
    incoming_days = payload.get("days") if isinstance(payload, dict) else None
    if not isinstance(incoming_days, list):
        return base

    for index, entry in enumerate(incoming_days[:7]):
        if not isinstance(entry, dict):
            continue
        meals = entry.get("meals") if isinstance(entry.get("meals"), dict) else {}
        next_meals = {
            "breakfast": meals.get("breakfast"),
            "lunch": meals.get("lunch"),
            "dinner": meals.get("dinner"),
        }
        base["days"][index]["meals"] = next_meals

    return base


@router.get("/week")
async def get_week_plan(
    start: Optional[str] = Query(default=None, description="Week start date in YYYY-MM-DD"),
    user=Depends(get_current_user),
):
    db = get_db()
    await _ensure_indexes(db)
    week_start = _resolve_week_start(start)
    week_key = _format_date(week_start)

    doc = await db.meal_plans.find_one({"user_id": user["_id"], "week_start": week_key})
    if not doc:
        return {"plan": _empty_week_plan(week_start)}

    plan = doc.get("plan")
    if not isinstance(plan, dict):
        return {"plan": _empty_week_plan(week_start)}

    return {"plan": _normalize_plan(plan, week_start)}


@router.put("/week")
async def save_week_plan(
    payload: Dict[str, Any],
    start: Optional[str] = Query(default=None, description="Week start date in YYYY-MM-DD"),
    user=Depends(get_current_user),
):
    db = get_db()
    await _ensure_indexes(db)
    week_start = _resolve_week_start(start, payload)
    week_key = _format_date(week_start)

    normalized = _normalize_plan(payload or {}, week_start)

    await db.meal_plans.update_one(
        {"user_id": user["_id"], "week_start": week_key},
        {
            "$set": {
                "user_id": user["_id"],
                "week_start": week_key,
                "plan": normalized,
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )

    return {"plan": normalized}
