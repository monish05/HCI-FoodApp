export default function PageContainer({ children, className = '' }) {
  return (
    <main
      className={`min-h-screen pb-24 pt-16 page-padding page-padding-safe safe-bottom sm:pt-20 md:pb-8 ${className}`}
      id="main-content"
    >
      {children}
    </main>
  )
}
