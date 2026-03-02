---
title: HCI-FoodApp
emoji: 🍳
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

## Easy Kitchen

A full-stack web app that helps users reduce food waste by tracking ingredients, discovering recipes, planning meals, and managing shopping.

This is an HCI-focused project designed around low-friction flows, clear hierarchy, and mobile-first interaction patterns.

## What this project does

Fridge to Feast supports an end-to-end weekly cooking workflow:

1. Track ingredients in **My Fridge** (with expiry awareness).
2. Get personalized recipe suggestions in **Home** based on what is in your fridge.
3. Explore and filter all recipes in **Recipe Library**.
4. Inspect recipe details and add missing ingredients to **Shopping List**.
5. Check off shopping items and automatically add them to the fridge inventory.
6. Arrange weekly meals in **Meal Planner** and link slots to real recipes.
7. Follow step-by-step **Cooking Mode**.
8. View engagement and impact metrics in **Analytics**.

## Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI + Motor (MongoDB)
- **Auth:** JWT-based authentication
- **Persistence:** Per-user database storage for core flows (fridge, preferences, planner, analytics)

## Tech stack

- React 18 + Vite
- React Router v6
- Tailwind CSS
- FastAPI + Uvicorn
- MongoDB + Motor
- Context API for app-wide state orchestration
- JWT auth with bcrypt password hashing

## Core functionality by page

### Home (`/`)

- Shows “Use up soon” chips for items expiring in ≤2 days.
- Shows quick picks and top-rated recipes.
- “Use up soon” ingredient chips deep-link into recipe search.

### My Fridge (`/fridge`)

- Inventory grouped by category with interactive cards.
- Clickable stats (All / Expiring soon / Low stock) act as filters.
- Add item modal supports:
  - **Quick add** (suggestions, quantity stepper, category, expiry presets)
  - **Bulk add** (paste multiline entries like `2 Eggs`)
- Expiry-aware visual styling on item cards.

### Recipe Library (`/recipes`)

- Search + sort + filters (meal type, max cook time).
- URL-driven filters for shareable/deep-linkable states.
- Supports ingredient-intent context from Home chips.

### Recipe Detail (`/recipes/:id`)

- Displays recipe overview, tags, ingredients, and steps.
- Compares ingredient list against fridge inventory.
- Adds missing ingredients to Shopping List category **For recipes**.
- Entry point to **Cooking Mode**.

### Cooking Mode (`/cooking`)

- Step-by-step recipe instruction UI with progress bar.
- Previous/Next navigation and completion action.

### Meal Planner (`/planner`)

- Dynamic weekly planner (breakfast/lunch/dinner).
- Per-user planner persistence to backend by week.
- Linked recipe assignments + recipe detail navigation.
- Week/day clear actions with confirmation and read-only lock for past periods.

### Shopping List (`/shopping`)

- Category-based checklist UI.
- Explicit “Add to fridge” / “Remove from fridge” action per item.
- Quantity controls and delete actions per item.
- Empty categories are hidden.

### Analytics (`/analytics`)

- Per-user analytics state stored in backend.
- Tracks engagement metrics, streaks, and progress views.

## Backend API (high-level)

- `POST /auth/register`, `POST /auth/login`
- `GET/PUT /users/me`
- `GET/POST/PUT/DELETE /fridge`
- `GET /recipes`, `GET /recipes/:id`, `GET /recipes/ingredients`, `GET /recipes/filters`
- `GET/PUT /planner/week`
- `GET/PUT /analytics/me`
- `GET/POST/PUT /preferences`

## Environment variables

Add these to `.env` at repo root:

- `MONGODB_URI` (required)
- `JWT_SECRET` (required)
- `JWT_EXPIRE_MINUTES` (optional, default 10080)
- `WEB_ORIGIN` (optional, comma-separated allowed origins)
- `VITE_API_URL` (optional for frontend; defaults to `http://localhost:8000` in dev)

## Run locally

### 1) Backend

```bash
pip install -r requirements.txt
python backend/main.py
```

Backend starts on `http://localhost:8000` by default.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`.

## Build

```bash
cd frontend
npm run build
npm run preview
```

Preview serves the production build locally (default Vite preview port).

## Deploy on Hugging Face

This repo includes:

- a root-level `Dockerfile`
- a GitHub Actions workflow at `.github/workflows/deploy-hf.yml`

Every push to `main` triggers deployment to the configured Hugging Face Space.

### One-time setup

1. Create a Docker Space on [huggingface.co/new-space](https://huggingface.co/new-space).
2. Add repository secret `HF_TOKEN` in GitHub Actions settings.
3. Ensure `.github/workflows/deploy-hf.yml` has the correct `HF_SPACE` value for your account.

After setup, push to `main` to trigger deploy and rebuild.

### Run the image locally

```bash
docker build -t hci-foodapp .
docker run -p 7860:7860 hci-foodapp
```

Open [http://localhost:7860](http://localhost:7860).

## Project structure

```text
backend/
  main.py
  app/
    main.py
    auth.py
    db.py
    deps.py
    routes/
      auth.py
      analytics.py
      fridge.py
      planner.py
      preferences.py
      recipes.py
      users.py

frontend/
  index.html
  public/
    logo.svg
  src/
    App.jsx
    main.jsx
    index.css
    context/
      FridgeContext.jsx
      ShoppingContext.jsx
    utils/
      recipeFridge.js
    components/
      Navbar.jsx
      PageContainer.jsx
      SectionHeader.jsx
      PageSection.jsx
      RecipeCard.jsx
      IngredientCard.jsx
      Modal.jsx
      AddItemModal.jsx
      FilterPill.jsx
      Badge.jsx
    pages/
      Home.jsx
      MyFridge.jsx
      MealPlanner.jsx
      RecipeLibrary.jsx
      RecipeDetail.jsx
      CookingMode.jsx
      ShoppingList.jsx
      Analytics.jsx
  tailwind.config.js
  vite.config.js
```

## Scripts

Inside `frontend/`:

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run preview` — preview production build

## Known limitations

- No OCR extraction from receipt images (bulk add uses typed/pasted text parsing).
- Recipe matching is heuristic and based on ingredient-string normalization.
- Some UX flows still rely on optimistic client updates before refresh.

## Future work

- Add OCR for receipt ingestion.
- Improve semantic ingredient matching and unit normalization.
- Add richer planner intelligence (auto-fill by goals/preferences).
- Expand test coverage for API routes and key UI flows.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
