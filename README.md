---
title: HCI-FoodApp
emoji: 🍳
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# Fridge-to-Table

A minimalistic, responsive multi-page web app for reducing food waste and planning meals. HCI project — focused on usability, accessibility, and clarity.

## Tech stack

- **React** (Vite)
- **TailwindCSS**
- **React Router**
- Mock JSON data (no backend)

## Design

- Warm neutrals (cream, beige, off-white)
- Accent colors: sage green, tomato red, carrot orange
- Rounded corners, soft shadows, spacious layout
- Mobile-first, responsive, WCAG-friendly

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

## Deploy on Hugging Face

The repo includes a **Dockerfile** and **GitHub Action** so every push to `main` updates your [Hugging Face Space](https://huggingface.co/docs/hub/spaces-sdks-docker).

### One-time setup

1. **Create a Docker Space** on [huggingface.co/new-space](https://huggingface.co/new-space): choose **Docker** as the SDK (or use existing **monish563/HCI-FoodAppDemo**).
2. **GitHub repo → Settings → Secrets and variables → Actions:** add secret **`HF_TOKEN`** = a [Hugging Face token](https://huggingface.co/settings/tokens) with **write** access. The workflow deploys to **monish563/HCI-FoodAppDemo**.

After that, every **push to `main`** runs the workflow and pushes this repo to your Space; Hugging Face rebuilds the Docker image and redeploys.

### Run the image locally

```bash
docker build -t hci-foodapp .
docker run -p 7860:7860 hci-foodapp
```

Open [http://localhost:7860](http://localhost:7860).

## Pages

1. **Home** — Use up soon + recipe suggestions
2. **My Fridge** — Inventory with expiry badges, add item modal, upload receipt
3. **Meal Planner** — Weekly grid, drag-and-drop recipes, filters
4. **Recipe Library** — Search + filter pills, recipe grid
5. **Cooking Mode** — Step-by-step, large text, progress bar
6. **Shopping List** — Categorized list with checkboxes
7. **Analytics** — Money saved, food saved, waste reduction %

## Project structure

```
frontend/
  index.html
  favicon.svg
  package.json
  package-lock.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  src/
    App.jsx
    main.jsx
    index.css
    components/
      Navbar.jsx
      PageContainer.jsx
      SectionHeader.jsx
      RecipeCard.jsx
      IngredientCard.jsx
      Modal.jsx
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
    data/
      mockData.js
```

## License

MIT (or as required by your course).
