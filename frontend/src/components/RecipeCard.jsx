import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import { useShopping } from '../context/ShoppingContext'

export default function RecipeCard({ recipe, badgeLabel, ingredientStatus, missing = [] }) {
  const { id, title, tags = [], cookTime, image } = recipe
  const { addMultipleItems } = useShopping()

  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)

  const showImage = image && !imgError

  const handleAddMissing = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (missing.length > 0) {
      const toAdd = missing.map(name => ({
        name,
        category: 'For recipes',
        checked: false
      }))
      addMultipleItems(toAdd)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <div className="relative group h-full">
      <Link
        to={`/recipes/${id}`} state={{ recipe }}
        className="card card-lift group block h-full min-w-0 overflow-hidden rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 relative flex flex-col pb-4"
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
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          {(badgeLabel || (ingredientStatus && String(ingredientStatus).trim()) || (missing.length > 0)) && (
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                {badgeLabel ? (
                  <Badge variant="sage">{badgeLabel}</Badge>
                ) : missing.length > 0 ? (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-tomato/15 text-tomato-dark">
                    Missing {missing.length} item{missing.length !== 1 ? 's' : ''}
                  </span>
                ) : ingredientStatus ? (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-tomato/15 text-tomato-dark">
                    {ingredientStatus}
                  </span>
                ) : null}
              </div>

              {missing.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddMissing}
                  className={`text-xs font-bold py-1 px-2 rounded-lg transition-all ${added
                    ? 'bg-sage text-white'
                    : 'bg-sage/10 text-sage-dark hover:bg-sage hover:text-white'
                    }`}
                >
                  {added ? 'Added!' : '+ Add'}
                </button>
              )}
            </div>
          )}
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-ink sm:text-xl mb-auto">
            {title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="sage">{tag}</Badge>
            ))}
            {cookTime != null && (
              <span className="text-sm text-ink-muted">· {cookTime} min</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
