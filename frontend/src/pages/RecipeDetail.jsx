import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import Badge from '../components/Badge'
import RecipeIngredientCard from '../components/RecipeIngredientCard'
import { useFridge } from '../context/FridgeContext'
import { useShopping } from '../context/ShoppingContext'
import { ingredientInFridge, getRecipeIngredients } from '../utils/recipeFridge'
import { useAuth } from '../context/AuthContext'

const FOR_RECIPES_CATEGORY = 'For recipes'

function parseSteps(recipe) {
  // ✅ 兼容 instructions / steps；两者都是数组的话直接用；字符串的话用 | 分割
  const raw = recipe?.instructions ?? recipe?.steps
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean)
  return String(raw).split('|').map((s) => s.trim()).filter(Boolean)
}

export default function RecipeDetail() {
  const { id } = useParams()
  const location = useLocation()

  const { items: fridgeItems, decrementItems } = useFridge()
  const { addMultipleItems } = useShopping()
  const [completed, setCompleted] = useState(false)
  const { API_BASE, authHeader } = useAuth()

  // ✅ 优先用 Link state 传过来的 recipe（点击进入时最稳）
  const [recipe, setRecipe] = useState(() => location.state?.recipe || null)
  const [loading, setLoading] = useState(!location.state?.recipe)
  const [notFound, setNotFound] = useState(false)

  // ✅ 如果用户刷新页面（state 丢了），fallback：拉一批再 find id
  useEffect(() => {
    let cancelled = false
    async function loadFallback() {
      if (recipe) return
      setLoading(true)
      setNotFound(false)
      try {
        const res = await fetch(`${API_BASE}/api/recipes?limit=2000`, { headers: authHeader })
        if (!res.ok) throw new Error('Failed to fetch recipes')
        const data = await res.json()
        const list = data.recipes || []
        const found = list.find((r) => String(r.id) === String(id))
        if (!cancelled) {
          if (found) setRecipe(found)
          else setNotFound(true)
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadFallback()
    return () => { cancelled = true }
  }, [API_BASE, authHeader, id, recipe])

  const ingredients = useMemo(() => getRecipeIngredients(recipe || {}), [recipe])
  const steps = useMemo(() => parseSteps(recipe || {}), [recipe])

  const inFridge = useMemo(() => {
    const map = new Map()
    for (const ing of ingredients) map.set(ing, ingredientInFridge(ing, fridgeItems))
    return map
  }, [ingredients, fridgeItems])

  function addMissingToShopping() {
    const missing = ingredients.filter((ing) => !inFridge.get(ing))
    if (!missing.length) return
    const newItems = missing.map((name) => ({
      name,
      category: FOR_RECIPES_CATEGORY,
      checked: false,
    }))
    addMultipleItems(newItems)
  }

  function handleCompleteRecipe() {
    const missingCount = ingredients.filter((ing) => !inFridge.get(ing)).length
    const proceed = missingCount === 0 || window.confirm("You do not have all the ingredients for this recipe, are you sure you want to update your fridge?")

    if (proceed) {
      decrementItems(ingredients)
      setCompleted(true)
      setTimeout(() => setCompleted(false), 2000)
    }
  }

  return (
    <PageContainer>
      <div className="page-content">
        <div className="mb-6">
          <Link to="/recipes" className="text-sm font-medium text-sage-dark hover:underline">
            ← Back to recipes
          </Link>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-muted">Loading recipe…</p>
        ) : notFound || !recipe ? (
          <div className="card rounded-3xl p-10 text-center">
            <p className="text-lg font-semibold text-ink">Recipe not found</p>
            <p className="mt-2 text-sm text-ink-muted">id: {id}</p>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h1 className="text-2xl font-bold text-ink sm:text-3xl">{recipe.title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {recipe.cookTime != null && <Badge>{recipe.cookTime} min</Badge>}
                {(recipe.tags || []).slice(0, 8).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>

              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="mt-6 h-64 w-full rounded-3xl object-cover sm:h-80"
                  loading="lazy"
                />
              )}
            </section>

            <section className="mb-10">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-ink">Ingredients</h2>
                <div className="flex gap-2">
                  <button type="button" onClick={addMissingToShopping} className="btn-secondary whitespace-nowrap">
                    Add missing
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteRecipe}
                    disabled={completed}
                    className={`btn-primary whitespace-nowrap ${completed ? 'bg-sage !text-white' : ''}`}
                  >
                    {completed ? '✓ Completed' : 'Complete Recipe'}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ingredients.length === 0 ? (
                  <p className="text-sm text-ink-muted">No ingredients available.</p>
                ) : (
                  ingredients.map((ing) => (
                    <RecipeIngredientCard key={ing} name={ing} inFridge={Boolean(inFridge.get(ing))} />
                  ))
                )}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-lg font-bold text-ink">Instructions</h2>
              {steps.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">No instructions available.</p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {steps.map((s, idx) => (
                    <li key={idx} className="card rounded-2xl p-4">
                      <p className="text-sm text-ink">
                        <span className="mr-2 font-semibold">{idx + 1}.</span>
                        {s}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </PageContainer>
  )
}