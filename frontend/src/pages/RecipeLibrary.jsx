import { useEffect, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe } from '../utils/recipeFridge'
import { getRecipes } from '../api/client'
import { adaptRecipe } from '../utils/recipeAdapter'
import { useAuth } from '../context/AuthContext'

export default function RecipeLibrary() {
  const auth = useAuth()
  const { items: fridgeItems } = useFridge()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [course, setCourse] = useState('All')
  const [maxTime, setMaxTime] = useState('Any')
  const [sortBy, setSortBy] = useState('relevance')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadRecipes() {
      setLoading(true)
      try {
        const params = {
          limit: 50,
          q: search.trim() || undefined,
          course: course === 'All' ? undefined : course,
          max_time: maxTime === 'Any' ? undefined : Number(maxTime),
          sort: sortBy,
        }
        const data = await getRecipes(auth.token, params)
        if (!isMounted) return
        const adapted = (data.recipes || []).map(adaptRecipe)
        setRecipes(adapted)
      } catch (err) {
        if (!isMounted) return
        setError(err.message || 'Unable to load recipes')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadRecipes()
    return () => { isMounted = false }
  }, [auth.token, search, course, maxTime, sortBy])

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Recipe library"
          subtitle="Search and filter recipes"
        />

        <div className="card mb-8 rounded-3xl p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label htmlFor="recipe-search" className="mb-2 block text-sm font-medium text-ink-muted">
                Search
              </label>
              <input
                id="recipe-search"
                type="search"
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label htmlFor="sortBy" className="mb-2 block text-sm font-medium text-ink-muted">
                Sort by
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input w-full"
              >
                <option value="relevance">Best match</option>
                <option value="expiring">Expiring soon</option>
                <option value="cook_time">Cook time</option>
                <option value="rating">Rating</option>
                <option value="vote_count">Most votes</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="btn-secondary w-full"
              >
                {filtersOpen ? 'Hide filters' : 'Filters'}
              </button>
            </div>
          </div>
          {filtersOpen && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="course" className="mb-2 block text-sm font-medium text-ink-muted">
                  Meal type
                </label>
                <select
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="input w-full"
                >
                  <option>All</option>
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                </select>
              </div>
              <div>
                <label htmlFor="maxTime" className="mb-2 block text-sm font-medium text-ink-muted">
                  Max cook time
                </label>
                <select
                  id="maxTime"
                  value={maxTime}
                  onChange={(e) => setMaxTime(e.target.value)}
                  className="input w-full"
                >
                  <option>Any</option>
                  <option value="15">Under 15 min</option>
                  <option value="30">Under 30 min</option>
                  <option value="45">Under 45 min</option>
                  <option value="60">Under 60 min</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="card rounded-3xl p-12 text-center">
            <p className="text-ink-muted leading-relaxed">Loading recipes...</p>
          </div>
        ) : error ? (
          <div className="card rounded-3xl p-12 text-center">
            <p className="text-ink-muted leading-relaxed">{error}</p>
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {recipes.map((recipe) => {
              const { canMake, matchCount, total } = scoreRecipe(recipe, fridgeItems)
              const ingredientStatus = !canMake && total > 0
                ? matchCount > 0
                  ? `You have ${matchCount}/${total} ingredients`
                  : `Needs ${total} ingredients`
                : undefined
              return (
                <div key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    badgeLabel={canMake ? 'You can make this' : undefined}
                    ingredientStatus={ingredientStatus}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card rounded-3xl p-12 text-center sm:p-16">
            <p className="text-5xl sm:text-6xl" aria-hidden>🔍</p>
            <p className="mt-6 text-base text-ink-muted leading-relaxed">
              No recipes match your preferences yet.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
