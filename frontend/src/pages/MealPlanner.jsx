import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import FilterPill from '../components/FilterPill'
import RecipeCard from '../components/RecipeCard'
import { mealPlanSlots, recipes } from '../data/mockData'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']
const FILTERS = ['Quick', 'Meatless', 'Eat Out']

export default function MealPlanner() {
  const [slots, setSlots] = useState(mealPlanSlots)
  const [activeFilter, setActiveFilter] = useState(null)
  const [draggedRecipe, setDraggedRecipe] = useState(null)
  const [dragTarget, setDragTarget] = useState(null)

  const filteredRecipes = activeFilter
    ? recipes.filter((r) => r.tags.includes(activeFilter))
    : recipes

  const handleDragStart = (e, recipe) => {
    setDraggedRecipe(recipe)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', recipe.id)
  }

  const handleDragOver = (e, dayIndex, mealType) => {
    e.preventDefault()
    setDragTarget({ dayIndex, mealType })
  }

  const handleDragLeave = () => setDragTarget(null)

  const handleDrop = (e, dayIndex, mealType) => {
    e.preventDefault()
    setDragTarget(null)
    if (!draggedRecipe) return
    setSlots((prev) => {
      const next = prev.map((day, i) => {
        if (i !== dayIndex) return day
        return {
          ...day,
          meals: { ...day.meals, [mealType]: draggedRecipe },
        }
      })
      return next
    })
    setDraggedRecipe(null)
  }

  const clearSlot = (dayIndex, mealType) => {
    setSlots((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, meals: { ...day.meals, [mealType]: null } } : day
      )
    )
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title="Meal planner"
          subtitle="Drag recipes into your week"
        />
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <FilterPill
              key={f}
              label={f}
              active={activeFilter === f}
              onClick={() => setActiveFilter(activeFilter === f ? null : f)}
            />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="min-w-0 lg:col-span-2">
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[420px] border-collapse sm:min-w-[500px]">
                <thead>
                  <tr>
                    <th className="rounded-tl-2xl bg-cream-200/60 p-3 text-left text-sm font-medium text-ink">
                      Day
                    </th>
                    {MEAL_TYPES.map((m) => (
                      <th
                        key={m}
                        className="bg-cream-200/60 p-3 text-left text-sm font-medium text-ink capitalize"
                      >
                        {m}
                      </th>
                    ))}
                    <th className="rounded-tr-2xl bg-cream-200/60 p-3" />
                  </tr>
                </thead>
                <tbody>
                  {slots.map((day, dayIndex) => (
                    <tr key={day.day} className="border-b border-cream-200/60">
                      <td className="bg-white p-3 font-medium text-ink">
                        {day.day} <span className="text-ink-muted">{day.date}</span>
                      </td>
                      {MEAL_TYPES.map((mealType) => {
                        const meal = day.meals[mealType]
                        const isTarget =
                          dragTarget?.dayIndex === dayIndex && dragTarget?.mealType === mealType
                        return (
                          <td
                            key={mealType}
                            className="min-w-[120px] bg-white p-2"
                            onDragOver={(e) => handleDragOver(e, dayIndex, mealType)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, dayIndex, mealType)}
                          >
                            <div
                              className={`min-h-[80px] rounded-xl border-2 border-dashed p-2 transition-colors ${
                                isTarget ? 'border-sage bg-sage/10' : 'border-cream-300 bg-cream-50'
                              }`}
                            >
                              {meal ? (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate text-sm font-medium text-ink">
                                    {meal.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => clearSlot(dayIndex, mealType)}
                                    className="shrink-0 rounded-full p-1 text-ink-muted hover:bg-cream-200 hover:text-tomato focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                                    aria-label={`Remove ${meal.title}`}
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-ink-muted">Drop here</span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                      <td className="bg-white p-2" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="min-w-0 rounded-2xl bg-cream-200/40 p-4">
            <h3 className="mb-3 font-semibold text-ink">Recipes</h3>
            <p className="mb-3 text-sm text-ink-muted">
              Drag a recipe into the grid to plan your week.
            </p>
            <div className="flex max-h-[280px] flex-col gap-3 overflow-y-auto sm:max-h-[400px]">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, recipe)}
                  className="cursor-grab rounded-xl bg-white p-3 shadow-soft active:cursor-grabbing hover:shadow-soft-lg"
                >
                  <p className="font-medium text-ink truncate">{recipe.title}</p>
                  <p className="text-xs text-ink-muted">{recipe.tags.join(' · ')}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </PageContainer>
  )
}
