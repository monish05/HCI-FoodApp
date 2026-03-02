import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import { recipeSteps } from '../data/mockData'
import { useFridge } from '../context/FridgeContext'
import { useShopping } from '../context/ShoppingContext'
import { ingredientInFridge, getRecipeIngredients } from '../utils/recipeFridge'
import { getRecipe, getSimilarRecipes } from '../api/client'
import { adaptRecipe } from '../utils/recipeAdapter'
import { useAuth } from '../context/AuthContext'
import RecipeCard from '../components/RecipeCard'

const FOR_RECIPES_CATEGORY = 'For recipes'

export default function RecipeDetail() {
  const { id } = useParams()
  const auth = useAuth()
  const [recipe, setRecipe] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { items: fridgeItems } = useFridge()
  const { addItemsToCategory } = useShopping()
  const [imgError, setImgError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const showImage = recipe?.image && !imgError

  const ingredients = useMemo(() => getRecipeIngredients(recipe), [recipe])

  const { inFridge, missing } = useMemo(() => {
    const inFridgeList = ingredients.filter((ing) => ingredientInFridge(ing, fridgeItems))
    const missingList = ingredients.filter((ing) => !ingredientInFridge(ing, fridgeItems))
    return { inFridge: inFridgeList, missing: missingList }
  }, [ingredients, fridgeItems])

  const normalizeName = (value) =>
    (value || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()

  const isIngredientExpiringSoon = (ingredient) => {
    const ing = normalizeName(ingredient)
    if (!ing) return false
    return (fridgeItems || []).some((item) => {
      const name = normalizeName(item.name)
      if (!name) return false
      const matches = name.includes(ing) || ing.includes(name)
      return matches && (item.daysLeft ?? 9999) <= 2
    })
  }

  useEffect(() => {
    let isMounted = true
    async function loadRecipe() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setImgError(false)
      try {
        const data = await getRecipe(auth.token, id)
        if (!isMounted) return
        const adapted = data.recipe ? adaptRecipe(data.recipe) : null
        setRecipe(adapted)
        if (data.recipe) {
          const similarData = await getSimilarRecipes(auth.token, id)
          if (!isMounted) return
          setSimilar((similarData.recipes || []).map(adaptRecipe))
        }
      } catch (err) {
        if (!isMounted) return
        setError(err.message || 'Unable to load recipe')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadRecipe()
    return () => { isMounted = false }
  }, [auth.token, id])

  const steps = (recipe?.steps && recipe.steps.length > 0) ? recipe.steps : recipeSteps
  const ratingValue = Number(recipe?.rating || 0)
  const ratingRounded = Math.max(0, Math.min(5, Math.round(ratingValue)))
  const ratingStars = '★'.repeat(ratingRounded) + '☆'.repeat(5 - ratingRounded)

  const handleAddMissingToShopping = () => {
    if (missing.length === 0) return
    addItemsToCategory(FOR_RECIPES_CATEGORY, missing)
    setAddedToCart(true)
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="page-content">
          <div className="card rounded-3xl p-12 text-center">
            <p className="text-ink-muted leading-relaxed">Loading recipe...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="page-content">
          <div className="card rounded-3xl p-12 text-center">
            <p className="text-ink-muted leading-relaxed">{error}</p>
            <Link to="/recipes" className="btn-primary mt-6 inline-block">
              Back to library
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!recipe) {
    return (
      <PageContainer>
        <div className="page-content">
          <div className="card rounded-3xl p-12 text-center">
            <p className="text-ink-muted leading-relaxed">Recipe not found.</p>
            <Link to="/recipes" className="btn-primary mt-6 inline-block">
              Back to library
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="page-content">
        <Link
          to="/recipes"
          className="mb-6 inline-block text-sm font-medium text-ink-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded-full"
        >
          ← Back to library
        </Link>
        <div className="card overflow-hidden rounded-3xl p-0">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-200 sm:h-20 sm:w-20">
                {showImage ? (
                  <img
                    src={recipe.image}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-cream-200 text-2xl sm:text-3xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold leading-tight text-ink sm:text-3xl lg:text-4xl">
                  {recipe.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {recipe.prepTime ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1 text-sm font-medium text-ink-muted">
                      <span aria-hidden>🕒</span>
                      <span>
                        <span className="font-semibold text-ink">Prep</span> {recipe.prepTime} min
                      </span>
                    </span>
                  ) : null}
                  {recipe.cookTime ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1 text-sm font-medium text-ink-muted">
                      <span aria-hidden>🔥</span>
                      <span>
                        <span className="font-semibold text-ink">Cook</span> {recipe.cookTime} min
                      </span>
                    </span>
                  ) : null}
                  {recipe.totalTime ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1 text-sm font-medium text-ink-muted">
                      <span aria-hidden>⏱️</span>
                      <span>
                        <span className="font-semibold text-ink">Total</span> {recipe.totalTime} min
                      </span>
                    </span>
                  ) : null}
                  {recipe.rating ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1 text-sm font-medium text-ink-muted">
                      <span aria-hidden className="tracking-tight text-amber-500">{ratingStars}</span>
                      <span>
                        <span className="font-semibold text-ink">Rating</span> {ratingValue.toFixed(1)}/5
                        {recipe.voteCount ? ` · ${recipe.voteCount} ratings` : ''}
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {/* Ingredients */}
            {ingredients.length > 0 && (
              <>
                <h2 className="mt-8 text-xl font-bold text-ink">Ingredients</h2>
                <ul className="mt-3 space-y-2">
                  {ingredients.map((ing) => {
                    const have = ingredientInFridge(ing, fridgeItems)
                    const expiringSoon = have && isIngredientExpiringSoon(ing)
                    return (
                      <li key={ing} className="flex items-center gap-3">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${have ? 'bg-sage/15 text-sage-dark' : 'bg-tomato/15 text-tomato-dark'}`}>
                          {have ? '✓' : '—'}
                        </span>
                        <span className={have ? 'text-ink' : 'text-ink-muted'}>
                          {ing}
                        </span>
                        {expiringSoon && (
                          <Badge variant="tomato">Expiring soon</Badge>
                        )}
                        {!have && (
                          <span className="ml-auto shrink-0 rounded-full bg-tomato/10 px-2.5 py-0.5 text-xs font-medium text-tomato-dark">
                            Missing
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
                {missing.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-cream-100/80 p-4">
                    <p className="text-sm font-medium text-ink">
                      You’re missing {missing.length} ingredient{missing.length !== 1 ? 's' : ''}.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddMissingToShopping}
                      disabled={addedToCart}
                      className="btn-primary mt-3 w-full sm:w-auto"
                    >
                      {addedToCart ? 'Added to shopping list' : 'Add missing to shopping list'}
                    </button>
                  </div>
                )}
                {ingredients.length > 0 && missing.length === 0 && (
                  <p className="mt-3 text-sm text-sage-dark font-medium">
                    You have all the ingredients.
                  </p>
                )}
              </>
            )}

            <h2 className="mt-8 text-xl font-bold text-ink">Steps</h2>
            <ol className="mt-4 space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-sage-dark">
                    {i + 1}
                  </span>
                  <span className="text-base leading-relaxed text-ink pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <Link
              to={`/cooking?recipeId=${recipe.id}`}
              className="btn-primary mt-10 flex w-full items-center justify-center"
            >
              Start cooking
            </Link>
            {similar.length > 0 && (
              <>
                <h2 className="mt-12 text-xl font-bold text-ink">Similar recipes</h2>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {similar.map((item) => (
                    <RecipeCard key={item.id} recipe={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
