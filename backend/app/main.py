import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import find_dotenv, load_dotenv

from .routes.auth import router as auth_router
from .routes.fridge import router as fridge_router
from .routes.preferences import router as preferences_router
from .routes.recipes import router as recipes_router
from .routes.users import router as users_router


load_dotenv(find_dotenv())


app = FastAPI(title="HCI FoodApp API")

def _allowed_origins() -> list[str]:
    raw = os.getenv("WEB_ORIGIN", "http://localhost:5173")
    origins = [item.strip() for item in raw.split(",") if item.strip()]
    if "http://localhost:5173" not in origins:
        origins.append("http://localhost:5173")
    if "http://127.0.0.1:5173" not in origins:
        origins.append("http://127.0.0.1:5173")
    return origins


origins = _allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(fridge_router)
app.include_router(preferences_router)
app.include_router(recipes_router)
app.include_router(users_router)


@app.get("/health")
async def health():
    return {"ok": True}
