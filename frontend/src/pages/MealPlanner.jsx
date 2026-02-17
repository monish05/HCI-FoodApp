import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import FilterPill from '../components/FilterPill'
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
        return { ...day, meals: { ...day.meals, [mealType]: draggedRecipe } }
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
      <div className="page-content min-w-0">
        <SectionHeader
          title="Meal planner"
          subtitle="Drag recipes into your week"
        />
        <div className="mb-6 flex flex-wrap gap-3 sm:mb-8">
          {FILTERS.map((f) => (
            <FilterPill
              key={f}
              label={f}
              active={activeFilter === f}
              onClick={() => setActiveFilter(activeFilter === f ? null : f)}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <aside className="card min-w-0 order-first rounded-3xl p-6 lg:order-none lg:col-span-1 sm:p-8">
            <h3 className="mb-2 text-lg font-bold text-ink">Recipes</h3>
            <p className="mb-6 text-sm text-ink-muted leading-relaxed">
              Drag a recipe into the grid below.
            </p>
            <div className="flex max-h-[240px] flex-col gap-3 overflow-y-auto sm:max-h-[320px] lg:max-h-[420px]">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, recipe)}
                  className="flex cursor-grab items-center gap-4 rounded-2xl bg-cream-100/80 p-4 transition-all duration-200 hover:shadow-soft active:cursor-grabbing"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                    {recipe.image ? (
                      <img src={recipe.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{recipe.title}</p>
                    <p className="truncate text-sm text-ink-muted">{recipe.tags.join(' · ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-2">
            <div className="card overflow-hidden rounded-3xl p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] border-collapse sm:min-w-[480px]">
                  <thead>
                    <tr>
                      <th className="bg-cream-100/80 p-4 text-left text-sm font-semibold text-ink">
                        Day
                      </th>
                      {MEAL_TYPES.map((m) => (
                        <th
                          key={m}
                          className="bg-cream-100/80 p-4 text-left text-sm font-semibold capitalize text-ink"
                        >
                          {m}
                        </th>
                      ))}
                      <th className="w-4 bg-cream-100/80" />
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((day, dayIndex) => (
                      <tr key={day.day}>
                        <td className="border-t border-cream-200/60 bg-white p-4 font-medium text-ink">
                          {day.day} <span className="font-normal text-ink-muted">{day.date}</span>
                        </td>
                        {MEAL_TYPES.map((mealType) => {
                          const meal = day.meals[mealType]
                          const isTarget =
                            dragTarget?.dayIndex === dayIndex && dragTarget?.mealType === mealType
                          return (
                            <td
                              key={mealType}
                              className="min-w-[100px] border-t border-cream-200/60 bg-white p-2 sm:min-w-[120px] sm:p-3"
                              onDragOver={(e) => handleDragOver(e, dayIndex, mealType)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, dayIndex, mealType)}
                            >
                              <div
                                className={`flex min-h-[76px] flex-col justify-center rounded-2xl p-3 transition-all duration-200 sm:min-h-[84px] ${
                                  isTarget
                                    ? 'bg-sage/10 ring-2 ring-sage/30'
                                    : 'bg-cream-100/60'
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
                                      className="shrink-0 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-tomato/10 hover:text-tomato focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                                      aria-label={`Remove ${meal.title}`}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-center text-xs text-ink-muted">Drop here</span>
                                )}
                              </div>
                            </td>
                          )
                        })}
                        <td className="border-t border-cream-200/60 bg-white p-2" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
