export function parseMinutes(value) {
  if (!value) return null
  const match = String(value).match(/(\d+)/)
  return match ? Number(match[1]) : null
}

export function adaptRecipe(apiRecipe) {
  const prepTime = parseMinutes(apiRecipe.prep_time)
  const cookTime = parseMinutes(apiRecipe.cook_time)
  const totalTime = apiRecipe.total_time ?? ((prepTime || 0) + (cookTime || 0) || null)
  return {
    id: apiRecipe.id,
    title: apiRecipe.title,
    tags: apiRecipe.tags || [],
    cookTime,
    prepTime,
    totalTime,
    image: apiRecipe.image || null,
    ingredients: apiRecipe.ingredients || [],
    steps: apiRecipe.instructions || [],
    cuisine: apiRecipe.cuisine,
    diet: apiRecipe.diet,
    course: apiRecipe.course,
    rating: apiRecipe.rating ?? null,
    voteCount: apiRecipe.vote_count ?? null,
    url: apiRecipe.url,
    isExpiringSoon: Boolean(apiRecipe.is_expiring_soon),
  }
}
