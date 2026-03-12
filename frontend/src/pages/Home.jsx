import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import AnalyticsWidget from '../components/widgets/AnalyticsWidget'
import ContinueCookingWidget from '../components/widgets/ContinueCookingWidget'
import ExpiringWidget from '../components/widgets/ExpiringWidget'
import BadgesWidget from '../components/widgets/BadgesWidget'
import RecentlyExpiredWidget from '../components/widgets/RecentlyExpiredWidget'
import { getRecipes } from '../api/client'
import { adaptRecipe } from '../utils/recipeAdapter'
import { useAuth } from '../context/AuthContext'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe } from '../utils/recipeFridge'

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

function RecipeSuggestionCard({ recipe, matchCount, total, canMake }) {
  const [imgError, setImgError] = useState(false)
  const showImage = recipe?.image && !imgError
  const matchPercent = total > 0 ? Math.round((matchCount / total) * 100) : 0

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <Link to={`/recipes/${recipe.id}`} className="block flex-1">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
          {showImage ? (
            <img
              src={recipe.image}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
          )}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <span className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur-sm">
              {canMake ? '100% match' : `${matchPercent}% match`}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink">{recipe.title}</h3>
          {(recipe.totalTime || recipe.cookTime) && (
            <p className="mt-1 text-xs text-ink-muted">⏱️ {recipe.totalTime ?? recipe.cookTime} min</p>
          )}
        </div>
      </Link>
      <div className="border-t border-cream-200 p-4 pt-0">
        <Link
          to={`/cooking?recipeId=${recipe.id}`}
          className="block w-full rounded-xl bg-sage py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
        >
          Cook Now
        </Link>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-soft">
      <div className="aspect-[4/3] animate-pulse bg-cream-200" />
      <div className="p-4 space-y-2">
        <div className="h-5 w-3/4 animate-pulse rounded bg-cream-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-cream-200" />
      </div>
      <div className="border-t border-cream-200 p-4 pt-0">
        <div className="h-10 w-full animate-pulse rounded-xl bg-cream-200" />
      </div>
    </div>
  )
}

export default function Home() {
  const auth = useAuth()
  const { items: fridgeItems } = useFridge()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadRecipes() {
      try {
        const data = await getRecipes(auth.token, { limit: 20 })
        if (!isMounted) return
        setRecipes((data.recipes || []).map(adaptRecipe))
      } catch {
        if (!isMounted) return
        setRecipes([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadRecipes()
    return () => { isMounted = false }
  }, [auth.token])

  const suggestedRecipes = useMemo(() => {
    return [...recipes]
      .map((r) => ({ recipe: r, ...scoreRecipe(r, fridgeItems) }))
      .sort((a, b) => {
        if (a.canMake !== b.canMake) return a.canMake ? -1 : 1
        return (b.matchCount / (b.total || 1)) - (a.matchCount / (a.total || 1))
      })
  }, [fridgeItems, recipes])

  const recipesToDisplay = suggestedRecipes.slice(0, 4)
  const displayName = auth.userName || auth.userLastName ? [auth.userName, auth.userLastName].filter(Boolean).join(' ') : null
  const timeGreeting = getTimeGreeting()

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 xs:px-5 sm:px-6">
        {/* Hero Section */}
        <section className="mb-10 sm:mb-12">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-sage via-sage-light to-sage-dark p-8 shadow-soft-xl sm:p-10">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Welcome back 👋
            </h1>
            <p className="mt-2 text-lg text-white/90">
              Good {timeGreeting}
              {displayName && <span className="font-semibold">, {displayName}</span>}
            </p>
            <p className="mt-1 text-base text-white/80">
              Here&apos;s what&apos;s happening in your kitchen today.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/recipes"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-sage-dark shadow-soft transition hover:bg-white/95 active:scale-[0.98]"
              >
                Find Recipes
              </Link>
              <Link
                to="/fridge"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98]"
              >
                View My Fridge
              </Link>
              <Link
                to="/planner"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98]"
              >
                Plan Meals
              </Link>
            </div>
          </div>
        </section>

        {/* Smart Insights Row */}
        <section className="mb-10 sm:mb-12">
          <h2 className="mb-6 text-xl font-bold text-ink sm:text-2xl">Smart insights</h2>
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 sm:pb-2">
            <div className="flex h-[340px] gap-4 sm:gap-6" style={{ width: 'max-content' }}>
              <div className="flex h-full w-[280px] shrink-0 flex-col transition-transform hover:-translate-y-0.5 sm:w-[300px] [&>*]:h-full">
                <ExpiringWidget />
              </div>
              <div className="flex h-full w-[280px] shrink-0 flex-col transition-transform hover:-translate-y-0.5 sm:w-[300px] [&>*]:h-full">
                <AnalyticsWidget />
              </div>
              <div className="flex h-full w-[280px] shrink-0 flex-col transition-transform hover:-translate-y-0.5 sm:w-[300px] [&>*]:h-full">
                <BadgesWidget />
              </div>
              <div className="flex h-full w-[280px] shrink-0 flex-col transition-transform hover:-translate-y-0.5 sm:w-[300px] [&>*]:h-full">
                <RecentlyExpiredWidget />
              </div>
            </div>
          </div>
        </section>

        {/* Continue Cooking Section */}
        <section className="mb-10 sm:mb-12">
          <h2 className="mb-4 text-lg font-bold text-ink sm:text-xl">Continue cooking</h2>
          <div className="max-w-md overflow-hidden rounded-2xl shadow-soft-lg ring-1 ring-cream-300 transition-shadow hover:shadow-soft-xl">
            <ContinueCookingWidget />
          </div>
        </section>

        {/* Recipe Suggestions Section */}
        <section className="mb-10 sm:mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink sm:text-2xl">Recipes you can make</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Based on ingredients currently in your fridge
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recipesToDisplay.map(({ recipe, matchCount, total, canMake }) => (
                <RecipeSuggestionCard
                  key={recipe.id}
                  recipe={recipe}
                  matchCount={matchCount}
                  total={total}
                  canMake={canMake}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </PageContainer>
  )
}
