import Badge from './Badge'

function getExpiryVariant(daysLeft) {
  if (daysLeft <= 2) return 'tomato'
  if (daysLeft <= 5) return 'amber'
  return 'sage'
}

export default function IngredientCard({ item }) {
  const { name, quantity, daysLeft } = item
  const variant = getExpiryVariant(daysLeft)
  const label = daysLeft === 1 ? '1 day' : `${daysLeft} days`
  return (
    <article className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-ink truncate">{name}</h3>
        <p className="text-sm text-ink-muted">{quantity}</p>
      </div>
      <Badge variant={variant}>{label} left</Badge>
    </article>
  )
}
