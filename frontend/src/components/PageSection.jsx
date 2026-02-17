export default function PageSection({ title, subtitle, children, className = '' }) {
  return (
    <section className={`page-section ${className}`}>
      {(title || subtitle) && (
        <header className="mb-5 sm:mb-6">
          {title && (
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl lg:text-3xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-ink-muted sm:text-base">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
