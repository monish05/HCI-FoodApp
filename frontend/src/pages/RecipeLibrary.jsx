import { useEffect, useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import FilterPill from '../components/FilterPill'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe } from '../utils/recipeFridge'
import { useAuth } from '../context/AuthContext'

export default function RecipeLibrary() {
  const { items: fridgeItems } = useFridge()
  const { API_BASE, authHeader } = useAuth()

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  // 1) Fetch recipes from backend
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        // 你可以调大一点，例如 2000；先用 800 够 demo 了
        const res = await fetch(`${API_BASE}/api/recipes?limit=100`, { headers: authHeader })
        if (!res.ok) throw new Error('Failed to fetch recipes')
        const data = await res.json()
        if (!cancelled) setRecipes(data.recipes || [])
      } catch (e) {
        if (!cancelled) setRecipes([])
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [API_BASE, authHeader])

  // 2) Build tag list from fetched recipes
  const allTags = useMemo(() => {
    const set = new Set()
    for (const r of recipes) {
      const tags = r?.tags || []
      if (Array.isArray(tags)) tags.forEach((t) => set.add(t))
    }
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)))
  }, [recipes])

  // 3) Filter by search + tag
  const filteredRecipes = useMemo(() => {
    let list = recipes

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((r) => String(r.title || '').toLowerCase().includes(q))
    }

    if (activeTag) {
      list = list.filter((r) => (r.tags || []).includes(activeTag))
    }

    // 4) Sort: canMake first, then cookTime asc, then title
    const scored = list.map((r) => ({ recipe: r, ...scoreRecipe(r, fridgeItems) }))
    scored.sort((a, b) => {
      if (a.canMake !== b.canMake) return a.canMake ? -1 : 1
      const ta = a.recipe.cookTime ?? 9999
      const tb = b.recipe.cookTime ?? 9999
      if (ta !== tb) return ta - tb
      return String(a.recipe.title || '').localeCompare(String(b.recipe.title || ''))
    })

    return scored
  }, [recipes, search, activeTag, fridgeItems])

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader title="Recipe library" subtitle="Search and filter recipes" />

        {/* Search + tag filter */}
        <div className="card mb-8 rounded-3xl p-6 sm:p-8">
          <input
            id="recipe-search"
            type="search"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input mb-6 w-full"
            aria-label="Search recipes"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink-muted">Filter by tag</p>
            {(activeTag || search.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setActiveTag(null)
                }}
                className="text-sm font-medium text-sage-dark hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {allTags.length === 0 ? (
              <span className="text-sm text-ink-muted">No tags loaded yet.</span>
            ) : (
              allTags.map((tag) => (
                <FilterPill
                  key={tag}
                  label={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                />
              ))
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <p className="py-10 text-center text-sm text-ink-muted">Loading recipes…</p>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {filteredRecipes.map(({ recipe, canMake, missing }) => (
              <div key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  badgeLabel={canMake ? 'You can make this' : undefined}
                  missing={missing}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="card rounded-3xl p-12 text-center sm:p-16">
            <p className="text-5xl sm:text-6xl" aria-hidden>
              🔍
            </p>
            <p className="mt-6 text-base text-ink-muted leading-relaxed">
              No recipes match your search or filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveTag(null)
              }}
              className="btn-primary mt-6"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}