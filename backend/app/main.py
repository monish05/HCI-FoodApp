import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

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


dist_dir = Path(__file__).resolve().parent.parent / "dist"
if dist_dir.exists():

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        requested = dist_dir / full_path
        if requested.is_file():
            return FileResponse(requested)
        return FileResponse(dist_dir / "index.html")
