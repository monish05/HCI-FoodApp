import hashlib
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional

import bcrypt
from jose import jwt, JWTError

def _pw_bytes(pw: str) -> bytes:
    """
    bcrypt has a 72-byte limit.
    If pw is longer, hash it with sha256 first to a fixed 32 bytes.
    """
    b = pw.encode("utf-8")
    if len(b) > 72:
        return hashlib.sha256(b).digest()
    return b

def hash_password(pw: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(_pw_bytes(pw), salt)
    return hashed.decode("utf-8")

def verify_password(pw: str, pw_hash: str) -> bool:
    try:
        return bcrypt.checkpw(_pw_bytes(pw), pw_hash.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], secret: str, minutes: int) -> str:
    payload = dict(data)
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    return jwt.encode(payload, secret, algorithm="HS256")

def decode_token(token: str, secret: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except JWTError:
        return None