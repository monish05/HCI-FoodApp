from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..db import get_db
from ..models import UserProfileResponse, UserProfileUpdate


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_me(user=Depends(get_current_user)):
    return UserProfileResponse(
        first_name=user.get("first_name") or user["email"].split("@")[0],
        last_name=user.get("last_name") or "",
        email=user["email"],
        phone=user.get("phone"),
        address=user.get("address"),
    )


@router.put("/me", response_model=UserProfileResponse)
async def update_me(payload: UserProfileUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if updates:
        db = get_db()
        await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
        user.update(updates)

    return UserProfileResponse(
        first_name=user.get("first_name") or user["email"].split("@")[0],
        last_name=user.get("last_name") or "",
        email=user["email"],
        phone=user.get("phone"),
        address=user.get("address"),
    )
