import Badge from './Badge'

export default function IngredientCard(props) {
  // ✅ 兼容两种调用方式：
  // 1) <IngredientCard item={{ name, inFridge }} />
  // 2) <IngredientCard name="Salt" inFridge={true} />
  const item = props.item ?? { name: props.name, inFridge: props.inFridge }

  // 兜底：避免白屏
  const name = item?.name ?? ''
  const inFridge = Boolean(item?.inFridge)

  return (
    <div className="flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-3">
      <p className="truncate text-sm font-medium text-ink">{name || 'Unknown ingredient'}</p>
      {inFridge ? <Badge>In fridge</Badge> : <Badge>Missing</Badge>}
    </div>
  )
}