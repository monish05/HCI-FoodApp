from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    phone: str = Field(min_length=3)
    address: str = Field(min_length=3)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    has_preferences: bool
    first_name: str
    last_name: str
    email: EmailStr


class UserProfileResponse(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None


class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class PreferenceUpdate(BaseModel):
    diets: List[str] = []
    cuisines: List[str] = []
    allergies: List[str] = []
    goals: List[str] = []
    avoid_ingredients: List[str] = []
    max_cook_time: Optional[int] = None


class PreferenceResponse(PreferenceUpdate):
    user_id: str


class FridgeItemCreate(BaseModel):
    name: str = Field(min_length=1)
    count: int = Field(default=1, ge=1)
    days_left: int = Field(default=7, ge=0)
    category: Optional[str] = None


class FridgeItemUpdate(BaseModel):
    name: Optional[str] = None
    count: Optional[int] = Field(default=None, ge=0)
    days_left: Optional[int] = Field(default=None, ge=0)
    category: Optional[str] = None


class FridgeItemResponse(BaseModel):
    id: str
    name: str
    count: int
    days_left: int
    category: Optional[str] = None


class FridgeConsumeRequest(BaseModel):
    recipe_id: str


class FridgeConsumeResponse(BaseModel):
    removed: int
    updated: int
    missing: List[str] = []
