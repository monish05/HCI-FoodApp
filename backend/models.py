from pydantic import BaseModel, EmailStr
from typing import Optional, List
from typing import List, Optional
from pydantic import BaseModel

class UserPrefsIn(BaseModel):
    dietary: List[str] = []
    allergies: List[str] = []
    time_preference: Optional[str] = None  # quick | under30 | any
    cuisines: List[str] = []
    spice_level: Optional[str] = None      # mild | medium | hot

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class FridgeItem(BaseModel):
    id: Optional[str] = None
    name: str
    amount: Optional[float] = None  # keep same as your frontend
    unit: Optional[str] = None
    daysLeft: Optional[int] = None

class FridgeUpsertIn(BaseModel):
    items: List[FridgeItem] = []