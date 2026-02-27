import argparse
import json
import os
import sys

from pymongo import MongoClient
from dotenv import load_dotenv

def main():
    load_dotenv()
    uri = os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017")
    db_name = os.environ.get("DB_NAME", "hci_foodapp")
    
    print(f"Connecting to {uri}...")
    client = MongoClient(uri)
    db = client[db_name]
    
    # Path to the dataset
    filepath = "../dataset/recipes_enriched.json"
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        sys.exit(1)
        
    print(f"Loading {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        recipes = json.load(f)
        
    print(f"Loaded {len(recipes)} recipes from file.")
    
    # Insert recipes into the database
    collection = db["recipes"]
    
    # Clear existing data just in case
    print("Clearing existing recipes (if any)...")
    collection.delete_many({})
    
    print("Inserting recipes into MongoDB...")
    # Using batches to avoid overwhelming memory if the file is huge
    batch_size = 1000
    for i in range(0, len(recipes), batch_size):
        batch = recipes[i:i+batch_size]
        collection.insert_many(batch)
        print(f"Inserted {min(i+batch_size, len(recipes))} / {len(recipes)} recipes")
        
    print("✅ Done! Recipes successfully loaded into the database.")

if __name__ == "__main__":
    main()
