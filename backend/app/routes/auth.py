from fastapi import APIRouter, HTTPException
from pydantic import EmailStr

from ..auth import hash_password, verify_password, create_access_token
from ..db import get_db
from ..models import UserCreate, UserLogin, AuthResponse


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(payload: UserCreate):
    db = get_db()
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = email
    await db.users.insert_one(
        {
            "_id": user_id,
            "email": email,
            "password_hash": hash_password(payload.password),
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "phone": payload.phone,
            "address": payload.address,
        }
    )

    has_preferences = await db.preferences.find_one({"user_id": user_id}) is not None
    token = create_access_token(user_id)
    return AuthResponse(
        token=token,
        user_id=user_id,
        has_preferences=has_preferences,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=email,
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin):
    db = get_db()
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = user["_id"]
    has_preferences = await db.preferences.find_one({"user_id": user_id}) is not None
    token = create_access_token(user_id)
    return AuthResponse(
        token=token,
        user_id=user_id,
        has_preferences=has_preferences,
        first_name=user.get("first_name") or email.split("@")[0],
        last_name=user.get("last_name") or "",
        email=email,
    )


@router.get("/exists")
async def email_exists(email: EmailStr):
    db = get_db()
    email = email.lower()
    exists = await db.users.find_one({"email": email}) is not None
    return {"exists": exists}
