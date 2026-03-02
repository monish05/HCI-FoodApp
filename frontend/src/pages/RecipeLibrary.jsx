import { useEffect, useRef, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import { useFridge } from '../context/FridgeContext'
import { scoreRecipe } from '../utils/recipeFridge'
import { getRecipes } from '../api/client'
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
