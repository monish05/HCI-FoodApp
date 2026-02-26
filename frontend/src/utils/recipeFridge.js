function normalize(s) {
  return (s || '').toLowerCase().trim()
}

export function ingredientInFridge(ingredient, fridgeItems) {
  const ing = normalize(ingredient)
  if (!ing) return false
  return fridgeItems.some((f) => {
    const name = normalize(f.name)
    return name.includes(ing) || ing.includes(name)
  })
}

export function getRecipeIngredients(recipe) {
  const raw = recipe?.ingredients
  if (!raw) return []

  // if already an array
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean)
  }

  // if it's a string (e.g., "A|B|C")
  const s = String(raw)
  return s.split('|').map((x) => x.trim()).filter(Boolean)
}

export function scoreRecipe(recipe, fridgeItems) {
  const ings = getRecipeIngredients(recipe)
  if (ings.length === 0) return { matchCount: 0, total: 0, canMake: false }

  const matchCount = ings.filter((ing) => ingredientInFridge(ing, fridgeItems)).length
  const canMake = matchCount === ings.length
  return { matchCount, total: ings.length, canMake }
}