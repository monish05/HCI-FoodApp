"""
Unset image and image_url on all documents in food_recipes.
Loads MONGODB_URI from repo root .env. Run from repo root:
  python scripts/unset_all_recipe_images.py
"""
import os
import sys
from pathlib import Path

# ensure repo root on path and load .env from repo root
REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from dotenv import load_dotenv
import pymongo

load_dotenv(REPO_ROOT / ".env")
uri = os.getenv("MONGODB_URI")
if not uri:
    raise SystemExit("MONGODB_URI not set in .env")

# Atlas uses TLS; pymongo handles it when using mongodb+srv
client = pymongo.MongoClient(uri)
db = client.get_default_database()
result = db.food_recipes.update_many(
    {},
    {"$unset": {"image": "", "image_url": ""}},
)
print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
