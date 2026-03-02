import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import { recipeSteps } from '../data/mockData'
import { consumeRecipe, getRecipe } from '../api/client'
import { adaptRecipe } from '../utils/recipeAdapter'
import { useAuth } from '../context/AuthContext'
import { useFridge } from '../context/FridgeContext'

export default function CookingMode() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { refresh } = useFridge()
  const [params] = useSearchParams()
  const recipeId = params.get('recipeId')
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(Boolean(recipeId))
  const [finishing, setFinishing] = useState(false)
  const [missingItems, setMissingItems] = useState([])
  const [step, setStep] = useState(0)
  const steps = recipe?.steps && recipe.steps.length > 0 ? recipe.steps : recipeSteps
  const total = steps.length
  const isLast = step === total - 1

  useEffect(() => {
    let isMounted = true
    async function loadRecipe() {
      if (!recipeId) return
      try {
        const data = await getRecipe(auth.token, recipeId)
        if (!isMounted) return
        setRecipe(data.recipe ? adaptRecipe(data.recipe) : null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadRecipe()
    return () => { isMounted = false }
  }, [auth.token, recipeId])

  return (
    <PageContainer className="flex flex-col items-center justify-center">
      <div className="page-content">
        {loading ? (
          <div className="card rounded-3xl p-8 text-center sm:p-12">
            <p className="text-ink-muted leading-relaxed">Loading steps...</p>
          </div>
        ) : (
          <>
        {missingItems.length > 0 && (
          <div className="mb-6 rounded-2xl bg-tomato/10 px-4 py-3 text-sm text-tomato-dark">
            Missing in fridge: {missingItems.join(', ')}
          </div>
        )}
        <p className="mb-4 text-center text-sm font-medium text-ink-muted" aria-live="polite">
          Step {step + 1} of {total}
        </p>
        <div className="mb-8 h-2.5 w-full overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full rounded-full bg-sage transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={total}
          />
        </div>

        <div className="card rounded-3xl p-8 shadow-soft sm:p-12 lg:p-16">
          {recipe?.title && (
            <p className="mb-4 text-sm font-semibold text-ink-muted">{recipe.title}</p>
          )}
          <p className="text-xl leading-relaxed text-ink sm:text-2xl lg:text-3xl">
            {steps[step]}
          </p>
        </div>

        <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary w-full sm:w-auto"
            >
              Previous step
            </button>
          ) : (
            <Link to="/recipes" className="btn-secondary w-full text-center sm:w-auto">
              Back to recipes
            </Link>
          )}
          {isLast ? (
            <button
              type="button"
              onClick={async () => {
                if (!recipeId) {
                  navigate('/recipes')
                  return
                }
                setFinishing(true)
                try {
                  const res = await consumeRecipe(auth.token, recipeId)
                  const missing = res.missing || []
                  setMissingItems(missing)
                  await refresh()
                  if (missing.length === 0) {
                    navigate('/recipes')
                  }
                } finally {
                  setFinishing(false)
                }
              }}
              className="btn-primary order-first w-full sm:order-none sm:w-auto"
              disabled={finishing}
            >
              {finishing ? 'Finishing...' : 'Finish cooking'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary order-first w-full sm:order-none sm:w-auto"
            >
              Next step
            </button>
          )}
        </div>
          </>
        )}
      </div>
    </PageContainer>
  )
}
