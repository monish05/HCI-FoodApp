import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function RecipeCard({ recipe }) {
  const { id, title, tags = [], cookTime } = recipe
  return (
    <Link
      to={`/recipes/${id}`}
      className="group block rounded-3xl bg-white p-0 shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-t-3xl bg-cream-200">
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sage/10 to-carrot/10 text-4xl transition-transform duration-200 group-hover:scale-105"
          aria-hidden
        >
          🍽️
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-ink line-clamp-2">{title}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="sage">
              {tag}
            </Badge>
          ))}
          {cookTime && (
            <span className="text-sm text-ink-muted">{cookTime} min</span>
          )}
        </div>
      </div>
    </Link>
  )
}
