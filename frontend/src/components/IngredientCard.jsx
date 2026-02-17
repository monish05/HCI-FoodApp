import Badge from './Badge'

function getExpiryVariant(daysLeft) {
  if (daysLeft <= 2) return 'tomato'
  if (daysLeft <= 5) return 'amber'
  return 'sage'
}

function getAvatarStyle(variant) {
  const styles = {
    tomato: 'bg-tomato/15 text-tomato-dark',
    amber: 'bg-amber/20 text-amber-dark',
    sage: 'bg-sage/15 text-sage-dark',
  }
  return styles[variant] || styles.sage
}

function formatQuantity(item) {
  if (item.amount != null && item.unit) {
    const u = item.unit
    const a = item.amount
    if (u === 'count') return String(a)
    if (u === 'clove' || u === 'slice') return a === 1 ? `1 ${u}` : `${a} ${u}`
    return `${a} ${u}`
  }
  return item.quantity ?? '—'
}

export default function IngredientCard({ item, onRemove }) {
  const { name, daysLeft } = item
  const variant = getExpiryVariant(daysLeft)
  const label = daysLeft === 1 ? '1 day' : `${daysLeft} days`
  const initial = (name || '?').charAt(0).toUpperCase()
  const quantityText = formatQuantity(item)

  return (
    <article className="card card-lift flex min-w-0 items-center gap-4 rounded-3xl p-5 transition-all duration-200 ease-out sm:gap-5 sm:p-6">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold sm:h-14 sm:w-14 sm:text-2xl ${getAvatarStyle(variant)}`}
        aria-hidden
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-ink leading-tight">{name}</h3>
        <p className="mt-0.5 truncate text-sm text-ink-muted leading-relaxed">{quantityText}</p>
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
