---
title: HCI-FoodApp
emoji: 🍳
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# Fridge to Feast

A responsive multi-page web app that helps users reduce food waste by tracking fridge items, finding recipes they can cook now, planning meals, and managing shopping.

This is an HCI project focused on clear information hierarchy, low-friction interactions, and accessible mobile-first UI patterns.

## What this project does

Fridge to Feast supports an end-to-end weekly cooking workflow:

1. Track ingredients in **My Fridge** (with expiry awareness).
2. Get personalized recipe suggestions in **Home** based on what is in your fridge.
3. Explore and filter all recipes in **Recipe Library**.
4. Inspect recipe details and add missing ingredients to **Shopping List**.
5. Check off shopping items and automatically add them to the fridge inventory.
6. Arrange weekly meals in **Meal Planner** with drag-and-drop or quick add modal.
7. Follow step-by-step **Cooking Mode**.
8. View impact metrics in **Analytics** and reset local data when needed.

**Important:** This app is frontend-only. It uses browser localStorage for persistence and mock datasets for recipes, meal slots, and analytics. There is no backend API or database.

## Tech stack

- React 18 + Vite
- React Router v6
- Tailwind CSS
- Context API for app-wide state
- localStorage persistence for fridge and shopping categories
- Mock data layer in `frontend/src/data/mockData.js`

## Core functionality by page

### Home (`/`)
- Shows “Use up soon” chips for items expiring in ≤2 days.
- Shows “Suggested for you” recipes that are fully makeable from current fridge contents.
- Supports quick filters: **All**, **Quick**, **Meatless**, **Under 30 min**.

### My Fridge (`/fridge`)
- Search and sort fridge inventory (sorted by earliest expiry first).
- Add ingredients using:
  - **Add one item** form (name, amount, unit, days to expiry)
  - **From receipt** mode (paste lines like `2 Milk`, optional receipt image upload)
- Remove items from fridge.
- Uses `fridge-to-feast-fridge` localStorage key.

### Recipe Library (`/recipes`)
- Search recipes by title or tag.
- Filter by tags dynamically generated from recipe dataset.
- Displays whether a recipe is fully makeable or how many ingredients are available.

### Recipe Detail (`/recipes/:id`)
- Displays recipe overview, tags, ingredients, and steps.
- Compares ingredient list against fridge inventory.
- Adds missing ingredients to Shopping List category **For recipes**.
- Entry point to **Cooking Mode**.

### Cooking Mode (`/cooking`)
- Step-by-step recipe instruction UI with progress bar.
- Previous/Next navigation and completion action.

### Meal Planner (`/planner`)
- Weekly table with breakfast/lunch/dinner slots.
- Drag recipe cards into meal slots.
- Optional “+ Add” modal with search to assign meals quickly.
- Recipe sidebar filters by tag (e.g., Quick/Meatless).

### Shopping List (`/shopping`)
- Category-based checklist UI.
- Toggling an unchecked item to checked also adds it to fridge (default amount/unit/days).
- Supports items added from recipe-missing flow and receipt/manual flows.
- Uses `fridge-to-feast-shopping` localStorage key.

### Analytics (`/analytics`)
- Displays mock impact metrics:
  - money saved
  - food kept from waste (kg)
  - waste reduction percentage
- Includes 5-week trend bar chart.
- Includes **Clear local storage** action (resets saved fridge/shopping state).

## State and data model

- **Fridge context:** `frontend/src/context/FridgeContext.jsx`
  - add single item, add many items, remove item, persist to localStorage.
- **Shopping context:** `frontend/src/context/ShoppingContext.jsx`
  - toggle checked state, add items to categories, persist to localStorage.
- **Recipe/fridge matching utils:** `frontend/src/utils/recipeFridge.js`
  - ingredient normalization, fridge matching, recipe score calculation.
- **Mock dataset:** `frontend/src/data/mockData.js`
  - recipes, defaults for fridge/shopping, meal slots, recipe steps, analytics.

## Design notes

- Mobile-first responsive layout
- Fixed top navbar + mobile slide-out menu
- Reusable card/button/input primitives with Tailwind utility classes
- Soft visual language (rounded corners, muted palette) for readability
- Accessibility touches (skip link, focus rings, ARIA labels, semantic controls)

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
cd frontend
npm run build
npm run preview
```

Preview serves the production build locally (default Vite preview port).

## Deploy on Hugging Face

This repo includes:
- a root-level `Dockerfile` that builds `frontend` and serves static `dist`
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

```
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
    data/
      mockData.js
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

- No backend/API: all data is mock + browser localStorage.
- No authentication or multi-user sync.
- Meal planner state is session-based and resets on page reload.
- Analytics are illustrative values, not calculated from real historical events.
- Receipt flow supports manual parsing + optional image upload, but no OCR extraction.

## Future work

- Add authenticated cloud sync for fridge, planner, and shopping state.
- Add OCR for receipts and smarter ingredient normalization.
- Persist meal planner assignments to localStorage/database.
- Add unit conversion + quantity-aware recipe feasibility scoring.
- Replace mock analytics with event-based calculations.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
