import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.auth import router as auth_router
from .routes.fridge import router as fridge_router
from .routes.preferences import router as preferences_router
from .routes.recipes import router as recipes_router
from .routes.users import router as users_router


app = FastAPI(title="HCI FoodApp API")

origins = [
    os.getenv("WEB_ORIGIN", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
