export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-cream-200 text-ink',
    sage: 'bg-sage/15 text-sage-dark',
    tomato: 'bg-tomato/15 text-tomato-dark',
    carrot: 'bg-carrot/15 text-carrot-dark',
    amber: 'bg-amber-soft/20 text-amber-warm',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  )
}
