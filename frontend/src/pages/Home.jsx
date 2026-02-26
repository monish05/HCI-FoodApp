import { useEffect, useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import RecipeCard from '../components/RecipeCard'
import FilterPill from '../components/FilterPill'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe, getRecipeIngredients, ingredientInFridge } from '../utils/recipeFridge'
import { useAuth } from '../context/AuthContext'

const FILTERS = [
  { value: null, label: 'All' },
  { value: 'Quick', label: 'Quick (≤20 min)' },
  { value: 'Meatless', label: 'Meatless' },
  { value: 30, label: 'Under 30 min' },
]

export default function Home() {
  const { items: fridgeItems } = useFridge()
  const useUpSoonItems = fridgeItems.filter((i) => (i.daysLeft ?? 999) <= 2)
  const [filter, setFilter] = useState(null)
  const [recipes, setRecipes] = useState([])

  const { API_BASE, authHeader } = useAuth()

  // load recipes from backend
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const params = new URLSearchParams()
        params.set('limit', '200') // load more then filter in UI

        const res = await fetch(`${API_BASE}/api/recipes?${params.toString()}`, { headers: authHeader })
        if (!res.ok) throw new Error('recipes fetch failed')
        const data = await res.json()
        if (!cancelled) setRecipes(data.recipes || [])
      } catch {
        if (!cancelled) setRecipes([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [API_BASE, authHeader])

  const suggestedRecipes = useMemo(() => {
    let list = [...recipes]
      .map((r) => ({ recipe: r, ...scoreRecipe(r, fridgeItems) }))
      .filter(({ total }) => total > 0)
      .filter(({ canMake }) => canMake)

    if (filter === 'Meatless') {
      list = list.filter(({ recipe }) => (recipe.tags || []).includes('Meatless'))
    } else if (filter === 30) {
      list = list.filter(({ recipe }) => (recipe.cookTime ?? 999) <= 30)
    } else if (filter === 'Quick') {
      list = list.filter(({ recipe }) => (recipe.cookTime ?? 999) <= 20)
    }

    list.sort((a, b) => (a.recipe.cookTime ?? 999) - (b.recipe.cookTime ?? 999))
    return list.map(({ recipe }) => recipe).slice(0, 6)
  }, [recipes, fridgeItems, filter])

  const canMakeCount = useMemo(() => {
    return recipes.filter((r) => {
      const ings = getRecipeIngredients(r)
      return ings.length > 0 && ings.every((ing) => ingredientInFridge(ing, fridgeItems))
    }).length
  }, [recipes, fridgeItems])

  return (
    <PageContainer>
      <div className="page-content">
        <section className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold text-ink sm:text-2xl">
            Cook it before you lose it.
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Turn what you have into meals you’ll love.
          </p>
        </section>

        {useUpSoonItems.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-ink-muted mb-2">Use up soon</h2>
            <div className="flex flex-wrap gap-2">
              {useUpSoonItems.slice(0, 8).map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-tomato/10 px-3 py-1.5 text-xs font-medium text-tomato-dark"
                >
                  {item.name} <span className="opacity-80">({item.daysLeft}d)</span>
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mb-4">
          <h2 className="text-lg font-bold text-ink">Suggested for you</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => (
              <FilterPill
                key={label}
                label={label}
                active={filter === value}
                onClick={() => setFilter(value)}
              />
            ))}
          </div>
        </section>

        {suggestedRecipes.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            {canMakeCount === 0
              ? 'Add ingredients to your fridge to see recipes you can make.'
              : 'No recipes match. Clear the filter above.'}
            {filter !== null && (
              <button
                type="button"
                onClick={() => setFilter(null)}
                className="ml-2 font-medium text-sage-dark hover:underline"
              >
                Clear
              </button>
            )}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {suggestedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} badgeLabel="You can make this" />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}