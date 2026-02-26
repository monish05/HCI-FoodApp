import os
from fastapi import APIRouter, HTTPException
from db import get_db
from models import RegisterIn, LoginIn, AuthOut
from auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=AuthOut)
def register(payload: RegisterIn):
    db = get_db()
    users = db["users"]
    email = payload.email.lower()

    if users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    res = users.insert_one({
        "email": email,
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "created_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "role": "user",
    })

    token = create_access_token(
        {"sub": str(res.inserted_id)},
        os.environ["JWT_SECRET"],
        int(os.environ.get("JWT_EXPIRE_MINUTES", "10080"))
    )
    return {"access_token": token}

@router.post("/login", response_model=AuthOut)
def login(payload: LoginIn):
    db = get_db()
    users = db["users"]
    email = payload.email.lower()

    user = users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        {"sub": str(user["_id"])},
        os.environ["JWT_SECRET"],
        int(os.environ.get("JWT_EXPIRE_MINUTES", "10080"))
    )
    return {"access_token": token}