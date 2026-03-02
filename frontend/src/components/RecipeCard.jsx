import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function RecipeCard({ recipe, badgeLabel, ingredientStatus }) {
  const { id, title, cookTime, totalTime, image, rating, voteCount } = recipe
  const [imgError, setImgError] = useState(false)
  const showImage = image && !imgError
  const displayTime = totalTime ?? cookTime
  const ratingValue = Number(rating || 0)
  const hasRating = ratingValue > 0
  const ratingRounded = Math.max(0, Math.min(5, Math.round(ratingValue)))
  const ratingStars = '★'.repeat(ratingRounded) + '☆'.repeat(5 - ratingRounded)

  return (
    <Link
      to={`/recipes/${id}`}
      className="card card-lift group block min-w-0 overflow-hidden rounded-3xl transition-transform duration-300 ease-out hover:-translate-y-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-t-3xl bg-cream-200">
        {showImage ? (
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream-200 text-4xl sm:text-5xl">
            🍽️
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6">
        {(badgeLabel || (ingredientStatus && String(ingredientStatus).trim())) && (
          <div className="mb-2">
            {badgeLabel ? (
              <Badge variant="sage">{badgeLabel}</Badge>
            ) : (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-tomato/15 text-tomato-dark">
                {ingredientStatus}
              </span>
            )}
          </div>
        )}
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-ink sm:text-xl">
          {title}
        </h3>
        {(displayTime || hasRating) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {displayTime ? (
              <span className="inline-flex items-center rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-ink-muted sm:text-sm">
                ⏱️ {displayTime} min
              </span>
            ) : null}
            {hasRating ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-ink-muted sm:text-sm">
                <span aria-hidden className="tracking-tight text-amber-500">{ratingStars}</span>
                <span>{ratingValue.toFixed(1)}</span>
                {voteCount ? <span className="text-ink-muted/80">({voteCount})</span> : null}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  )
}
