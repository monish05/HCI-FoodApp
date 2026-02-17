import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import { recipes, fridgeItems } from '../data/mockData'

const useUpSoonItems = fridgeItems.filter((i) => i.daysLeft <= 2)
const suggestedRecipes = recipes.filter((r) => r.useUpSoon?.length).slice(0, 6)

export default function Home() {
  return (
    <PageContainer>
      <div className="page-content">
        <section className="mb-8 sm:mb-10">
          <div className="card rounded-3xl p-8 shadow-soft sm:p-10">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl lg:text-[2.5rem] leading-tight">
              Cook it before you lose it.
            </h1>
            <p className="mt-4 text-base text-ink-muted leading-relaxed sm:text-lg max-w-xl">
              Turn what you have into meals you’ll love—no more forgotten leftovers.
            </p>
          </div>
        </section>

        <SectionHeader
          title="Use up soon"
          subtitle="Ingredients expiring in 1–2 days"
        />
        {useUpSoonItems.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-3 sm:mb-10 sm:gap-4">
            {useUpSoonItems.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-tomato/10 px-4 py-2.5 text-sm font-medium text-tomato-dark"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-tomato/15 text-xs font-semibold">
                  {(item.name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="truncate max-w-[140px] sm:max-w-none">{item.name}</span>
                <span className="shrink-0">({item.daysLeft}d)</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="card mb-8 rounded-3xl p-6 sm:mb-10 sm:p-8">
            <p className="text-base text-ink-muted leading-relaxed">
              Nothing expiring in the next 2 days. You're all set.
            </p>
          </div>
        )}

        <SectionHeader
          title="Suggested recipes"
          subtitle="Based on what you have"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {suggestedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
