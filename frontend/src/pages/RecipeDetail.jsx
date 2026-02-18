import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import Badge from '../components/Badge'
import { recipes, recipeSteps } from '../data/mockData'
import { useFridge } from '../context/FridgeContext'
import { useShopping } from '../context/ShoppingContext'
import { ingredientInFridge, getRecipeIngredients } from '../utils/recipeFridge'

const FOR_RECIPES_CATEGORY = 'For recipes'

export default function RecipeDetail() {
  const { id } = useParams()
  const recipe = recipes.find((r) => r.id === id)
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

  const steps = (recipe?.steps && recipe.steps.length > 0) ? recipe.steps : recipeSteps

  const handleAddMissingToShopping = () => {
    if (missing.length === 0) return
    addItemsToCategory(FOR_RECIPES_CATEGORY, missing)
    setAddedToCart(true)
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
          <div className="aspect-[3/2] overflow-hidden rounded-t-3xl bg-cream-200 sm:aspect-[16/9]">
            {showImage ? (
              <img
                src={recipe.image}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-cream-200 text-5xl sm:text-6xl">
                🍽️
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <h1 className="text-2xl font-bold leading-tight text-ink sm:text-3xl lg:text-4xl">
              {recipe.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(recipe.tags || []).map((tag) => (
                <Badge key={tag} variant="sage">{tag}</Badge>
              ))}
              {recipe.cookTime && (
                <span className="text-sm text-ink-muted">{recipe.cookTime} min</span>
              )}
            </div>

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <>
                <h2 className="mt-8 text-xl font-bold text-ink">Ingredients</h2>
                <ul className="mt-3 space-y-2">
                  {ingredients.map((ing) => {
                    const have = ingredientInFridge(ing, fridgeItems)
                    return (
                      <li key={ing} className="flex items-center gap-3">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${have ? 'bg-sage/15 text-sage-dark' : 'bg-tomato/15 text-tomato-dark'}`}>
                          {have ? '✓' : '—'}
                        </span>
                        <span className={have ? 'text-ink' : 'text-ink-muted'}>
                          {ing}
                        </span>
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
              to="/cooking"
              className="btn-primary mt-10 flex w-full items-center justify-center"
            >
              Start cooking
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
