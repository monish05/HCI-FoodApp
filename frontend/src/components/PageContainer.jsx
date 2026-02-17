export default function PageContainer({ children, className = '' }) {
  return (
    <main className={`min-h-screen pb-24 pt-20 page-padding ${className}`} id="main-content">
      {children}
    </main>
  )
}
