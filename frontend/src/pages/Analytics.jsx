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
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {cards.map((card) => (
            <article
              key={card.label}
              className={`rounded-3xl p-4 shadow-soft sm:p-6 ${accentBg[card.accent]}`}
            >
              <p className="text-xs font-medium text-ink-muted sm:text-sm">{card.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${accentText[card.accent]} sm:text-3xl lg:text-4xl`}>
                {card.value}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{card.subtitle}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-white p-4 shadow-soft sm:mt-10 sm:p-6 lg:p-8">
          <h3 className="text-base font-semibold text-ink sm:text-lg">Waste reduction trend</h3>
          <div className="mt-4 flex h-40 items-end justify-between gap-1 sm:mt-6 sm:h-48 sm:gap-2">
            {[28, 32, 30, 34, 34].map((val, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:gap-2">
                <div
                  className="w-full max-w-[40px] rounded-t-lg bg-sage/30 transition-all hover:bg-sage/50 sm:max-w-[48px]"
                  style={{ height: `${(val / 40) * 100}%`, minHeight: 20 }}
                  title={`${val}%`}
                />
                <span className="truncate text-[10px] text-ink-muted sm:text-xs">W{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-muted sm:mt-4 sm:text-sm">Last 5 weeks — waste reduction %</p>
        </div>
      </div>
    </PageContainer>
  )
}
