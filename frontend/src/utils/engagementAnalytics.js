import { getAnalyticsState, saveAnalyticsState } from '../api/client'

const DEFAULT_STATE = {
  totalPoints: 0,
  savingsTotal: 0,
  wasteItemsRescued: 0,
  recipesCooked: 0,
  recipeHistory: [],
  daily: {},
  weekly: {},
  streak: {
    current: 0,
    best: 0,
    lastCookDate: null,
  },
  badges: [],
  claimedQuestIds: [],
  events: [],
}

function toDateKey(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function getWeekStartKey(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diffToMonday = (day + 6) % 7
  d.setDate(d.getDate() - diffToMonday)
  d.setHours(0, 0, 0, 0)
  return toDateKey(d)
}

function mergeState(raw) {
  return {
    ...DEFAULT_STATE,
    ...(raw || {}),
    streak: {
      ...DEFAULT_STATE.streak,
      ...(raw?.streak || {}),
    },
    recipeHistory: Array.isArray(raw?.recipeHistory) ? raw.recipeHistory : [],
    daily: raw?.daily && typeof raw.daily === 'object' ? raw.daily : {},
    weekly: raw?.weekly && typeof raw.weekly === 'object' ? raw.weekly : {},
    badges: Array.isArray(raw?.badges) ? raw.badges : [],
    claimedQuestIds: Array.isArray(raw?.claimedQuestIds) ? raw.claimedQuestIds : [],
    events: Array.isArray(raw?.events) ? raw.events : [],
  }
}

let cachedState = mergeState(null)
let cachedToken = null

async function loadState(token) {
  if (!token) {
    cachedState = mergeState(null)
    cachedToken = null
    return cachedState
  }

  if (cachedToken === token) {
    return cachedState
  }

  try {
    const data = await getAnalyticsState(token)
    cachedState = mergeState(data?.analytics || {})
  } catch {
    cachedState = mergeState(null)
  }

  cachedToken = token
  return cachedState
}

async function saveState(token, state) {
  if (!token) return
  cachedState = mergeState(state)
  cachedToken = token
  await saveAnalyticsState(token, cachedState)
}

function withBuckets(state, dateKey, weekKey, { points = 0, recipesCooked = 0, wasteItems = 0, savings = 0 }) {
  const daily = {
    points: 0,
    recipesCooked: 0,
    wasteItems: 0,
    savings: 0,
    ...(state.daily[dateKey] || {}),
  }
  const weekly = {
    points: 0,
    recipesCooked: 0,
    wasteItems: 0,
    savings: 0,
    ...(state.weekly[weekKey] || {}),
  }

  state.daily[dateKey] = {
    points: Number(daily.points || 0) + points,
    recipesCooked: Number(daily.recipesCooked || 0) + recipesCooked,
    wasteItems: Number(daily.wasteItems || 0) + wasteItems,
    savings: Number(daily.savings || 0) + savings,
  }

  state.weekly[weekKey] = {
    points: Number(weekly.points || 0) + points,
    recipesCooked: Number(weekly.recipesCooked || 0) + recipesCooked,
    wasteItems: Number(weekly.wasteItems || 0) + wasteItems,
    savings: Number(weekly.savings || 0) + savings,
  }
}

function addEvent(state, type, payload = {}) {
  state.events.unshift({
    type,
    at: new Date().toISOString(),
    payload,
  })
  if (state.events.length > 300) {
    state.events = state.events.slice(0, 300)
  }
}

function updateCookStreak(streak, dateKey) {
  if (!streak.lastCookDate) {
    streak.current = 1
    streak.best = Math.max(streak.best, 1)
    streak.lastCookDate = dateKey
    return
  }

  if (streak.lastCookDate === dateKey) {
    return
  }

  const last = new Date(streak.lastCookDate)
  const nextDay = new Date(last)
  nextDay.setDate(last.getDate() + 1)

  if (toDateKey(nextDay) === dateKey) {
    streak.current += 1
  } else {
    streak.current = 1
  }

  streak.best = Math.max(streak.best, streak.current)
  streak.lastCookDate = dateKey
}

function refreshBadges(state) {
  const next = new Set(state.badges)

  if (state.recipesCooked >= 1) next.add('First Cook')
  if (state.recipesCooked >= 10) next.add('Home Chef')
  if (state.wasteItemsRescued >= 10) next.add('Waste Warrior')
  if (state.savingsTotal >= 25) next.add('Savings Starter')
  if (state.streak.best >= 3) next.add('3-Day Streak')
  if (state.streak.best >= 7) next.add('7-Day Streak')

  state.badges = Array.from(next)
}

export async function recordRecipeCooked(token, { recipeId, recipeTitle, totalTime, missingCount = 0 }) {
  const state = await loadState(token)
  const dateKey = toDateKey(new Date())
  const weekKey = getWeekStartKey(new Date())

  const basePoints = 50
  const noMissingBonus = missingCount === 0 ? 25 : 0
  const pointsAwarded = basePoints + noMissingBonus
  const savingsAwarded = missingCount === 0 ? 7.5 : 3.5
  const rescuedItems = missingCount === 0 ? 2 : 1

  state.totalPoints += pointsAwarded
  state.recipesCooked += 1
  state.savingsTotal = Number((state.savingsTotal + savingsAwarded).toFixed(2))
  state.wasteItemsRescued += rescuedItems

  withBuckets(state, dateKey, weekKey, {
    points: pointsAwarded,
    recipesCooked: 1,
    wasteItems: rescuedItems,
    savings: savingsAwarded,
  })

  updateCookStreak(state.streak, dateKey)

  state.recipeHistory.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    recipeId: recipeId || null,
    title: recipeTitle || 'Recipe',
    cookedAt: new Date().toISOString(),
    totalTime: Number.isFinite(Number(totalTime)) ? Number(totalTime) : null,
    missingCount,
    pointsAwarded,
    savingsAwarded,
  })
  if (state.recipeHistory.length > 120) {
    state.recipeHistory = state.recipeHistory.slice(0, 120)
  }

  addEvent(state, 'recipe_cooked', {
    recipeId,
    recipeTitle,
    totalTime,
    missingCount,
    pointsAwarded,
  })

  refreshBadges(state)
  await saveState(token, state)
  return buildSnapshot(state)
}

export async function recordWasteRescued(token, { count = 1, source = 'shopping' } = {}) {
  const safeCount = Math.max(1, Number(count) || 1)
  const state = await loadState(token)
  const dateKey = toDateKey(new Date())
  const weekKey = getWeekStartKey(new Date())

  const pointsAwarded = safeCount * 10
  const savingsAwarded = Number((safeCount * 1.5).toFixed(2))

  state.totalPoints += pointsAwarded
  state.wasteItemsRescued += safeCount
  state.savingsTotal = Number((state.savingsTotal + savingsAwarded).toFixed(2))

  withBuckets(state, dateKey, weekKey, {
    points: pointsAwarded,
    wasteItems: safeCount,
    savings: savingsAwarded,
  })

  addEvent(state, 'waste_rescued', {
    count: safeCount,
    source,
    pointsAwarded,
  })

  refreshBadges(state)
  await saveState(token, state)
  return buildSnapshot(state)
}

function buildQuests(state) {
  const todayKey = toDateKey(new Date())
  const weekKey = getWeekStartKey(new Date())
  const today = state.daily[todayKey] || { points: 0, recipesCooked: 0, wasteItems: 0, savings: 0 }
  const week = state.weekly[weekKey] || { points: 0, recipesCooked: 0, wasteItems: 0, savings: 0 }

  const quests = [
    {
      id: `daily-cook-1-${todayKey}`,
      period: 'Daily',
      title: 'Cook 1 recipe',
      progress: Number(today.recipesCooked || 0),
      target: 1,
      reward: 40,
    },
    {
      id: `daily-rescue-3-${todayKey}`,
      period: 'Daily',
      title: 'Rescue 3 food items',
      progress: Number(today.wasteItems || 0),
      target: 3,
      reward: 30,
    },
    {
      id: `daily-points-120-${todayKey}`,
      period: 'Daily',
      title: 'Earn 120 points',
      progress: Number(today.points || 0),
      target: 120,
      reward: 35,
    },
    {
      id: `weekly-cook-5-${weekKey}`,
      period: 'Weekly',
      title: 'Cook 5 recipes',
      progress: Number(week.recipesCooked || 0),
      target: 5,
      reward: 120,
    },
    {
      id: `weekly-rescue-12-${weekKey}`,
      period: 'Weekly',
      title: 'Rescue 12 food items',
      progress: Number(week.wasteItems || 0),
      target: 12,
      reward: 100,
    },
    {
      id: `weekly-save-25-${weekKey}`,
      period: 'Weekly',
      title: 'Save $25',
      progress: Number(week.savings || 0),
      target: 25,
      reward: 90,
    },
  ]

  return quests.map((quest) => {
    const completed = quest.progress >= quest.target
    const claimed = state.claimedQuestIds.includes(quest.id)
    return {
      ...quest,
      completed,
      claimed,
      claimable: completed && !claimed,
      progressPercent: Math.min(100, Math.round((quest.progress / quest.target) * 100)),
    }
  })
}

export async function claimQuest(token, questId) {
  const state = await loadState(token)
  const quests = buildQuests(state)
  const quest = quests.find((q) => q.id === questId)
  if (!quest || !quest.claimable) return buildSnapshot(state)

  state.claimedQuestIds.push(quest.id)
  state.totalPoints += quest.reward

  const dateKey = toDateKey(new Date())
  const weekKey = getWeekStartKey(new Date())
  withBuckets(state, dateKey, weekKey, {
    points: quest.reward,
  })

  addEvent(state, 'quest_claimed', {
    questId: quest.id,
    reward: quest.reward,
  })

  refreshBadges(state)
  await saveState(token, state)
  return buildSnapshot(state)
}

export async function clearAnalyticsData(token) {
  const state = mergeState(null)
  await saveState(token, state)
  return buildSnapshot(state)
}

function buildSnapshot(state) {
  const todayKey = toDateKey(new Date())
  const weekKey = getWeekStartKey(new Date())
  const today = state.daily[todayKey] || { points: 0, recipesCooked: 0, wasteItems: 0, savings: 0 }
  const week = state.weekly[weekKey] || { points: 0, recipesCooked: 0, wasteItems: 0, savings: 0 }

  const cookTimes = state.recipeHistory
    .map((entry) => Number(entry.totalTime))
    .filter((value) => Number.isFinite(value) && value > 0)

  const averageCookTime = cookTimes.length
    ? Math.round(cookTimes.reduce((sum, value) => sum + value, 0) / cookTimes.length)
    : null

  const recipeCounts = state.recipeHistory.reduce((acc, item) => {
    const key = item.title || 'Recipe'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const topRecipes = Object.entries(recipeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([title, count]) => ({ title, count }))

  const quests = buildQuests(state)

  return {
    totalPoints: state.totalPoints,
    savingsTotal: Number(state.savingsTotal.toFixed(2)),
    wasteItemsRescued: state.wasteItemsRescued,
    recipesCooked: state.recipesCooked,
    streak: {
      current: state.streak.current,
      best: state.streak.best,
      lastCookDate: state.streak.lastCookDate,
    },
    badges: state.badges,
    recipeHistory: state.recipeHistory,
    topRecipes,
    averageCookTime,
    today,
    week,
    quests,
    recentEvents: state.events.slice(0, 8),
  }
}

export function getAnalyticsSnapshot() {
  return buildSnapshot(cachedState)
}

export async function loadAnalyticsSnapshot(token) {
  const state = await loadState(token)
  return buildSnapshot(state)
}
