import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-cream p-4 shadow-soft-lg transition-opacity duration-200 safe-left safe-right sm:p-6">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
          <h2 id="modal-title" className="truncate text-lg font-semibold text-ink sm:text-xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target shrink-0 rounded-full p-2 text-ink-muted transition-colors hover:bg-cream-200 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            aria-label="Close modal"
          >
            <span className="text-xl leading-none" aria-hidden>×</span>
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
