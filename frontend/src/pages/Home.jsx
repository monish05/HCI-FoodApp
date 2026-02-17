import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import RecipeCard from '../components/RecipeCard'
import { recipes, fridgeItems } from '../data/mockData'

const useUpSoonItems = fridgeItems.filter((i) => i.daysLeft <= 2)
const suggestedRecipes = recipes.filter((r) => r.useUpSoon?.length).slice(0, 6)

export default function Home() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title="Use up soon"
          subtitle="Ingredients expiring in 1–2 days"
        />
        {useUpSoonItems.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2 sm:mb-10 sm:gap-3">
            {useUpSoonItems.map((item) => (
              <span
                key={item.id}
                className="rounded-2xl bg-tomato/10 px-4 py-2 text-sm font-medium text-tomato-dark"
              >
                {item.name} ({item.daysLeft} day{item.daysLeft === 1 ? '' : 's'})
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-cream-200/60 p-4 text-ink-muted">
            Nothing expiring in the next 2 days. You're all set.
          </p>
        )}

        <SectionHeader
          title="Suggested recipes"
          subtitle="Based on what you have"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suggestedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
