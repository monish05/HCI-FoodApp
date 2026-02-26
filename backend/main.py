import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(dotenv_path=".env")

from routes_auth import router as auth_router
from routes_user import router as user_router
from routes_fridge import router as fridge_router
from routes_recipes import router as recipes_router

app = FastAPI()

origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(fridge_router)
app.include_router(recipes_router)

@app.get("/api/health")
def health():
    return {"ok": True}