import { useEffect, useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import Modal from '../components/Modal'
import { getMealPlanWeek, getRecipes, saveMealPlanWeek } from '../api/client'
import { adaptRecipe } from '../utils/recipeAdapter'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DEFAULT_MEAL_TYPES = ['breakfast', 'lunch', 'dinner']
const MAX_MEAL_TYPES = 10

function startOfWeek(date = new Date()) {
  const next = new Date(date)
  const diff = (next.getDay() + 6) % 7
  next.setDate(next.getDate() - diff)
  next.setHours(0, 0, 0, 0)
  return next
}

function toDateKey(date) {
  const d = new Date(date)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function formatWeekRange(start) {
  const begin = new Date(start)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${begin.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric' }
  )}`
}

function formatDateKey(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return ''
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return dateKey
  return new Date(year, month - 1, day).toLocaleDateString()
}

function titleizeMealType(value) {
  const slot = String(value || '')
  return slot
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function cleanMealType(value) {
  const name = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')

  if (!name) return null
  if (!/^[a-z0-9_]+$/.test(name)) return null
  return name
}

function resolveMealTypes(plan) {
  const incoming = plan && Array.isArray(plan.slots) ? plan.slots : null
  const base = incoming && incoming.length ? incoming : DEFAULT_MEAL_TYPES
  const unique = []
  for (const slot of base) {
    const cleaned = cleanMealType(slot)
    if (cleaned && !unique.includes(cleaned)) unique.push(cleaned)
  }
  return unique.length ? unique.slice(0, MAX_MEAL_TYPES) : [...DEFAULT_MEAL_TYPES]
}

function emptyPlanForWeek(weekStart, mealTypes = DEFAULT_MEAL_TYPES) {
  const slots = Array.isArray(mealTypes) && mealTypes.length ? mealTypes : DEFAULT_MEAL_TYPES

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)

    const meals = {}
    slots.forEach((slot) => {
      meals[slot] = null
    })

    return {
      day: date.toLocaleDateString(undefined, { weekday: 'short' }),
      date: toDateKey(date),
      meals,
    }
  })

  return {
    week_start: toDateKey(weekStart),
    slots,
    days,
  }
}

function normalizePlan(plan, weekStart) {
  const slots = resolveMealTypes(plan)
  const fallback = emptyPlanForWeek(weekStart, slots)
  if (!plan || !Array.isArray(plan.days)) return fallback

  return {
    ...fallback,
    ...plan,
    slots,
    days: fallback.days.map((day, index) => {
      const current = plan.days[index] || {}
      const currentMeals = current && typeof current.meals === 'object' && current.meals ? current.meals : {}

      const meals = {}
      slots.forEach((slot) => {
        meals[slot] = Object.prototype.hasOwnProperty.call(currentMeals, slot) ? currentMeals[slot] : day.meals[slot]
      })

      return {
        ...day,
        ...current,
        meals,
      }
    }),
  }
}

export default function MealPlanner() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [plan, setPlan] = useState(() => emptyPlanForWeek(startOfWeek(new Date()), DEFAULT_MEAL_TYPES))
  const [allRecipes, setAllRecipes] = useState([])
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [loadingRecipes, setLoadingRecipes] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null) // { dayIndex, mealType }
  const [addModalSearch, setAddModalSearch] = useState('')
  const [quickOnly, setQuickOnly] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedDiet, setSelectedDiet] = useState('all')
  const [maxMinutes, setMaxMinutes] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [confirmClearWeekOpen, setConfirmClearWeekOpen] = useState(false)
  const [lockNotice, setLockNotice] = useState('')
  const [addTabOpen, setAddTabOpen] = useState(false)
  const [newTabName, setNewTabName] = useState('')
  const [newTabError, setNewTabError] = useState('')

  const weekKey = toDateKey(weekStart)
  const todayKey = toDateKey(new Date())

  const mealTypes = useMemo(() => resolveMealTypes(plan), [plan])

  useEffect(() => {
    let isMounted = true

    async function loadRecipes() {
      if (!auth.token) return
      setLoadingRecipes(true)
      try {
        const data = await getRecipes(auth.token, { limit: 200, ignore_prefs: true })
        if (!isMounted) return
        setAllRecipes((data.recipes || []).map(adaptRecipe))
      } catch (err) {
        if (!isMounted) return
        setError(err.message || 'Unable to load recipes')
      } finally {
        if (isMounted) setLoadingRecipes(false)
      }
    }

    loadRecipes()
    return () => {
      isMounted = false
    }
  }, [auth.token])

  useEffect(() => {
    let isMounted = true

    async function loadPlan() {
      if (!auth.token) return
      setLoadingPlan(true)
      setError(null)
      try {
        const data = await getMealPlanWeek(auth.token, weekKey)
        if (!isMounted) return
        setPlan(normalizePlan(data.plan, weekStart))
      } catch (err) {
        if (!isMounted) return
        setError(err.message || 'Unable to load meal plan')
        setPlan(emptyPlanForWeek(weekStart, DEFAULT_MEAL_TYPES))
      } finally {
        if (isMounted) setLoadingPlan(false)
      }
    }

    loadPlan()
    return () => {
      isMounted = false
    }
  }, [auth.token, weekKey, weekStart])

  const persistPlan = async (nextPlan) => {
    if (!auth.token) return
    setSaving(true)
    try {
      const data = await saveMealPlanWeek(auth.token, weekKey, nextPlan)

      const serverPlan = data && data.plan ? data.plan : null
      const normalizedServer = normalizePlan(serverPlan, weekStart)

      const serverSlotsOk = normalizedServer && Array.isArray(normalizedServer.slots) && normalizedServer.slots.length > 0
      const localSlotsOk = nextPlan && Array.isArray(nextPlan.slots) && nextPlan.slots.length > 0

      const merged = serverSlotsOk
        ? normalizedServer
        : normalizePlan(
            {
              ...normalizedServer,
              slots: localSlotsOk ? nextPlan.slots : normalizedServer.slots,
            },
            weekStart
          )

      setPlan(merged)
    } catch (err) {
      setError(err.message || 'Unable to save meal plan')
    } finally {
      setSaving(false)
    }
  }

  const filteredRecipes = useMemo(() => {
    const query = addModalSearch.trim().toLowerCase()
    const maxTimeValue = Number(maxMinutes)
    let list = quickOnly ? allRecipes.filter((recipe) => (recipe.totalTime || 999) <= 30) : [...allRecipes]

    if (selectedCourse !== 'all') {
      list = list.filter((recipe) => (recipe.course || '').toLowerCase() === selectedCourse)
    }

    if (selectedDiet !== 'all') {
      list = list.filter((recipe) => (recipe.diet || '').toLowerCase() === selectedDiet)
    }

    if (Number.isFinite(maxTimeValue) && maxTimeValue > 0) {
      list = list.filter((recipe) => (recipe.totalTime || 999) <= maxTimeValue)
    }

    if (query) {
      list = list.filter((recipe) => {
        const inTitle = recipe.title?.toLowerCase().includes(query)
        const inTags = (recipe.tags || []).some((tag) => tag.toLowerCase().includes(query))
        return inTitle || inTags
      })
    }

    if (sortBy === 'time-asc') {
      list.sort((a, b) => (a.totalTime || 999) - (b.totalTime || 999))
    } else if (sortBy === 'time-desc') {
      list.sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }

    return list
  }, [allRecipes, addModalSearch, quickOnly, selectedCourse, selectedDiet, maxMinutes, sortBy])

  const courseOptions = useMemo(() => {
    return Array.from(
      new Set(
        allRecipes
          .map((recipe) => (recipe.course || '').trim())
          .filter(Boolean)
          .map((value) => value.toLowerCase())
      )
    ).sort()
  }, [allRecipes])

  const dietOptions = useMemo(() => {
    return Array.from(
      new Set(
        allRecipes
          .map((recipe) => (recipe.diet || '').trim())
          .filter(Boolean)
          .map((value) => value.toLowerCase())
      )
    ).sort()
  }, [allRecipes])

  const selectedSlotLabel = useMemo(() => {
    if (!selectedSlot) return ''
    const day = plan.days[selectedSlot.dayIndex]
    if (!day) return ''
    return `${day.day} ${formatDateKey(day.date)} · ${titleizeMealType(selectedSlot.mealType)}`
  }, [selectedSlot, plan.days])

  const resetModalFilters = () => {
    setAddModalSearch('')
    setQuickOnly(false)
    setSelectedCourse('all')
    setSelectedDiet('all')
    setMaxMinutes('')
    setSortBy('relevance')
  }

  const weekEndKey = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return toDateKey(end)
  }, [weekStart])

  const isPastWeek = weekEndKey < todayKey
  const isReadOnlyWeek = isPastWeek

  useEffect(() => {
    if (!selectedSlot) return
    const day = plan.days[selectedSlot.dayIndex]
    if (!day || day.date < todayKey || isPastWeek || !mealTypes.includes(selectedSlot.mealType)) {
      setSelectedSlot(null)
    }
  }, [selectedSlot, plan.days, todayKey, isPastWeek, mealTypes])

  useEffect(() => {
    if (!lockNotice) return
    const timeoutId = setTimeout(() => setLockNotice(''), 2200)
    return () => clearTimeout(timeoutId)
  }, [lockNotice])

  const assignedCount = useMemo(() => {
    return plan.days.reduce((sum, day) => {
      return sum + mealTypes.filter((mealType) => !!day.meals?.[mealType]).length
    }, 0)
  }, [plan, mealTypes])

  const totalSlots = mealTypes.length * 7

  const openAssignModal = (dayIndex, mealType) => {
    const day = plan.days[dayIndex]
    if (!day || day.date < todayKey || isPastWeek) {
      setLockNotice('Past days and archived weeks are read-only.')
      return
    }
    setSelectedSlot({ dayIndex, mealType })
    resetModalFilters()
  }

  const assignRecipe = async (dayIndex, mealType, recipe) => {
    const day = plan.days[dayIndex]
    if (!day || day.date < todayKey || isPastWeek) return
    const nextPlan = {
      ...plan,
      slots: mealTypes,
      days: plan.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: {
                  id: recipe.id,
                  title: recipe.title,
                  image: recipe.image || null,
                  totalTime: recipe.totalTime || null,
                },
              },
            }
          : day
      ),
    }
    await persistPlan(nextPlan)
    setSelectedSlot(null)
    resetModalFilters()
  }

  const clearSlot = async (dayIndex, mealType) => {
    const day = plan.days[dayIndex]
    if (!day || day.date < todayKey || isPastWeek) return
    const nextPlan = {
      ...plan,
      slots: mealTypes,
      days: plan.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: null,
              },
            }
          : day
      ),
    }
    await persistPlan(nextPlan)
  }

  const clearDay = async (dayIndex) => {
    const day = plan.days[dayIndex]
    if (!day || day.date < todayKey || isPastWeek) return

    const nextMeals = {}
    mealTypes.forEach((slot) => {
      nextMeals[slot] = null
    })

    const nextPlan = {
      ...plan,
      slots: mealTypes,
      days: plan.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              meals: nextMeals,
            }
          : day
      ),
    }
    await persistPlan(nextPlan)
  }

  const clearWeek = async () => {
    if (isPastWeek) {
      setLockNotice('Past weeks are archived and cannot be edited.')
      return
    }
    await persistPlan(emptyPlanForWeek(weekStart, mealTypes))
    setSelectedSlot(null)
    setConfirmClearWeekOpen(false)
  }

  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date()))
  }

  const moveWeek = (offset) => {
    const next = new Date(weekStart)
    next.setDate(next.getDate() + offset * 7)
    setWeekStart(startOfWeek(next))
  }

  const openAddTab = () => {
    if (isPastWeek) {
      setLockNotice('Past weeks are archived and cannot be edited.')
      return
    }
    setNewTabName('')
    setNewTabError('')
    setAddTabOpen(true)
  }

  // const removeMealType = async (slot) => {
  //   if (isPastWeek) {
  //     setLockNotice('Past weeks are archived and cannot be edited.')
  //     return
  //   }
  //   if (mealTypes.length <= 1) {
  //     setLockNotice('You must keep at least one meal tab.')
  //     return
  //   }

  //   const ok = window.confirm(`Remove meal tab "${titleizeMealType(slot)}" for the whole week?`)
  //   if (!ok) return

  //   const nextSlots = mealTypes.filter((s) => s !== slot)
  //   const nextPlan = {
  //     ...plan,
  //     slots: nextSlots,
  //     days: plan.days.map((d) => {
  //       const nextMeals = {}
  //       nextSlots.forEach((s) => {
  //         nextMeals[s] = d.meals && Object.prototype.hasOwnProperty.call(d.meals, s) ? d.meals[s] : null
  //       })
  //       return { ...d, meals: nextMeals }
  //     }),
  //   }

  //   await persistPlan(nextPlan)

  //   if (selectedSlot && selectedSlot.mealType === slot) {
  //     setSelectedSlot(null)
  //     resetModalFilters()
  //   }
  // }

  const addMealTypeFromModal = async () => {
    if (isPastWeek) {
      setLockNotice('Past weeks are archived and cannot be edited.')
      return
    }
    if (mealTypes.length >= MAX_MEAL_TYPES) {
      setNewTabError(`You can add up to ${MAX_MEAL_TYPES} meal tabs.`)
      return
    }

    const cleaned = cleanMealType(newTabName)
    if (!cleaned) {
      setNewTabError('Use letters, numbers, and underscores only (e.g. pre_workout).')
      return
    }
    if (mealTypes.includes(cleaned)) {
      setNewTabError('That tab already exists.')
      return
    }

    const nextSlots = [...mealTypes, cleaned]
    const nextPlan = {
      ...plan,
      slots: nextSlots,
      days: plan.days.map((d) => ({
        ...d,
        meals: { ...(d.meals || {}), [cleaned]: null },
      })),
    }

    setPlan(nextPlan)
    setAddTabOpen(false)
    setNewTabName('')
    setNewTabError('')

    await persistPlan(nextPlan)
  }

  return (
    <PageContainer>
      <div className="page-content min-w-0">
        <SectionHeader title="Meal planner" subtitle="Plan your week with live recipes and auto-saved slots" />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-cream-200 bg-white/80 p-4 sm:mb-8 sm:p-5">
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary" onClick={() => moveWeek(-1)}>
              ← Previous
            </button>
            <button type="button" className="btn-secondary" onClick={goToCurrentWeek}>
              This week
            </button>
            <button type="button" className="btn-secondary" onClick={() => moveWeek(1)}>
              Next →
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="text-sm text-ink-muted">
              <span className="font-semibold text-ink">{formatWeekRange(weekStart)}</span>
              <span className="ml-2">
                • {assignedCount}/{totalSlots} meals planned
              </span>
              {saving ? <span className="ml-2 text-sage-dark">Saving…</span> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {mealTypes.map((slot) => (
                  <span
                    key={slot}
                    className={[
                      'inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-3 py-1 text-xs font-semibold',
                      isReadOnlyWeek ? 'opacity-60' : 'text-ink-muted',
                    ].join(' ')}
                    title={slot}
                  >
                    {titleizeMealType(slot)}
                    {/* <button
                      type="button"
                      onClick={() => removeMealType(slot)}
                      disabled={isReadOnlyWeek}
                      className="rounded-full border border-cream-200 bg-cream-50 px-2 py-0.5 text-xs font-bold text-ink-muted hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Remove ${slot}`}
                      title={isReadOnlyWeek ? 'Archived weeks are read-only' : `Remove ${slot}`}
                    >
                      −
                    </button> */}
                  </span>
                ))}
              </div>

              {/* <button
                type="button"
                onClick={openAddTab}
                disabled={isReadOnlyWeek}
                className="rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-60"
                title={isReadOnlyWeek ? 'Archived weeks are read-only' : 'Add tab'}
              >
                + Add tab
              </button> */}
            </div>
          </div>
        </div>

        {/* Message ONLY on previous (archived) weeks */}
        {isReadOnlyWeek ? (
          <div className="mb-6 rounded-2xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-ink-muted">
            <span className="font-semibold text-ink">Archived week:</span> You can view previous meal plans, but
            actions are disabled.
          </div>
        ) : null}

        {error ? <div className="card mb-6 rounded-3xl p-6 text-sm text-tomato-dark">{error}</div> : null}

        {lockNotice ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {lockNotice}
          </div>
        ) : null}

        <div className="grid gap-6">
          <div className="min-w-0">
            {loadingPlan ? (
              <div className="card rounded-3xl p-8 text-center text-ink-muted">Loading week plan…</div>
            ) : (
              <div className="space-y-4">
                {plan.days.map((day, dayIndex) => {
                  const isLocked = isReadOnlyWeek || day.date < todayKey

                  return (
                    <article
                      key={day.date}
                      className={[
                        'card rounded-3xl p-5 sm:p-6',
                        isReadOnlyWeek ? 'opacity-85 grayscale-[15%]' : '',
                      ].join(' ')}
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-ink">{day.day}</h3>
                          <p className="text-sm text-ink-muted">{formatDateKey(day.date)}</p>
                        </div>

                        {/* Always visible, but disabled when locked */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isLocked) return
                            clearDay(dayIndex)
                          }}
                          disabled={isLocked}
                          className={[
                            'rounded-full border border-cream-200 px-3 py-1.5 text-xs font-semibold',
                            isLocked
                              ? 'cursor-not-allowed bg-cream-50 text-ink-muted/70 opacity-70'
                              : 'text-ink-muted hover:bg-cream-100',
                          ].join(' ')}
                          title={isLocked ? 'This day is read-only' : 'Clear day'}
                        >
                          Clear day
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <div
                          className="grid gap-3"
                          style={{
                            gridTemplateColumns: `repeat(${mealTypes.length}, minmax(220px, 1fr))`,
                          }}
                        >
                          {mealTypes.map((mealType) => {
                            const meal = day.meals?.[mealType]
                            return (
                              <div
                                key={mealType}
                                className={[
                                  'rounded-2xl border border-cream-200 bg-cream-50 p-3',
                                  isReadOnlyWeek ? 'opacity-90' : '',
                                ].join(' ')}
                              >
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                                  {titleizeMealType(mealType)}
                                </p>

                                {meal ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-cream-200">
                                        {meal.image ? (
                                          <img src={meal.image} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center">🍽️</div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-ink">{meal.title}</p>
                                        <p className="text-xs text-ink-muted">
                                          {meal.totalTime ? `${meal.totalTime} min` : 'No time'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      {/* still usable on archived weeks */}
                                      <button
                                        type="button"
                                        onClick={() => meal.id && navigate(`/recipes/${meal.id}`)}
                                        className="rounded-full border border-cream-200 px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-cream-100"
                                      >
                                        View recipe
                                      </button>

                                      {/* visible but disabled on archived/past days */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isLocked) return
                                          clearSlot(dayIndex, mealType)
                                        }}
                                        disabled={isLocked}
                                        className={[
                                          'rounded-full border border-cream-200 px-3 py-1.5 text-xs font-semibold',
                                          isLocked
                                            ? 'cursor-not-allowed bg-cream-50 text-ink-muted/70 opacity-70'
                                            : 'text-ink-muted hover:bg-cream-100',
                                        ].join(' ')}
                                        title={isLocked ? 'This slot is read-only' : 'Remove'}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isLocked) return
                                      openAssignModal(dayIndex, mealType)
                                    }}
                                    disabled={isLocked}
                                    className={[
                                      'w-full rounded-xl border border-dashed border-cream-300 px-3 py-6 text-sm font-medium',
                                      isLocked
                                        ? 'cursor-not-allowed bg-white/70 text-ink-muted/70 opacity-70'
                                        : 'bg-white text-ink-muted hover:bg-cream-100',
                                    ].join(' ')}
                                    title={isLocked ? 'This slot is read-only' : 'Add recipe'}
                                  >
                                    + Add recipe
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </article>
                  )
                })}

                <div className="flex justify-end">
                  {/* Visible but disabled on archived weeks */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isReadOnlyWeek) return
                      setConfirmClearWeekOpen(true)
                    }}
                    disabled={isReadOnlyWeek}
                    className={[
                      'rounded-full px-5 py-2 text-sm font-semibold text-white',
                      isReadOnlyWeek ? 'cursor-not-allowed bg-rose-300 opacity-70' : 'bg-rose-600 hover:bg-rose-700',
                    ].join(' ')}
                    title={isReadOnlyWeek ? 'Archived weeks are read-only' : 'Clear full week'}
                  >
                    Clear full week
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={!!selectedSlot}
          onClose={() => {
            setSelectedSlot(null)
            resetModalFilters()
          }}
          title={
            selectedSlot
              ? `Add ${titleizeMealType(selectedSlot.mealType)} for ${plan.days[selectedSlot?.dayIndex]?.day}`
              : 'Add meal'
          }
        >
          <div className="mb-3 rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm">
            <span className="font-semibold text-ink">Slot:</span>{' '}
            <span className="text-ink-muted">{selectedSlotLabel || 'Not selected'}</span>
          </div>

          <input
            type="search"
            placeholder="Search by recipe name or tag..."
            value={addModalSearch}
            onChange={(e) => setAddModalSearch(e.target.value)}
            className="input mb-3 w-full"
            aria-label="Search recipes"
            autoFocus
          />

          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-sm text-ink-muted">
              Course
              <select
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                className="input mt-1 w-full"
              >
                <option value="all">All</option>
                {courseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-ink-muted">
              Diet
              <select
                value={selectedDiet}
                onChange={(event) => setSelectedDiet(event.target.value)}
                className="input mt-1 w-full"
              >
                <option value="all">All</option>
                {dietOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-ink-muted">
              Max minutes
              <input
                type="number"
                min="1"
                step="1"
                value={maxMinutes}
                onChange={(event) => setMaxMinutes(event.target.value)}
                placeholder="e.g. 30"
                className="input mt-1 w-full"
              />
            </label>

            <label className="text-sm text-ink-muted">
              Sort
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="input mt-1 w-full"
              >
                <option value="relevance">Relevance</option>
                <option value="time-asc">Fastest first</option>
                <option value="time-desc">Longest first</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
          </div>

          <div className="mb-4 flex items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={quickOnly}
                onChange={(event) => setQuickOnly(event.target.checked)}
                className="h-4 w-4 rounded border-cream-300 text-sage"
              />
              Quick only (≤ 30 min)
            </label>
            <button
              type="button"
              onClick={resetModalFilters}
              className="rounded-full border border-cream-200 px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-cream-100"
            >
              Reset filters
            </button>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {loadingRecipes ? 'Loading recipes…' : `${filteredRecipes.length} recipes found`}
          </p>

          <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
            {loadingRecipes ? (
              <li className="py-6 text-center text-sm text-ink-muted">Loading recipes…</li>
            ) : (
              filteredRecipes.slice(0, 80).map((recipe) => (
                <li key={recipe.id}>
                  <button
                    type="button"
                    onClick={() => selectedSlot && assignRecipe(selectedSlot.dayIndex, selectedSlot.mealType, recipe)}
                    className="flex w-full items-center gap-4 rounded-2xl bg-cream-100/80 p-4 text-left transition-colors hover:bg-sage/10 hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                      {recipe.image ? (
                        <img src={recipe.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{recipe.title}</p>
                      <p className="truncate text-sm text-ink-muted">
                        {recipe.totalTime ? `${recipe.totalTime} min` : 'No time'}
                        {recipe.course ? ` • ${recipe.course}` : ''}
                        {recipe.diet ? ` • ${recipe.diet}` : ''}
                      </p>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
          {!loadingRecipes && filteredRecipes.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-muted">No recipes match your search.</p>
          )}
        </Modal>

        <Modal
          isOpen={addTabOpen}
          onClose={() => {
            setAddTabOpen(false)
            setNewTabName('')
            setNewTabError('')
          }}
          title="Add meal tab"
        >
          <p className="mb-3 text-sm text-ink-muted">
            Add a new meal slot for the whole week (e.g. <span className="font-semibold text-ink">snack</span>,{' '}
            <span className="font-semibold text-ink">pre_workout</span>).
          </p>

          <label className="block text-sm text-ink-muted">
            Tab name
            <input
              value={newTabName}
              onChange={(e) => {
                setNewTabName(e.target.value)
                setNewTabError('')
              }}
              placeholder="snack"
              className="input mt-1 w-full"
              autoFocus
            />
          </label>

          <div className="mt-2 flex flex-wrap gap-2">
            {['snack', 'pre_workout', 'post_workout', 'dessert'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setNewTabName(preset)
                  setNewTabError('')
                }}
                className="rounded-full border border-cream-200 bg-white px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-cream-100"
              >
                {preset.replace('_', ' ')}
              </button>
            ))}
          </div>

          {newTabError ? (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {newTabError}
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setAddTabOpen(false)
                setNewTabName('')
                setNewTabError('')
              }}
              className="rounded-full border border-cream-200 px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-cream-100"
            >
              Cancel
            </button>

            {/* <button
              type="button"
              onClick={addMealTypeFromModal}
              className="rounded-full bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark"
            >
              Add tab
            </button> */}
          </div>
        </Modal>

        <Modal isOpen={confirmClearWeekOpen} onClose={() => setConfirmClearWeekOpen(false)} title="Clear full week">
          <p className="text-sm text-ink-muted">
            This removes all planned meals for {formatWeekRange(weekStart)}. This cannot be undone.
          </p>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmClearWeekOpen(false)}
              className="rounded-full border border-cream-200 px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-cream-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={clearWeek}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Yes, clear week
            </button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  )
}