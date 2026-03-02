import { useEffect, useRef, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe } from '../utils/recipeFridge'
import { getRecipes, createRecipe } from '../api/client'
import { adaptRecipe } from '../utils/recipeAdapter'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'

const COURSE_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'Lunch', label: 'Lunch' },
  { value: 'Dinner', label: 'Dinner' },
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best match' },
  { value: 'expiring', label: 'Expiring soon' },
  { value: 'cook_time', label: 'Cook time' },
  { value: 'rating', label: 'Rating' },
  { value: 'vote_count', label: 'Most votes' },
]

const MAX_TIME_OPTIONS = [
  { value: 'Any', label: 'Any' },
  { value: '15', label: 'Under 15 min' },
  { value: '30', label: 'Under 30 min' },
  { value: '45', label: 'Under 45 min' },
  { value: '60', label: 'Under 60 min' },
]

function StyledDropdown({ id, label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = options.find((option) => option.value === value) || options[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink-muted">
        {label}
      </label>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="input flex w-full items-center justify-between gap-3 text-left"
      >
        <span>{selected?.label}</span>
        <span className="text-ink-muted">▾</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-cream-200 bg-white p-1 shadow-soft"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  option.value === value
                    ? 'bg-sage/15 font-semibold text-sage-dark'
                    : 'text-ink hover:bg-cream-100'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default function RecipeLibrary() {
  const auth = useAuth()
  const { items: fridgeItems } = useFridge()
  const [searchParams, setSearchParams] = useSearchParams()
  const querySearch = searchParams.get('q') || ''
  const rawQueryCourse = searchParams.get('course') || 'All'
  const rawQueryMaxTime = searchParams.get('maxTime') || 'Any'
  const querySort = searchParams.get('sort') || 'relevance'
  const source = searchParams.get('source') || ''
  const queryCourse = COURSE_OPTIONS.some((option) => option.value === rawQueryCourse)
    ? rawQueryCourse
    : 'All'
  const queryMaxTime = MAX_TIME_OPTIONS.some((option) => option.value === rawQueryMaxTime)
    ? rawQueryMaxTime
    : 'Any'
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(querySearch)
  const [course, setCourse] = useState(queryCourse)
  const [maxTime, setMaxTime] = useState(queryMaxTime)
  const [sortBy, setSortBy] = useState(querySort)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const addModalRef = useRef(null)
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    course: 'Dinner',
    prepTime: '',
    cookTime: '',
    image: '',
    url: '',
    ingredientsText: '',
    stepsText: '',
  })

  useEffect(() => {
    if (!addOpen) return
    const onEscape = (event) => {
      if (event.key === 'Escape') setAddOpen(false)
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [addOpen])

  useEffect(() => {
    if (!addOpen) return
    const id = window.setTimeout(() => {
      const el = addModalRef.current?.querySelector('input, textarea, button, select')
      el?.focus?.()
    }, 0)
    return () => window.clearTimeout(id)
  }, [addOpen])

  const resetNewRecipe = () => {
    setNewRecipe({
      title: '',
      course: 'Dinner',
      prepTime: '',
      cookTime: '',
      image: '',
      url: '',
      ingredientsText: '',
      stepsText: '',
    })
  }

  const parseLines = (text) =>
    (text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

  const handleCreateRecipe = async (e) => {
  e.preventDefault()

  const title = (newRecipe.title || '').trim()
  const ingredients = parseLines(newRecipe.ingredientsText)
  const steps = parseLines(newRecipe.stepsText)
  const prepTime = Number(newRecipe.prepTime || 0) || undefined
  const cookTime = Number(newRecipe.cookTime || 0) || undefined
  const totalTime = (prepTime || 0) + (cookTime || 0) || undefined

  if (!title) return
  if (ingredients.length === 0) return
  if (steps.length === 0) return

  const payload = {
    title,
    course: newRecipe.course || 'Dinner',
    prep_time: prepTime,
    cook_time: cookTime,
    total_time: totalTime,
    image: (newRecipe.image || '').trim() || null,
    url: (newRecipe.url || '').trim() || null,
    ingredients,
    steps,
  }

  try {
    const data = await createRecipe(auth.token, payload)

    const raw = data.recipe || data
    const createdRecipe = adaptRecipe(raw)

    setRecipes((prev) => [createdRecipe, ...prev])
    setAddOpen(false)
    resetNewRecipe()
  } catch (err) {
    setError(err.message || 'Unable to create recipe')
  }
}

  useEffect(() => {
    setSearch(querySearch)
    setCourse(queryCourse)
    setMaxTime(queryMaxTime)
    setSortBy(querySort)
  }, [querySearch, queryCourse, queryMaxTime, querySort])

  useEffect(() => {
    const next = {}
    if (search.trim()) next.q = search.trim()
    if (course !== 'All') next.course = course
    if (maxTime !== 'Any') next.maxTime = maxTime
    if (sortBy !== 'relevance') next.sort = sortBy
    if (source) next.source = source
    setSearchParams(next, { replace: true })
  }, [search, course, maxTime, sortBy, source, setSearchParams])

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

        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <span className="text-lg leading-none">＋</span>
            Add recipe
          </button>
        </div>

        {addOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setAddOpen(false)
            }}
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <div
  ref={addModalRef}
  className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-soft max-h-[85vh] flex flex-col"
>
              <div className="flex items-start justify-between gap-4 border-b border-cream-200 p-6 sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-ink">Add a recipe</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Title, ingredients, and steps are required.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                  setAddOpen(false)
                  resetNewRecipe()
                }}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-200 bg-white text-lg font-semibold text-ink-muted transition hover:bg-cream-100 hover:text-ink"
                >
                ✕
              </button>
              </div>

             <form onSubmit={handleCreateRecipe} className="p-6 overflow-y-auto">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="new-title" className="mb-2 block text-sm font-medium text-ink-muted">
                      Title <span className="text-tomato-dark">*</span>
                    </label>
                    <input
                      id="new-title"
                      type="text"
                      value={newRecipe.title}
                      onChange={(e) => setNewRecipe((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Lemon Garlic Pasta"
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <StyledDropdown
                      id="new-course"
                      label="Meal type"
                      value={newRecipe.course}
                      onChange={(value) => setNewRecipe((prev) => ({ ...prev, course: value }))}
                      options={COURSE_OPTIONS.filter((o) => o.value !== 'All')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-prep" className="mb-2 block text-sm font-medium text-ink-muted">
                        Prep (min)
                      </label>
                      <input
                        id="new-prep"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={newRecipe.prepTime}
                        onChange={(e) => setNewRecipe((prev) => ({ ...prev, prepTime: e.target.value }))}
                        placeholder="10"
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-cook" className="mb-2 block text-sm font-medium text-ink-muted">
                        Cook (min)
                      </label>
                      <input
                        id="new-cook"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={newRecipe.cookTime}
                        onChange={(e) => setNewRecipe((prev) => ({ ...prev, cookTime: e.target.value }))}
                        placeholder="20"
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="new-image" className="mb-2 block text-sm font-medium text-ink-muted">
                      Image URL (optional)
                    </label>
                    <input
                      id="new-image"
                      type="url"
                      value={newRecipe.image}
                      onChange={(e) => setNewRecipe((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                      className="input w-full"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="new-url" className="mb-2 block text-sm font-medium text-ink-muted">
                      Original recipe link (optional)
                    </label>
                    <input
                      id="new-url"
                      type="url"
                      value={newRecipe.url}
                      onChange={(e) => setNewRecipe((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                      className="input w-full"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="new-ingredients" className="mb-2 block text-sm font-medium text-ink-muted">
                      Ingredients (one per line) <span className="text-tomato-dark">*</span>
                    </label>
                    <textarea
                      id="new-ingredients"
                      rows={5}
                      value={newRecipe.ingredientsText}
                      onChange={(e) => setNewRecipe((prev) => ({ ...prev, ingredientsText: e.target.value }))}
                      placeholder={`e.g.\nSpaghetti\nGarlic\nOlive oil\nLemon`}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="new-steps" className="mb-2 block text-sm font-medium text-ink-muted">
                      Steps (one per line) <span className="text-tomato-dark">*</span>
                    </label>
                    <textarea
                      id="new-steps"
                      rows={6}
                      value={newRecipe.stepsText}
                      onChange={(e) => setNewRecipe((prev) => ({ ...prev, stepsText: e.target.value }))}
                      placeholder={`e.g.\nBoil pasta.\nSauté garlic in oil.\nToss with lemon and pasta.`}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sticky bottom-0 bg-white pt-4 border-t border-cream-200">
                  <button
                    type="button"
                    onClick={() => {
                      setAddOpen(false)
                      resetNewRecipe()
                    }}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto"
                  >
                    Save recipe
                  </button>
                </div>

                <p className="mt-3 text-xs text-ink-muted">
                </p>
              </form>
            </div>
          </div>
        ) : null}

        {search.trim() && source === 'use-up-soon' ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-tomato/20 bg-tomato/5 px-4 py-3 text-sm">
            <p className="font-medium text-tomato-dark">
              Showing recipes that can use <span className="font-semibold">{search.trim()}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                const next = {}
                if (course !== 'All') next.course = course
                if (maxTime !== 'Any') next.maxTime = maxTime
                if (sortBy !== 'relevance') next.sort = sortBy
                setSearchParams(next, { replace: true })
              }}
              className="rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-cream-100"
            >
              Show all recipes
            </button>
          </div>
        ) : null}

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
              <StyledDropdown
                id="sortBy"
                label="Sort by"
                value={sortBy}
                onChange={setSortBy}
                options={SORT_OPTIONS}
              />
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
                <StyledDropdown
                  id="course"
                  label="Meal type"
                  value={course}
                  onChange={setCourse}
                  options={COURSE_OPTIONS}
                />
              </div>
              <div>
                <StyledDropdown
                  id="maxTime"
                  label="Max cook time"
                  value={maxTime}
                  onChange={setMaxTime}
                  options={MAX_TIME_OPTIONS}
                />
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