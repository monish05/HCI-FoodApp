import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { analytics } from '../data/mockData'

const cards = [
  {
    label: 'Money saved',
    value: `$${analytics.moneySaved}`,
    subtitle: 'This month',
    accent: 'sage',
  },
  {
    label: 'Food saved',
    value: `${analytics.foodSavedKg} kg`,
    subtitle: 'From going to waste',
    accent: 'carrot',
  },
  {
    label: 'Waste reduction',
    value: `${analytics.wasteReductionPercent}%`,
    subtitle: 'vs. last month',
    accent: 'tomato',
  },
]

const accentBg = { sage: 'bg-sage/10', carrot: 'bg-carrot/10', tomato: 'bg-tomato/10' }
const accentText = { sage: 'text-sage-dark', carrot: 'text-carrot-dark', tomato: 'text-tomato-dark' }

export default function Analytics() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          title="Analytics"
          subtitle="Your impact at a glance"
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.label}
              className={`rounded-3xl p-6 shadow-soft ${accentBg[card.accent]}`}
            >
              <p className="text-sm font-medium text-ink-muted">{card.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${accentText[card.accent]} sm:text-4xl`}>
                {card.value}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{card.subtitle}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-soft">
          <h3 className="text-lg font-semibold text-ink">Waste reduction trend</h3>
          <div className="mt-6 flex h-48 items-end justify-between gap-2">
            {[28, 32, 30, 34, 34].map((val, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-[48px] rounded-t-lg bg-sage/30 transition-all hover:bg-sage/50"
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
