import Badge from './Badge'
import { useFridge } from '../context/FridgeContext'

function getExpiryVariant(daysLeft) {
  if (daysLeft <= 2) return 'tomato'
  if (daysLeft <= 5) return 'amber'
  return 'sage'
}

const AVATAR_STYLE = 'bg-cream-300 text-ink'

export default function IngredientCard({ item }) {
  const { removeItem, updateAmount } = useFridge()
  const { id, name, daysLeft, amount, unit } = item
  const variant = getExpiryVariant(daysLeft)
  const label = daysLeft === 1 ? '1 day' : `${daysLeft} days`
  const initial = (name || '?').charAt(0).toUpperCase()

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      className="card card-lift flex flex-col items-center gap-4 rounded-3xl p-6 transition-all duration-200 ease-out text-center relative h-full cursor-grab active:cursor-grabbing"
    >
      <button
        type="button"
        onClick={() => removeItem(id)}
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-tomato/10 hover:text-tomato focus:outline-none"
        aria-label={`Remove ${name} from fridge`}
      >
        ×
      </button>

      <div
        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-semibold ${AVATAR_STYLE}`}
        aria-hidden
      >
        {initial}
      </div>

      <div className="flex-1 w-full min-w-0">
        <h3 className="truncate text-lg font-bold text-ink mb-1">{name}</h3>
        <Badge variant={variant} className="inline-block">{label} left</Badge>
      </div>

      <div className="w-full mt-2">
        <div className="flex items-center justify-between bg-cream-100/50 rounded-2xl p-2">
          <button
            type="button"
            onClick={() => updateAmount(id, -1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-bold text-ink shadow-soft hover:bg-cream-200 transition-colors"
          >
            −
          </button>
          <div className="flex flex-col min-w-[3rem]">
            <span className="text-lg font-bold text-ink leading-none">{amount}</span>
            <span className="text-[10px] text-ink-muted mt-0.5 uppercase tracking-wider">{unit}</span>
          </div>
          <button
            type="button"
            onClick={() => updateAmount(id, 1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-bold text-ink shadow-soft hover:bg-cream-200 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </article>
  )
}
