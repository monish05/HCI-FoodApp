# HCI-FoodApp (Version 2.0)

A full-stack prototype for **“Fridge to Feast”**:
- **Frontend:** React + Vite
- **Backend:** FastAPI (JWT auth)
- **Database:** MongoDB (local Docker recommended; Atlas optional)
- **Profile (Prefs):** dietary + allergies + time preference used to filter recipe recommendations

---

## Repository Structure


HCI-FoodApp/
backend/ # FastAPI server + MongoDB + auth + APIs
frontend/ # React (Vite) client app
dataset/ # optional: scripts / sample seed data (do not commit secrets)
README.md

---

## Features

- User authentication (register/login) with password hashing (bcrypt)
- User profile page (`/profile`) for:
  - Dietary preferences
  - Allergies (includes **custom manual input**)
  - Time preference (Quick / Under 30 / Any)
- Recipe library (`/recipes`) fetched from MongoDB
- Recipe detail (`/recipes/:id`) with ingredients + instructions
- Fridge management (`/fridge`) saved per user in MongoDB
- Recipe API filtering based on user profile:
  - Allergy ingredients are **hard-blocked**
  - Dietary constraints are applied (based on recipe tags mapping)
  - Time preference applies a default max time cap (unless overridden)

---

## Requirements

- **Node.js** 18+ (recommended 20)
- **Python** 3.11
- **MongoDB**
  - Option A (recommended): **Docker**
  - Option B: MongoDB Atlas

---

## Quick Start (Local Development)

### 1) Start MongoDB (Docker)

Make sure Docker Desktop is running, then:

```bash
Start docker desktop
docker build -t hci-foodapp .
docker run -d --name hci-mongo -p 27017:27017 mongo:7

Verify MongoDB is listening:
lsof -nP -iTCP:27017 -sTCP:LISTEN

If you want to reset the DB later, remove the container:
docker rm -f hci-mongo

2) Backend Setup (FastAPI)
From repo root:
cd backend

Create and activate a Python 3.11 environment (conda example):
conda create -n hci-foodapp-py311 python=3.11 -y
conda activate hci-foodapp-py311

Install backend dependencies:
python -m pip install -r requirements.txt

Create backend/.env (do not commit this file):
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=hci_foodapp

JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRE_MINUTES=10080

CORS_ORIGINS=http://localhost:5173

Run the backend server:
uvicorn main:app --reload --port 8000

Backend health & docs:
Health: http://127.0.0.1:8000/api/health
Swagger docs: http://127.0.0.1:8000/docs

3) Frontend Setup (React + Vite)
From repo root:
cd frontend
npm install

Create frontend/.env:
VITE_API_BASE=http://127.0.0.1:8000

Start the frontend:
npm run dev

Open:
http://localhost:5173

First-Time Usage Flow
Go to /register and create an account
Log in at /login
Set your preferences at /profile
Go to /recipes to browse filtered recipes
Manage your fridge at /fridge

Importing Recipes into MongoDB
If you have a generated recipe JSON array file (example: recipes_enriched.json), import it into the recipes collection:
mongoimport \
  --uri "mongodb://127.0.0.1:27017/hci_foodapp" \
  --collection recipes \
  --file "/ABSOLUTE/PATH/TO/recipes_enriched.json" \
  --jsonArray

Recommended quick verification (optional):
python - << 'PY'
from pymongo import MongoClient
client = MongoClient("mongodb://127.0.0.1:27017")
db = client["hci_foodapp"]
print("recipes:", db["recipes"].count_documents({}))
print("users:", db["users"].count_documents({}))
print("fridges:", db["fridges"].count_documents({}))
PY


API Overview
Common endpoints:
Auth
POST /api/auth/register
POST /api/auth/login
User
GET /api/user/me
GET /api/user/prefs
POST /api/user/prefs
Recipes
GET /api/recipes?limit=...&q=...&tag=...&maxTime=...
Results are filtered by the logged-in user’s prefs:
allergies → hard block
dietary → tag mapping
time preference → default max time cap
Fridge
GET /api/fridge/me → returns { "items": [...] }
POST /api/fridge/me → upserts user fridge

Common Issues
1) “MongoDB connection failed”
Ensure Docker Desktop is running
Ensure port 27017 is listening
Ensure MONGODB_URI is correct in backend/.env
2) CORS errors in the browser
Ensure CORS_ORIGINS=http://localhost:5173 in backend/.env
Restart the backend after changing .env
3) Recipes page is empty
You may not have imported recipes into MongoDB yet
Confirm recipes collection exists in hci_foodapp DB
4) Large dataset files
Do not commit secrets or huge datasets by default
Prefer scripts/seed files or documented download steps

Git Workflow (Version2.0 Branch)
Create and push a new branch:
git checkout -b Version2.0
git add .
git commit -m "Version 2.0"
git push -u origin Version2.0

Note: Pushing code to GitHub does not affect your local Docker MongoDB data.
Only deleting containers/volumes or importing with --drop changes the DB state.

Security Notes
Never commit:
backend/.env
Atlas connection strings / passwords
JWT secrets
If you include demo seed data, avoid storing real personal information.

License
For course / prototype usage.
