import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import Badge from '../components/Badge'
import { recipes, recipeSteps } from '../data/mockData'

export default function RecipeDetail() {
  const { id } = useParams()
  const recipe = recipes.find((r) => r.id === id)
  const [imgError, setImgError] = useState(false)
  const showImage = recipe?.image && !imgError

  if (!recipe) {
    return (
      <PageContainer>
        <div className="page-content">
          <div className="card rounded-3xl p-12 text-center">
            <p className="text-ink-muted leading-relaxed">Recipe not found.</p>
            <Link to="/recipes" className="btn-primary mt-6 inline-block">
              Back to library
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="page-content">
        <Link
          to="/recipes"
          className="mb-6 inline-block text-sm font-medium text-ink-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded-full"
        >
          ← Back to library
        </Link>
        <div className="card overflow-hidden rounded-3xl p-0">
          <div className="aspect-[3/2] overflow-hidden rounded-t-3xl bg-cream-200 sm:aspect-[16/9]">
            {showImage ? (
              <img
                src={recipe.image}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-cream-200 text-5xl sm:text-6xl">
                🍽️
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <h1 className="text-2xl font-bold leading-tight text-ink sm:text-3xl lg:text-4xl">
              {recipe.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="sage">{tag}</Badge>
              ))}
              {recipe.cookTime && (
                <span className="text-sm text-ink-muted">{recipe.cookTime} min</span>
              )}
            </div>
            <h2 className="mt-8 text-xl font-bold text-ink">Steps</h2>
            <ol className="mt-4 space-y-4">
              {recipeSteps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-sage-dark">
                    {i + 1}
                  </span>
                  <span className="text-base leading-relaxed text-ink pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <Link
              to="/cooking"
              className="btn-primary mt-10 flex w-full items-center justify-center"
            >
              Start cooking
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
