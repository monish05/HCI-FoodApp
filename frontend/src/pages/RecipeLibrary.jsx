import { useState, useMemo } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import FilterPill from '../components/FilterPill'
import { recipes } from '../data/mockData'

const ALL_TAGS = [...new Set(recipes.flatMap((r) => r.tags))].sort()

export default function RecipeLibrary() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  const filtered = useMemo(() => {
    let list = recipes
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (activeTag) list = list.filter((r) => r.tags.includes(activeTag))
    return list
  }, [search, activeTag])

  return (
    <PageContainer>
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title="Recipe library"
          subtitle="Search and filter recipes"
        />
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <label htmlFor="recipe-search" className="sr-only">
            Search recipes
          </label>
          <input
            id="recipe-search"
            type="search"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-12 flex-1 rounded-2xl border border-cream-300 bg-white px-4 shadow-soft focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            aria-label="Search recipes"
          />
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <FilterPill
                key={tag}
                label={tag}
                active={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              />
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
            <p className="text-ink-muted">No recipes match your search or filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveTag(null)
              }}
              className="mt-3 text-sage font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
