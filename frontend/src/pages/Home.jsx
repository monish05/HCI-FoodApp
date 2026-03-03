import { useEffect, useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import RecipeCard from '../components/RecipeCard'
import FilterPill from '../components/FilterPill'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe, getRecipeIngredients, ingredientInFridge } from '../utils/recipeFridge'
import { getRecipes } from '../api/client'
import { adaptRecipe } from '../utils/recipeAdapter'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const FILTERS = [
  { value: null, label: 'All' },
  { value: 'Quick', label: 'Quick' },
  { value: 'Meatless', label: 'Meatless' },
  { value: 30, label: 'Under 30 min' },
]

function sanitizeSearchIngredient(name) {
  return (name || '')
    .replace(/\s*[([{][^\])}]*[\])}]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function Home() {
  const auth = useAuth()
  const { items: fridgeItems } = useFridge()
  const [recipes, setRecipes] = useState([])
  const [topRated, setTopRated] = useState([])
  const [fallbackRecipes, setFallbackRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const useUpSoonItems = fridgeItems.filter((i) => i.daysLeft <= 2)
  const [filter, setFilter] = useState('Quick')
  const [activeTab, setActiveTab] = useState('quick')

  useEffect(() => {
    let isMounted = true
    async function loadRecipes() {
      try {
        const [data, topRatedData, fallbackData] = await Promise.all([
          getRecipes(auth.token, { limit: 120 }),
          getRecipes(auth.token, { limit: 8, sort: 'rating' }),
          getRecipes(auth.token, { limit: 120, sort: 'rating', ignore_prefs: true }),
        ])
        if (!isMounted) return
        setRecipes((data.recipes || []).map(adaptRecipe))
        setTopRated((topRatedData.recipes || []).map(adaptRecipe))
        setFallbackRecipes((fallbackData.recipes || []).map(adaptRecipe))
      } catch {
        if (!isMounted) return
        setRecipes([])
        setTopRated([])
        setFallbackRecipes([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadRecipes()
    return () => { isMounted = false }
  }, [auth.token])

  const suggestedRecipes = useMemo(() => {
    let list = [...recipes]
      .map((r) => ({ recipe: r, ...scoreRecipe(r, fridgeItems) }))
      .filter(({ total }) => total > 0)
      .filter(({ canMake }) => canMake)

    if (filter === 'Quick' || filter === 'Meatless') {
      list = list.filter(({ recipe }) => (recipe.tags || []).includes(filter))
    } else if (filter === 30) {
      list = list.filter(({ recipe }) => (recipe.cookTime ?? 999) <= 30)
    }

    list.sort((a, b) => (a.recipe.cookTime ?? 999) - (b.recipe.cookTime ?? 999))
    return list.map(({ recipe }) => recipe).slice(0, 12)
  }, [fridgeItems, filter, recipes])

  const quickRecipes = useMemo(() => {
    const source = recipes.length > 0 ? recipes : fallbackRecipes
    return [...source]
      .filter((recipe) => (recipe.cookTime ?? 999) <= 30)
      .map((recipe) => ({
        recipe,
        ...scoreRecipe(recipe, fridgeItems),
      }))
      .sort((a, b) => {
        if (a.canMake !== b.canMake) return a.canMake ? -1 : 1
        const ratioA = a.total ? a.matchCount / a.total : 0
        const ratioB = b.total ? b.matchCount / b.total : 0
        if (ratioA !== ratioB) return ratioB - ratioA
        return (a.recipe.cookTime ?? 999) - (b.recipe.cookTime ?? 999)
      })
      .map(({ recipe }) => recipe)
      .slice(0, 12)
  }, [recipes, fallbackRecipes, fridgeItems])

  const matchesFilter = (recipe, value) => {
    if (value === 'Quick' || value === 'Meatless') {
      return (recipe.tags || []).includes(value)
    }
    if (value === 30) {
      return (recipe.cookTime ?? 999) <= 30
    }
    return true
  }

  const featuredByFilter = useMemo(() => {
    return FILTERS.filter((f) => f.value !== null)
      .map((f) => ({
        label: f.label,
        recipe: recipes.find((r) => matchesFilter(r, f.value)),
      }))
      .filter((entry) => entry.recipe)
  }, [recipes])

  const canMakeCount = useMemo(() => {
    return recipes.filter((r) => {
      const ings = getRecipeIngredients(r)
      return ings.length > 0 && ings.every((ing) => ingredientInFridge(ing, fridgeItems))
    }).length
  }, [fridgeItems])

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
              {useUpSoonItems.slice(0, 3).map((item) => {
                const searchTerm = sanitizeSearchIngredient(item.name)
                return (
                  <Link
                    key={item.id}
                    to={`/recipes?q=${encodeURIComponent(searchTerm || item.name)}&source=use-up-soon`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-tomato/10 px-3 py-1.5 text-xs font-semibold text-tomato-dark transition hover:bg-tomato/20"
                  >
                    <span>{item.name}</span>
                    <span className="opacity-70">· {item.daysLeft}d</span>
                    <span className="opacity-80">→ Find recipes</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'quick'
                  ? 'bg-sage text-white shadow-soft'
                  : 'border border-cream-200 bg-white text-ink-muted hover:bg-cream-100'
              }`}
            >
              Quick picks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('top')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'top'
                  ? 'bg-sage text-white shadow-soft'
                  : 'border border-cream-200 bg-white text-ink-muted hover:bg-cream-100'
              }`}
            >
              Top rated
            </button>
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            {activeTab === 'quick'
              ? 'Under 30 minutes, ready to cook.'
              : 'Popular recipes picked by ratings.'}
          </p>
        </section>

        {loading ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            Loading recipes...
          </p>
        ) : (
          <>
            {activeTab === 'quick' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {(quickRecipes.length > 0 ? quickRecipes : fallbackRecipes.slice(0, 9)).slice(0, 9).map((recipe) => {
                  const { canMake, matchCount, total } = scoreRecipe(recipe, fridgeItems)
                  const ingredientStatus = !canMake && total > 0
                    ? matchCount > 0
                      ? `You have ${matchCount}/${total} ingredients`
                      : `Needs ${total} ingredients`
                    : undefined
                  return (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      badgeLabel={canMake ? 'You can make this' : undefined}
                      ingredientStatus={ingredientStatus}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {(topRated.length > 0 ? topRated : fallbackRecipes.slice(0, 9)).slice(0, 9).map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
            {fridgeItems.length === 0 && (
              <div className="mt-8 rounded-3xl bg-cream-100/80 p-4 text-center">
                <p className="text-sm font-medium text-ink">
                  Add items to your fridge to get better suggestions.
                </p>
                <a href="/fridge" className="btn-primary mt-3 inline-flex">
                  Add items to your fridge
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  )
}
