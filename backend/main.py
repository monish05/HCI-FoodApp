import os
import sys

import uvicorn
from dotenv import load_dotenv


def _ensure_backend_on_path():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)


if __name__ == "__main__":
    _ensure_backend_on_path()
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
