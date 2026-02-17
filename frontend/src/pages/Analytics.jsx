import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { analytics } from '../data/mockData'

const cards = [
  { label: 'Money saved', value: `$${analytics.moneySaved}`, subtitle: 'This month', accent: 'sage' },
  { label: 'Food saved', value: `${analytics.foodSavedKg} kg`, subtitle: 'From going to waste', accent: 'amber' },
  { label: 'Waste reduction', value: `${analytics.wasteReductionPercent}%`, subtitle: 'vs. last month', accent: 'tomato' },
]

const accentBg = { sage: 'bg-sage/10', amber: 'bg-amber/10', tomato: 'bg-tomato/10' }
const accentText = { sage: 'text-sage-dark', amber: 'text-amber-dark', tomato: 'text-tomato-dark' }

export default function Analytics() {
  return (
    <PageContainer>
      <div className="page-content mx-auto max-w-4xl min-w-0">
        <SectionHeader
          title="Analytics"
          subtitle="Your impact at a glance"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {cards.map((card) => (
            <article
              key={card.label}
              className={`card card-lift rounded-3xl p-6 transition-all duration-200 sm:p-8 ${accentBg[card.accent]}`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                {card.label}
              </p>
              <p className={`mt-3 text-3xl font-bold sm:text-4xl ${accentText[card.accent]}`}>
                {card.value}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{card.subtitle}</p>
            </article>
          ))}
        </div>
        <div className="card mt-8 rounded-3xl p-6 sm:mt-10 sm:p-8 lg:p-10">
          <h3 className="text-lg font-bold text-ink">Waste reduction trend</h3>
          <div className="mt-8 flex h-44 items-end justify-between gap-2 sm:h-52">
            {[28, 32, 30, 34, 34].map((val, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-[48px] rounded-t-2xl bg-sage/30 transition-colors hover:bg-sage/50"
                  style={{ height: `${(val / 40) * 100}%`, minHeight: 24 }}
                  title={`${val}%`}
                />
                <span className="text-xs text-ink-muted">W{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-muted">Last 5 weeks — waste reduction %</p>
        </div>
      </div>
    </PageContainer>
  )
}
