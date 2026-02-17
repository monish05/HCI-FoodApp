export default function PageContainer({ children, className = '' }) {
  return (
    <main
      className={`min-h-screen min-w-0 pb-24 pt-20 page-padding page-padding-safe safe-bottom md:pb-12 md:pt-28 overflow-x-hidden ${className}`}
      id="main-content"
    >
      {children}
    </main>
  )
}
