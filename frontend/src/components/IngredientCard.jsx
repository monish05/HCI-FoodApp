function formatQuantity(item) {
  if (item.count != null) {
    return `Count: ${item.count}`
  }
  if (item.amount != null && item.unit) {
    const u = item.unit
    const a = item.amount
    if (u === 'count') return String(a)
    if (u === 'clove' || u === 'slice') return a === 1 ? `1 ${u}` : `${a} ${u}`
    return `${a} ${u}`
  }
  return item.quantity ?? '—'
}

function displayName(value) {
  return (value || '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export default function IngredientCard({
  item,
  onIncrement,
  onSelect,
}) {
  const { name } = item
  const quantityText = formatQuantity(item)
  const initial = displayName(name).charAt(0).toUpperCase() || '?'

  return (
    <article
      className="card group inline-flex min-w-0 flex-col items-center gap-3 rounded-2xl border border-cream-200 bg-white p-5 text-center shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-soft-lg"
      onClick={() => onSelect?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect?.(item)
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-300 text-lg font-semibold text-ink"
        aria-hidden
      >
        {initial}
      </div>
      <h3 className="text-base font-semibold text-ink leading-tight">{displayName(name)}</h3>
      <span className="inline-flex items-center rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-muted">
        {quantityText}
      </span>
      <div className="mt-1 flex w-full items-center justify-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSelect?.(item)
          }}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-cream-200 bg-white px-3 py-2 text-xs font-semibold text-ink-muted shadow-soft transition hover:bg-cream-100"
        >
          Details
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onIncrement?.(item)
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sage px-3 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-sage-dark active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          aria-label={`Add ${name}`}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-sm leading-none">+</span>
          Add
        </button>
      </div>
    </article>
  )
}
