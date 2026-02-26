import os
from fastapi import Header, HTTPException
from auth_utils import decode_token

def get_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token, os.environ["JWT_SECRET"])
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]