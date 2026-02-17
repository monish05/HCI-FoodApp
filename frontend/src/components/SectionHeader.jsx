export default function SectionHeader({ title, subtitle }) {
  return (
    <header className="mb-6 sm:mb-8">
      <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-ink-muted leading-relaxed sm:text-lg">
          {subtitle}
        </p>
      )}
    </header>
  )
}
