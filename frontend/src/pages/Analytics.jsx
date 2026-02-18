import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { analytics } from '../data/mockData'

const TREND_DATA = [
  { week: '5 wk ago', value: 28 },
  { week: '4 wk ago', value: 32 },
  { week: '3 wk ago', value: 30 },
  { week: '2 wk ago', value: 34 },
  { week: 'This week', value: analytics.wasteReductionPercent },
]
const CHART_MAX = 40
const CHART_HEIGHT = 180

export default function Analytics() {
  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Your impact"
          subtitle="See how much you’re saving and wasting less"
        />

        {/* One-line takeaway */}
        <div className="card mb-6 rounded-3xl border-l-4 border-sage bg-sage/5 p-5 sm:mb-8 sm:p-6">
          <p className="text-base font-medium text-ink sm:text-lg">
            You’re wasting <strong className="text-sage-dark">{analytics.wasteReductionPercent}% less</strong> food than last month and saved about <strong className="text-sage-dark">${analytics.moneySaved}</strong> by using what you have.
          </p>
        </div>

        {/* Metric cards with clear meaning */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <article className="card card-lift rounded-3xl p-6 transition-all duration-200 sm:p-8 bg-sage/10">
            <p className="text-2xl leading-none" aria-hidden>💰</p>
            <p className="mt-4 text-sm font-semibold text-ink">Money saved</p>
            <p className="mt-1 text-3xl font-bold text-sage-dark sm:text-4xl">${analytics.moneySaved}</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Estimated from using fridge items and recipes instead of buying more this month.
            </p>
          </article>
          <article className="card card-lift rounded-3xl p-6 transition-all duration-200 sm:p-8 bg-amber/10">
            <p className="text-2xl leading-none" aria-hidden>🥗</p>
            <p className="mt-4 text-sm font-semibold text-ink">Food kept from waste</p>
            <p className="mt-1 text-3xl font-bold text-amber-dark sm:text-4xl">{analytics.foodSavedKg} kg</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Weight of food you used before it expired instead of throwing it out.
            </p>
          </article>
          <article className="card card-lift rounded-3xl p-6 transition-all duration-200 sm:p-8 bg-sage/10">
            <p className="text-2xl leading-none" aria-hidden>📉</p>
            <p className="mt-4 text-sm font-semibold text-ink">Less waste</p>
            <p className="mt-1 text-3xl font-bold text-sage-dark sm:text-4xl">{analytics.wasteReductionPercent}%</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              How much you reduced food waste compared to last month. Higher is better.
            </p>
          </article>
        </div>

        {/* Trend chart */}
        <div className="card mt-8 rounded-3xl p-6 sm:mt-10 sm:p-8 lg:p-10">
          <h3 className="text-lg font-bold text-ink">Progress over the last 5 weeks</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Waste reduction % — higher means less food wasted.
          </p>
          <div
            className="mt-6 flex items-end gap-4 sm:mt-8 sm:gap-6"
            role="img"
            aria-label={`Bar chart: waste reduction from ${TREND_DATA[0].week} to ${TREND_DATA[TREND_DATA.length - 1].week}`}
          >
            {/* Y-axis */}
            <div className="flex flex-col justify-between shrink-0 pb-8 pt-1 pr-2 text-right" style={{ height: CHART_HEIGHT }}>
              {[40, 30, 20, 10, 0].map((tick) => (
                <span key={tick} className="text-xs text-ink-muted tabular-nums">{tick}%</span>
              ))}
            </div>
            {/* Chart area with baseline and bars */}
            <div className="flex-1 min-w-0">
              <div
                className="relative flex justify-around gap-2 sm:gap-4 border-b border-cream-300 pb-2"
                style={{ height: CHART_HEIGHT }}
              >
                {/* Light horizontal grid */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="border-t border-cream-200/80" />
                  ))}
                </div>
                {TREND_DATA.map((d, i) => {
                  const heightPct = Math.min(100, (d.value / CHART_MAX) * 100)
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5 min-w-0">
                      <span className="text-xs font-semibold text-sage-dark tabular-nums">{d.value}%</span>
                      <div
                        className="w-10 sm:w-12 rounded-t-xl bg-sage shadow-soft transition-all duration-300 ease-out min-h-[20px]"
                        style={{ height: `${heightPct}%`, maxHeight: CHART_HEIGHT - 40 }}
                      />
                      <span className="text-[11px] sm:text-xs text-ink-muted text-center leading-tight">{d.week}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Tip: Plan meals from your fridge first and add items from receipts to keep these numbers growing.
        </p>
      </div>
    </PageContainer>
  )
}
