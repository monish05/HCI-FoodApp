import { useState, useMemo } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import FilterPill from '../components/FilterPill'
import { recipes } from '../data/mockData'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe } from '../utils/recipeFridge'

const ALL_TAGS = [...new Set(recipes.flatMap((r) => r.tags || []))].sort()

export default function RecipeLibrary() {
  const { items: fridgeItems } = useFridge()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  const filtered = useMemo(() => {
    let list = recipes
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.tags || []).some((t) => t.toLowerCase().includes(q))
      )
    }
    if (activeTag) list = list.filter((r) => (r.tags || []).includes(activeTag))
    return list
  }, [search, activeTag])

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Recipe library"
          subtitle="Search and filter recipes"
        />

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
          <p className="mb-3 text-sm font-medium text-ink-muted">Filter by tag</p>
          <div className="flex flex-wrap gap-3">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {filtered.map((recipe) => {
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
              No recipes match your search or filter.
            </p>
            <button
              type="button"
              onClick={() => { setSearch(''); setActiveTag(null) }}
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
