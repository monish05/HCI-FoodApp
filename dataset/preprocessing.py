import argparse
import json
import random
import re
import time
from urllib.parse import unquote, urlparse, parse_qs

import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm


def parse_minutes(s: str | None) -> int | None:
    """
    Convert strings like:
      "15 M", "1 H", "1 H 20 M", "45 mins", "2 hours"
    into total minutes (int).
    Returns None if cannot parse.
    """
    if s is None:
        return None
    s = str(s).strip()
    if not s or s.lower() in {"nan", "none"}:
        return None

    txt = s.lower()
    # Normalize separators
    txt = txt.replace("hrs", "h").replace("hr", "h").replace("hours", "h").replace("hour", "h")
    txt = txt.replace("mins", "m").replace("min", "m").replace("minutes", "m").replace("minute", "m")
    txt = txt.replace(" ", "")

    # Examples: 1h20m, 15m, 1h
    h = 0
    m = 0
    mh = re.search(r"(\d+)\s*h", txt)
    mm = re.search(r"(\d+)\s*m", txt)
    if mh:
        h = int(mh.group(1))
    if mm:
        m = int(mm.group(1))

    if mh or mm:
        return h * 60 + m

    # If just digits
    if txt.isdigit():
        return int(txt)

    return None


def split_pipe_list(s: str | None) -> list[str]:
    if s is None:
        return []
    s = str(s)
    if not s or s.lower() in {"nan", "none"}:
        return []
    parts = [p.strip() for p in s.split("|")]
    return [p for p in parts if p]


def normalize_tags(row: dict) -> list[str]:
    """
    Build tags from:
      tags (pipe list) + diet + cuisine + course + category
    """
    tags = set(split_pipe_list(row.get("tags")))
    for k in ["diet", "cuisine", "course", "category"]:
        v = row.get(k)
        if v and str(v).strip() and str(v).lower() not in {"nan", "none"}:
            tags.add(str(v).strip())
    # Keep stable order
    return sorted(tags)


def extract_image_from_next_image_url(url: str) -> str | None:
    """
    If url is like:
      https://www.archanaskitchen.com/_next/image?q=90&url=https%3A%2F%2Fstorage.googleapis.com%2F...jpg&w=1920
    extract the real image URL from 'url' query param.
    """
    try:
        parsed = urlparse(url)
        qs = parse_qs(parsed.query)
        if "url" in qs and qs["url"]:
            return unquote(qs["url"][0])
    except Exception:
        pass
    return None


def find_image_in_html(html: str) -> str | None:
    """
    Try multiple strategies to get a usable image URL.
    """
    soup = BeautifulSoup(html, "html.parser")

    # 1) og:image / twitter:image
    for prop in [("meta", {"property": "og:image"}), ("meta", {"name": "twitter:image"})]:
        tag = soup.find(*prop)
        if tag and tag.get("content"):
            img = tag["content"].strip()
            # If it's a Next.js image proxy, extract real target
            real = extract_image_from_next_image_url(img)
            return real or img

    # 2) Look for Next.js image URLs anywhere in HTML
    m = re.search(r"https?://[^\"'\s]+/_next/image\?[^\"'\s]+", html)
    if m:
        candidate = m.group(0)
        real = extract_image_from_next_image_url(candidate)
        return real or candidate

    # 3) Look for GCS images (common for ArchanasKitchen)
    m2 = re.search(r"https?://storage\.googleapis\.com/[^\"'\s]+?\.(jpg|jpeg|png|webp)", html, flags=re.I)
    if m2:
        return m2.group(0)

    # 4) Fallback: first reasonable <img src=...>
    imgs = soup.find_all("img")
    for img in imgs:
        src = img.get("src") or img.get("data-src")
        if not src:
            continue
        src = src.strip()
        if src.startswith("data:"):
            continue
        # Prefer large-ish images
        if any(x in src.lower() for x in ["logo", "icon", "sprite"]):
            continue
        real = extract_image_from_next_image_url(src)
        return real or src

    return None


def fetch_image_url(page_url: str, session: requests.Session, timeout: int = 15) -> str | None:
    """
    Fetch HTML and extract a likely recipe image.
    """
    if not page_url or str(page_url).lower() in {"nan", "none"}:
        return None

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    try:
        r = session.get(page_url, headers=headers, timeout=timeout)
        if r.status_code != 200:
            return None
        html = r.text
        return find_image_in_html(html)
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True, help="Path to food_recipes.csv")
    ap.add_argument("--out", default="recipes_enriched.json", help="Output JSON file")
    ap.add_argument("--limit", type=int, default=0, help="Limit rows for testing (0 = all)")
    ap.add_argument("--sleep-min", type=float, default=0.3, help="Min sleep between requests")
    ap.add_argument("--sleep-max", type=float, default=0.9, help="Max sleep between requests")
    ap.add_argument("--timeout", type=int, default=15, help="HTTP timeout seconds")
    ap.add_argument("--no-scrape", action="store_true", help="Do not scrape images; keep image=None")
    args = ap.parse_args()

    df = pd.read_csv(args.csv)
    if args.limit and args.limit > 0:
        df = df.head(args.limit)

    recipes = []
    session = requests.Session()

    for idx, row in tqdm(df.iterrows(), total=len(df)):
        r = row.to_dict()

        title = str(r.get("recipe_title") or "").strip()
        page_url = str(r.get("url") or "").strip()

        ingredients = split_pipe_list(r.get("ingredients"))
        instructions = split_pipe_list(r.get("instructions"))

        cook_time = parse_minutes(r.get("cook_time"))
        prep_time = parse_minutes(r.get("prep_time"))
        total_time = None
        if cook_time is not None or prep_time is not None:
            total_time = (cook_time or 0) + (prep_time or 0)

        tags = normalize_tags(r)

        image = None
        if not args.no_scrape:
            image = fetch_image_url(page_url, session=session, timeout=args.timeout)
            # polite rate limit
            time.sleep(random.uniform(args.sleep_min, args.sleep_max))

        doc = {
            "id": str(idx),  # or use a stable hash if you prefer
            "title": title,
            "image": image,  # may be None if scrape failed
            "ingredients": ingredients,
            "instructions": instructions,
            "cookTime": cook_time,     # keep cookTime for your filters
            "prepTime": prep_time,
            "totalTime": total_time,   # optional but handy later
            "tags": tags,
            "sourceUrl": page_url,
            "rating": r.get("rating"),
            "voteCount": r.get("vote_count"),
        }

        recipes.append(doc)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)

    print(f"✅ Wrote {len(recipes)} recipes to {args.out}")


if __name__ == "__main__":
    main()