export default function FilterPill({ label, active, onClick, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 ${
        active
          ? 'bg-sage text-white shadow-soft'
          : 'bg-cream-200 text-ink hover:bg-cream-300'
      }`}
      aria-pressed={active}
      {...props}
    >
      {label}
    </button>
  )
}
