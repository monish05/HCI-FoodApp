import { useEffect, useMemo, useState } from 'react'
import Modal from '../components/Modal'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import {
  claimQuest,
  clearAnalyticsData,
  getAnalyticsSnapshot,
  loadAnalyticsSnapshot,
} from '../utils/engagementAnalytics'

export default function Analytics() {
  const auth = useAuth()
  const [snapshot, setSnapshot] = useState(() => getAnalyticsSnapshot())
  const [loading, setLoading] = useState(true)
  const [showResetModal, setShowResetModal] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function load() {
      if (!auth.token) {
        if (isMounted) {
          setSnapshot(getAnalyticsSnapshot())
          setLoading(false)
        }
        return
      }

      try {
        const data = await loadAnalyticsSnapshot(auth.token)
        if (isMounted) setSnapshot(data)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [auth.token])

  const {
    totalPoints,
    savingsTotal,
    wasteItemsRescued,
    recipesCooked,
    streak,
    badges,
    quests,
    recipeHistory,
    topRecipes,
    averageCookTime,
    today,
    week,
  } = snapshot

  const [dailyQuests, weeklyQuests] = useMemo(
    () => [
      quests.filter((quest) => quest.period === 'Daily'),
      quests.filter((quest) => quest.period === 'Weekly'),
    ],
    [quests]
  )

  const claimableCount = quests.filter((quest) => quest.claimable).length

  const handleClaimQuest = async (questId) => {
    if (!auth.token) return
    setSnapshot(await claimQuest(auth.token, questId))
  }

  const handleResetAnalytics = async () => {
    if (!auth.token) return
    setSnapshot(await clearAnalyticsData(auth.token))
    setShowResetModal(false)
  }

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Analytics"
          subtitle="Quests, points, streaks, savings, and cooking impact"
        />

        {loading ? (
          <div className="card mt-6 rounded-3xl p-10 text-center">
            <p className="text-ink-muted">Loading analytics...</p>
          </div>
        ) : (
          <>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <article className="card rounded-3xl p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Points</p>
            <p className="mt-2 text-2xl font-bold text-sage-dark sm:text-3xl">{totalPoints}</p>
          </article>
          <article className="card rounded-3xl p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Savings</p>
            <p className="mt-2 text-2xl font-bold text-sage-dark sm:text-3xl">${savingsTotal.toFixed(2)}</p>
          </article>
          <article className="card rounded-3xl p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Streak</p>
            <p className="mt-2 text-2xl font-bold text-sage-dark sm:text-3xl">{streak.current} day{streak.current === 1 ? '' : 's'}</p>
          </article>
          <article className="card rounded-3xl p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Badges</p>
            <p className="mt-2 text-2xl font-bold text-sage-dark sm:text-3xl">{badges.length}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-ink">Daily quests</h3>
              {claimableCount > 0 ? (
                <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-sage-dark">
                  {claimableCount} claimable
                </span>
              ) : null}
            </div>
            <ul className="mt-4 space-y-3">
              {dailyQuests.map((quest) => (
                <li key={quest.id} className="rounded-2xl border border-cream-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{quest.title}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {quest.progress} / {quest.target} • Reward {quest.reward} pts
                      </p>
                    </div>
                    {quest.claimed ? (
                      <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-sage-dark">Claimed</span>
                    ) : quest.claimable ? (
                      <button
                        type="button"
                        onClick={() => handleClaimQuest(quest.id)}
                        className="rounded-full bg-sage px-3 py-1 text-xs font-semibold text-white"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-ink-muted">In progress</span>
                    )}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
                    <div className="h-full rounded-full bg-sage" style={{ width: `${quest.progressPercent}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-ink">Weekly quests</h3>
            <ul className="mt-4 space-y-3">
              {weeklyQuests.map((quest) => (
                <li key={quest.id} className="rounded-2xl border border-cream-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{quest.title}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {Number(quest.progress).toFixed(quest.title.includes('$') ? 2 : 0)} / {quest.target} • Reward {quest.reward} pts
                      </p>
                    </div>
                    {quest.claimed ? (
                      <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-sage-dark">Claimed</span>
                    ) : quest.claimable ? (
                      <button
                        type="button"
                        onClick={() => handleClaimQuest(quest.id)}
                        className="rounded-full bg-sage px-3 py-1 text-xs font-semibold text-white"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-ink-muted">In progress</span>
                    )}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
                    <div className="h-full rounded-full bg-sage" style={{ width: `${quest.progressPercent}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-ink">Recipe history & stats</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-cream-100 p-3">
                <p className="text-ink-muted">Recipes cooked</p>
                <p className="mt-1 text-lg font-semibold text-ink">{recipesCooked}</p>
              </div>
              <div className="rounded-2xl bg-cream-100 p-3">
                <p className="text-ink-muted">Avg cook time</p>
                <p className="mt-1 text-lg font-semibold text-ink">
                  {averageCookTime ? `${averageCookTime} min` : '—'}
                </p>
              </div>
              <div className="rounded-2xl bg-cream-100 p-3">
                <p className="text-ink-muted">Items rescued</p>
                <p className="mt-1 text-lg font-semibold text-ink">{wasteItemsRescued}</p>
              </div>
              <div className="rounded-2xl bg-cream-100 p-3">
                <p className="text-ink-muted">Best streak</p>
                <p className="mt-1 text-lg font-semibold text-ink">{streak.best} days</p>
              </div>
            </div>

            <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink-muted">Top recipes</h4>
            {topRecipes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {topRecipes.map((item) => (
                  <li key={item.title} className="flex items-center justify-between rounded-xl bg-cream-100 px-3 py-2 text-sm">
                    <span className="truncate pr-3 text-ink">{item.title}</span>
                    <span className="shrink-0 font-semibold text-ink-muted">{item.count}x</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">No recipes cooked yet.</p>
            )}

            <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink-muted">Recent history</h4>
            {recipeHistory.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {recipeHistory.slice(0, 6).map((entry) => (
                  <li key={entry.id} className="rounded-xl border border-cream-200 px-3 py-2">
                    <p className="text-sm font-medium text-ink">{entry.title}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(entry.cookedAt).toLocaleDateString()} • +{entry.pointsAwarded} pts • ${Number(entry.savingsAwarded || 0).toFixed(2)} saved
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">Finish cooking a recipe to start history tracking.</p>
            )}
          </section>

          <section className="card rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-ink">Savings & streak tracker</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-sage/10 p-4">
                <p className="text-sm text-ink-muted">Total estimated savings</p>
                <p className="mt-1 text-3xl font-bold text-sage-dark">${savingsTotal.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-cream-100 p-3">
                  <p className="text-xs text-ink-muted">Today</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{today.points} pts</p>
                  <p className="text-xs text-ink-muted">{today.recipesCooked} recipes • ${Number(today.savings || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-cream-100 p-3">
                  <p className="text-xs text-ink-muted">This week</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{week.points} pts</p>
                  <p className="text-xs text-ink-muted">{week.recipesCooked} recipes • ${Number(week.savings || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-cream-200 p-4">
                <p className="text-sm text-ink-muted">Current streak</p>
                <p className="mt-1 text-xl font-semibold text-ink">{streak.current} day{streak.current === 1 ? '' : 's'}</p>
                <p className="mt-2 text-xs text-ink-muted">Keep cooking regularly to maintain momentum.</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Badges</h4>
                {badges.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span key={badge} className="inline-flex items-center rounded-full bg-amber/20 px-3 py-1 text-xs font-semibold text-amber-dark">
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-ink-muted">No badges yet — complete quests to unlock them.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 border-t border-cream-200 pt-6 text-center">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-rose-700"
          >
            Reset analytics data
          </button>
        </div>

        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          title="Reset analytics"
        >
          <div className="rounded-2xl bg-rose-50 p-4 text-rose-900">
            <p className="text-sm font-semibold">
              This will permanently clear your points, quests, badges, streaks, and recipe analytics history.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-5 py-2 text-sm font-semibold text-ink-muted shadow-soft transition hover:bg-cream-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetAnalytics}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-rose-700"
            >
              Reset analytics
            </button>
          </div>
        </Modal>
          </>
        )}
      </div>
    </PageContainer>
  )
}
