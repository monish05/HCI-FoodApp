import { useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import FilterPill from '../components/FilterPill'
import { recipes } from '../data/mockData'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe, getRecipeIngredients, ingredientInFridge } from '../utils/recipeFridge'

const TIME_FILTERS = [
  { value: null, label: 'Any time' },
  { value: 15, label: 'Under 15 min' },
  { value: 30, label: 'Under 30 min' },
  { value: 45, label: 'Under 45 min' },
  { value: 46, label: '45+ min' },
]

const TAG_FILTERS = [
  { value: null, label: 'All' },
  { value: 'Quick', label: 'Quick' },
  { value: 'Meatless', label: 'Meatless' },
  { value: 'High Protein', label: 'High protein' },
]

export default function Home() {
  const { items: fridgeItems } = useFridge()
  const useUpSoonItems = fridgeItems.filter((i) => i.daysLeft <= 2)
  const [timeFilter, setTimeFilter] = useState(null) // null | 15 | 30 | 45 | 46
  const [tagFilter, setTagFilter] = useState(null)

  const suggestedRecipes = useMemo(() => {
    let list = [...recipes]
      .map((r) => ({ recipe: r, ...scoreRecipe(r, fridgeItems) }))
      .filter(({ total }) => total > 0)
      .filter(({ canMake }) => canMake)

    if (tagFilter) {
      list = list.filter(({ recipe }) => (recipe.tags || []).includes(tagFilter))
    }
    if (timeFilter !== null) {
      if (timeFilter === 46) {
        list = list.filter(({ recipe }) => (recipe.cookTime ?? 0) >= 45)
      } else {
        list = list.filter(({ recipe }) => (recipe.cookTime ?? 999) <= timeFilter)
      }
    }

    list.sort((a, b) => (a.recipe.cookTime ?? 999) - (b.recipe.cookTime ?? 999))

    return list.map(({ recipe }) => recipe).slice(0, 9)
  }, [fridgeItems, timeFilter, tagFilter])

  const canMakeCount = useMemo(() => {
    return recipes.filter((r) => {
      const ings = getRecipeIngredients(r)
      return ings.length > 0 && ings.every((ing) => ingredientInFridge(ing, fridgeItems))
    }).length
  }, [fridgeItems])

  return (
    <PageContainer>
      <div className="page-content">
        <section className="mb-8 sm:mb-10">
          <div className="card rounded-3xl p-8 shadow-soft sm:p-10">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl lg:text-[2.5rem] leading-tight">
              Cook it before you lose it.
            </h1>
            <p className="mt-4 text-base text-ink-muted leading-relaxed sm:text-lg max-w-xl">
              Turn what you have into meals you’ll love—no more forgotten leftovers.
            </p>
          </div>
        </section>

        <SectionHeader
          title="Use up soon"
          subtitle="Ingredients expiring in 1–2 days"
        />
        {useUpSoonItems.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-3 sm:mb-10 sm:gap-4">
            {useUpSoonItems.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-tomato/10 px-4 py-2.5 text-sm font-medium text-tomato-dark"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-tomato/15 text-xs font-semibold">
                  {(item.name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="truncate max-w-[140px] sm:max-w-none">{item.name}</span>
                <span className="shrink-0">({item.daysLeft}d)</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="card mb-8 rounded-3xl p-6 sm:mb-10 sm:p-8">
            <p className="text-base text-ink-muted leading-relaxed">
              Nothing expiring in the next 2 days. You're all set.
            </p>
          </div>
        )}

        <SectionHeader
          title="Suggested for you"
          subtitle="Recipes you can cook with what you have"
        />
        <div className="mb-6 flex flex-col gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-muted">Time to cook</p>
            <div className="flex flex-wrap gap-2">
              {TIME_FILTERS.map(({ value, label }) => (
                <FilterPill
                  key={label}
                  label={label}
                  active={timeFilter === value}
                  onClick={() => setTimeFilter(value)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink-muted">Type</p>
            <div className="flex flex-wrap gap-2">
              {TAG_FILTERS.map(({ value, label }) => (
                <FilterPill
                  key={label}
                  label={label}
                  active={tagFilter === value}
                  onClick={() => setTagFilter(value)}
                />
              ))}
            </div>
          </div>
        </div>
        {suggestedRecipes.length === 0 ? (
          <div className="card rounded-3xl p-10 text-center sm:p-12">
            <p className="text-base text-ink-muted leading-relaxed">
              {canMakeCount === 0
                ? 'No recipes yet — add more ingredients to your fridge to see suggestions.'
                : 'No recipes match your filters. Try changing time or type.'}
            </p>
            <button
              type="button"
              onClick={() => { setTimeFilter(null); setTagFilter(null) }}
              className="btn-secondary mt-4"
            >
              Clear filters
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {suggestedRecipes.map((recipe) => {
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
        )}
      </div>
    </PageContainer>
  )
}
