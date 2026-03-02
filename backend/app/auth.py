import os
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import jwt

JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET is not set")

    expire_minutes = expires_minutes or int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))
    expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET is not set")
    return jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
