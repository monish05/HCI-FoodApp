export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-cream-200 text-ink',
    sage: 'bg-sage/15 text-sage-dark',
    tomato: 'bg-tomato/15 text-tomato-dark',
    amber: 'bg-amber/20 text-amber-dark',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  )
}
