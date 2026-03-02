#!/usr/bin/env python3

import argparse
import csv
import html
import json
import re
import time
from pathlib import Path
from typing import List, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen


USER_AGENT = (
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
	"AppleWebKit/537.36 (KHTML, like Gecko) "
	"Chrome/122.0.0.0 Safari/537.36"
)


def count_rows(csv_path: Path) -> int:
	with open(csv_path, "r", encoding="utf-8", newline="") as handle:
		reader = csv.DictReader(handle)
		return sum(1 for _ in reader)


def render_progress(
	processed: int,
	total: int,
	success: int,
	failed: int,
	bar_width: int = 32,
) -> None:
	if total <= 0:
		total = 1
	ratio = min(1.0, max(0.0, processed / total))
	filled = int(ratio * bar_width)
	bar = "█" * filled + "-" * (bar_width - filled)
	percent = ratio * 100
	line = (
		f"\r[{bar}] {processed}/{total} ({percent:6.2f}%) "
		f"found={success} missing={failed}"
	)
	print(line, end="", flush=True)


def html_unescape(value: str) -> str:
	return html.unescape(value or "")


def fetch_page(url: str, timeout: float, retries: int) -> Optional[str]:
	for attempt in range(1, retries + 1):
		try:
			request = Request(url, headers={"User-Agent": USER_AGENT})
			with urlopen(request, timeout=timeout) as response:
				content_type = (response.headers.get("Content-Type") or "").lower()
				charset = "utf-8"
				if "charset=" in content_type:
					charset = content_type.split("charset=")[-1].split(";")[0].strip() or "utf-8"
				return response.read().decode(charset, errors="replace")
		except (HTTPError, URLError, TimeoutError, OSError):
			if attempt == retries:
				return None
			time.sleep(min(2 * attempt, 5))
	return None


def extract_from_srcset(srcset_value: str) -> List[str]:
	urls: List[str] = []
	for entry in srcset_value.split(","):
		piece = entry.strip()
		if not piece:
			continue
		url_part = piece.split()[0].strip()
		if url_part:
			urls.append(url_part)
	return urls


def parse_ld_json_block(block: str) -> Optional[object]:
	text = html_unescape(block).strip()
	if not text:
		return None
	try:
		return json.loads(text)
	except json.JSONDecodeError:
		return None


def extract_images_from_json(data: object, page_url: str) -> List[str]:
	urls: List[str] = []

	def walk(obj: object) -> None:
		if isinstance(obj, dict):
			for key, value in obj.items():
				key_l = str(key).lower()
				if key_l == "image":
					if isinstance(value, str):
						urls.append(urljoin(page_url, value))
					elif isinstance(value, list):
						for item in value:
							if isinstance(item, str):
								urls.append(urljoin(page_url, item))
							elif isinstance(item, dict):
								candidate = item.get("url") or item.get("contentUrl")
								if isinstance(candidate, str):
									urls.append(urljoin(page_url, candidate))
					elif isinstance(value, dict):
						candidate = value.get("url") or value.get("contentUrl")
						if isinstance(candidate, str):
							urls.append(urljoin(page_url, candidate))
				walk(value)
		elif isinstance(obj, list):
			for item in obj:
				walk(item)

	walk(data)
	return urls


def score_image_url(url: str) -> int:
	u = url.lower()
	score = 0

	if "wp-content/uploads" in u:
		score += 30
	if "recipe" in u:
		score += 10
	if any(ext in u for ext in [".jpg", ".jpeg", ".png", ".webp", ".avif"]):
		score += 10

	dim_match = re.search(r"(\d{3,4})x(\d{3,4})", u)
	if dim_match:
		width = int(dim_match.group(1))
		height = int(dim_match.group(2))
		area = width * height
		if area >= 700_000:
			score += 15
		elif area <= 120_000:
			score -= 25

	if any(
		bad in u
		for bad in [
			"thumbnail",
			"thumb",
			"-150x",
			"-300x",
			"logo",
			"icon",
			"avatar",
			"sprite",
			"banner",
		]
	):
		score -= 35

	return score


def extract_image_candidates(page_url: str, html_doc: str) -> List[str]:
	candidates: List[str] = []

	meta_patterns = [
		r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
		r'<meta[^>]+property=["\']og:image:url["\'][^>]+content=["\']([^"\']+)["\']',
		r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',
		r'<meta[^>]+name=["\']twitter:image:src["\'][^>]+content=["\']([^"\']+)["\']',
		r'<meta[^>]+itemprop=["\']image["\'][^>]+content=["\']([^"\']+)["\']',
		r'<link[^>]+rel=["\']image_src["\'][^>]+href=["\']([^"\']+)["\']',
	]

	for pattern in meta_patterns:
		for match in re.findall(pattern, html_doc, flags=re.IGNORECASE):
			value = html_unescape(match).strip()
			if value:
				candidates.append(urljoin(page_url, value))

	for ldjson in re.findall(
		r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
		html_doc,
		flags=re.IGNORECASE | re.DOTALL,
	):
		parsed = parse_ld_json_block(ldjson)
		if parsed:
			candidates.extend(extract_images_from_json(parsed, page_url))

	img_patterns = [
		r'<img[^>]+src=["\']([^"\']+)["\']',
		r'<img[^>]+data-src=["\']([^"\']+)["\']',
		r'<img[^>]+data-lazy-src=["\']([^"\']+)["\']',
		r'<img[^>]+srcset=["\']([^"\']+)["\']',
		r'<source[^>]+srcset=["\']([^"\']+)["\']',
	]

	for pattern in img_patterns:
		for match in re.findall(pattern, html_doc, flags=re.IGNORECASE):
			if "srcset" in pattern:
				for srcset_url in extract_from_srcset(match):
					value = html_unescape(srcset_url).strip()
					if value:
						candidates.append(urljoin(page_url, value))
			else:
				value = html_unescape(match).strip()
				if value:
					candidates.append(urljoin(page_url, value))

	seen = set()
	unique_candidates: List[str] = []
	for candidate in candidates:
		if not candidate or candidate.startswith("data:"):
			continue
		if candidate in seen:
			continue
		seen.add(candidate)
		unique_candidates.append(candidate)

	unique_candidates.sort(key=score_image_url, reverse=True)
	return unique_candidates


def scrape_to_new_csv(
	input_csv: Path,
	output_csv: Path,
	timeout: float,
	retries: int,
	delay: float,
	limit: int,
) -> None:
	rows_out = []
	total = 0
	success = 0
	failed = 0
	total_target = count_rows(input_csv)
	if limit > 0:
		total_target = min(total_target, limit)

	print(f"Starting scrape for {total_target} recipes...")
	render_progress(0, total_target, 0, 0)

	with open(input_csv, "r", encoding="utf-8", newline="") as handle:
		reader = csv.DictReader(handle)
		for index, row in enumerate(reader, start=1):
			if limit > 0 and index > limit:
				break

			total += 1
			recipe_title = (row.get("recipe_title") or "").strip()
			recipe_url = (row.get("url") or "").strip()

			image_url = ""
			if recipe_url:
				html_doc = fetch_page(recipe_url, timeout=timeout, retries=retries)
				if html_doc:
					candidates = extract_image_candidates(recipe_url, html_doc)
					if candidates:
						image_url = candidates[0]

			rows_out.append({"recipe_title": recipe_title, "image_url": image_url})

			if image_url:
				success += 1
			else:
				failed += 1

			render_progress(total, total_target, success, failed)

			if delay > 0:
				time.sleep(delay)

	print()

	output_csv.parent.mkdir(parents=True, exist_ok=True)
	with open(output_csv, "w", encoding="utf-8", newline="") as handle:
		writer = csv.DictWriter(handle, fieldnames=["recipe_title", "image_url"])
		writer.writeheader()
		writer.writerows(rows_out)

	print(f"Done. Processed: {total}, found_image: {success}, missing_image: {failed}")
	print(f"Input CSV unchanged: {input_csv}")
	print(f"Output CSV created: {output_csv}")


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(
		description="Create a NEW CSV with recipe_title + scraped image_url (does not edit source CSV)."
	)
	parser.add_argument(
		"--input-csv",
		default="dataset/food_recipes.csv",
		help="Path to source recipe CSV (default: dataset/food_recipes.csv)",
	)
	parser.add_argument(
		"--output-csv",
		default="dataset/food_recipe_image_links.csv",
		help="Path for new output CSV (default: dataset/food_recipe_image_links.csv)",
	)
	parser.add_argument(
		"--timeout",
		type=float,
		default=20.0,
		help="HTTP timeout in seconds (default: 20)",
	)
	parser.add_argument(
		"--retries",
		type=int,
		default=3,
		help="Retry count for page fetches (default: 3)",
	)
	parser.add_argument(
		"--delay",
		type=float,
		default=0.2,
		help="Delay between recipes in seconds (default: 0.2)",
	)
	parser.add_argument(
		"--limit",
		type=int,
		default=0,
		help="Only process first N recipes (default: 0 = all)",
	)
	return parser.parse_args()


def main() -> None:
	args = parse_args()
	input_csv = Path(args.input_csv).resolve()
	output_csv = Path(args.output_csv).resolve()

	if not input_csv.exists():
		raise FileNotFoundError(f"Input CSV not found: {input_csv}")

	scrape_to_new_csv(
		input_csv=input_csv,
		output_csv=output_csv,
		timeout=max(1.0, args.timeout),
		retries=max(1, args.retries),
		delay=max(0.0, args.delay),
		limit=max(0, args.limit),
	)


if __name__ == "__main__":
	main()

