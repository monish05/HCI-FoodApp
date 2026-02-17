export default function SectionHeader({ title, subtitle }) {
  return (
    <header className="mb-4 sm:mb-6">
      <h2 className="text-xl font-semibold text-ink sm:text-2xl lg:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-ink-muted sm:text-base">{subtitle}</p>}
    </header>
  )
}
