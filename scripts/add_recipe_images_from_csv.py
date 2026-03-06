"""
Load data/items_with_images.csv and set image + image_url on food_recipes
where recipe_title matches item_name (after strip). Run from repo root:
  python scripts/add_recipe_images_from_csv.py
  python scripts/add_recipe_images_from_csv.py --dry-run
"""
import csv
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from dotenv import load_dotenv
import pymongo

load_dotenv(REPO_ROOT / ".env")
uri = os.getenv("MONGODB_URI")
if not uri:
    raise SystemExit("MONGODB_URI not set in .env")

CSV_PATH = REPO_ROOT / "data" / "items_with_images.csv"
BATCH_SIZE = 1000


def load_csv_map():
    """item_name (strip) -> item_image_url (strip)."""
    title_to_url = {}
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            name = (row.get("item_name") or "").strip()
            url = (row.get("item_image_url") or "").strip()
            if name and url:
                title_to_url[name] = url
    return title_to_url


def main():
    dry_run = "--dry-run" in sys.argv
    title_to_url = load_csv_map()
    print(f"Loaded {len(title_to_url)} item_name -> image_url from CSV")

    client = pymongo.MongoClient(uri)
    db = client.get_default_database()
    coll = db.food_recipes

    ops = []
    sample_titles = []
    for doc in coll.find({}):
        title = (doc.get("recipe_title") or "").strip()
        if title in title_to_url:
            url = title_to_url[title]
            ops.append(
                pymongo.UpdateOne(
                    {"_id": doc["_id"]},
                    {"$set": {"image": url, "image_url": url}},
                )
            )
            if len(sample_titles) < 5:
                sample_titles.append(title)

    if dry_run:
        print(f"Dry run: would update {len(ops)} recipes")
        for t in sample_titles:
            print(f"  {t!r}")
        return

    total_updated = 0
    for i in range(0, len(ops), BATCH_SIZE):
        batch = ops[i : i + BATCH_SIZE]
        result = coll.bulk_write(batch, ordered=False)
        total_updated += result.modified_count

    print(f"Updated {total_updated} recipes with images.")


if __name__ == "__main__":
    main()
