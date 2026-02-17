import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function RecipeCard({ recipe }) {
  const { id, title, tags = [], cookTime, image } = recipe
  const [imgError, setImgError] = useState(false)
  const showImage = image && !imgError

  return (
    <Link
      to={`/recipes/${id}`}
      className="card card-lift group block min-w-0 overflow-hidden rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
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
      <div className="p-6 sm:p-8">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-ink sm:text-xl">
          {title}
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="sage">{tag}</Badge>
          ))}
          {cookTime && (
            <span className="text-sm text-ink-muted">· {cookTime} min</span>
          )}
        </div>
      </div>
    </Link>
  )
}
