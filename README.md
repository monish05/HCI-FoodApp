# HCI FoodApp – Recipe Image Link Scraper

This workspace contains a CSV dataset of recipes and a Python script that scrapes image links for each recipe.

## Files

- `dataset/food_recipes.csv`: source dataset (input)
- `scripts/scrape_recipe_images.py`: scraper script
- `dataset/food_recipe_image_links.csv`: generated output CSV with:
  - `recipe_title`
  - `image_url`

## Run

From the project root:

```bash
/usr/local/bin/python3.13 scripts/scrape_recipe_images.py --output-csv dataset/food_recipe_image_links.csv
```

## Useful options

```bash
# Process only first 10 rows
/usr/local/bin/python3.13 scripts/scrape_recipe_images.py --limit 10

# Custom output file
/usr/local/bin/python3.13 scripts/scrape_recipe_images.py --output-csv dataset/my_links.csv

# Add delay between requests
/usr/local/bin/python3.13 scripts/scrape_recipe_images.py --delay 0.5
```

## Notes

- The source file `dataset/food_recipes.csv` is not modified.
- A progress bar is shown while scraping.
- If a page has no detectable image, `image_url` is left blank for that row.
