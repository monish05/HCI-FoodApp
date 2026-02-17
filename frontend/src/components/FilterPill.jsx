export default function FilterPill({ label, active, onClick, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 active:scale-95 ${
        active
          ? 'bg-sage text-white shadow-soft'
          : 'bg-cream-200/80 text-ink hover:bg-cream-300/80'
      }`}
      aria-pressed={active}
      {...props}
    >
      {label}
    </button>
  )
}
