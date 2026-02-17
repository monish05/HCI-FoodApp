export default function SectionHeader({ title, subtitle }) {
  return (
    <header className="mb-6">
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-ink-muted">{subtitle}</p>}
    </header>
  )
}
