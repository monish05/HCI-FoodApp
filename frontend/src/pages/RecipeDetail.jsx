import { Link, useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import Badge from '../components/Badge'
import { recipes, recipeSteps } from '../data/mockData'

export default function RecipeDetail() {
  const { id } = useParams()
  const recipe = recipes.find((r) => r.id === id)

  if (!recipe) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-ink-muted">Recipe not found.</p>
          <Link to="/recipes" className="mt-4 inline-block text-sage font-medium hover:underline">
            Back to library
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <Link
          to="/recipes"
          className="mb-4 inline-block text-sm font-medium text-ink-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded"
        >
          ← Back to library
        </Link>
        <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
          <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-sage/10 to-carrot/10 text-4xl sm:text-5xl">
            🍽️
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl font-semibold leading-tight text-ink sm:text-2xl lg:text-3xl">{recipe.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="sage">{tag}</Badge>
              ))}
              {recipe.cookTime && (
                <span className="text-ink-muted">{recipe.cookTime} min</span>
              )}
            </div>
            <h2 className="mt-6 text-lg font-semibold text-ink">Steps</h2>
            <ol className="mt-2 space-y-3">
              {recipeSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sm font-medium text-sage-dark">
                    {i + 1}
                  </span>
                  <span className="text-ink">{step}</span>
                </li>
              ))}
            </ol>
            <Link
              to="/cooking"
              className="mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-sage font-medium text-white hover:bg-sage-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              Start cooking
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
