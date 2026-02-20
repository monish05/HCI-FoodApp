import Badge from './Badge'

function getExpiryVariant(daysLeft) {
  if (daysLeft <= 2) return 'tomato'
  if (daysLeft <= 5) return 'amber'
  return 'sage'
}

// Single consistent avatar style for all fridge items
const AVATAR_STYLE = 'bg-cream-300 text-ink'

export default function IngredientCard({ item, onRemove }) {
  const { name, daysLeft } = item
  const variant = getExpiryVariant(daysLeft)
  const label = daysLeft === 1 ? '1 day' : `${daysLeft} days`
  const initial = (name || '?').charAt(0).toUpperCase()

  return (
    <article className="card card-lift flex min-w-0 items-center gap-4 rounded-3xl p-5 transition-all duration-200 ease-out sm:gap-5 sm:p-6">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold sm:h-14 sm:w-14 sm:text-2xl ${AVATAR_STYLE}`}
        aria-hidden
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-ink leading-tight">{name}</h3>
      </div>
      <Badge variant={variant} className="shrink-0">{label} left</Badge>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(item)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-tomato/10 hover:text-tomato focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          aria-label={`Remove ${name} from fridge`}
        >
          ×
        </button>
      )}
    </article>
  )
}
