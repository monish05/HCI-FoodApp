import React, { useEffect, useState, useMemo } from 'react'
import PageContainer from '../components/PageContainer'
import AnalyticsWidget from '../components/widgets/AnalyticsWidget'
import ContinueCookingWidget from '../components/widgets/ContinueCookingWidget'
import ExpiringWidget from '../components/widgets/ExpiringWidget'
import ShoppingListWidget from '../components/widgets/ShoppingListWidget'
import BadgesWidget from '../components/widgets/BadgesWidget'
import RecentlyExpiredWidget from '../components/widgets/RecentlyExpiredWidget'
import RecipeCard from '../components/RecipeCard'
import { getRecipes } from '../api/client'
import { adaptRecipe } from '../utils/recipeAdapter'
import { useAuth } from '../context/AuthContext'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe } from '../utils/recipeFridge'

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
      .map(({ recipe }) => recipe)
  }, [fridgeItems, recipes])

  // A full grid ideally has 10-12 active slots to cover viewports nicely
  // With 6 widgets active, we can toss in 4 recipes to pad out the grid
  const recipesToDisplay = suggestedRecipes.slice(0, 4)

  return (
    <PageContainer>
      <div className="page-content">
        <section className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold text-ink sm:text-2xl">
            Welcome back!
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Here's what's happening in your kitchen today.
          </p>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-flow-dense grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-4 sm:gap-6">

          <AnalyticsWidget />
          <ExpiringWidget />
          <BadgesWidget />

          <ContinueCookingWidget />
          <ShoppingListWidget />

          <RecentlyExpiredWidget />

          {/* Fill the remaining sparse spots with recipes */}
          {!loading && recipesToDisplay.map((recipe) => (
            <div key={recipe.id} className="col-span-1">
              <RecipeCard recipe={recipe} />
            </div>
          ))}

          {loading && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-8 text-center text-sm font-medium text-ink-muted">
              Loading suggestions...
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
