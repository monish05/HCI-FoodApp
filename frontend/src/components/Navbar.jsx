import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/fridge', label: 'My Fridge' },
  { to: '/planner', label: 'Planner' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/shopping', label: 'Shopping' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/profile', label: 'Profile' }, // ✅ add
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const { token, logout, me } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  function handleLogout() {
    logout()
    closeMenu()
    navigate('/login')
  }

  function handleLogin() {
    closeMenu()
    navigate('/login')
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 min-w-0 bg-white/90 shadow-soft backdrop-blur-xl safe-top">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <nav
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 page-padding page-padding-safe py-3 sm:py-4"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-3 text-ink transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 rounded-2xl"
          >
            <img src="/logo.svg" alt="" className="h-9 w-9 sm:h-10 sm:w-10" width="40" height="40" />
            <span className="hidden text-lg font-semibold sm:inline">Fridge to Feast</span>
            <span className="text-lg font-semibold sm:hidden">Feast</span>
          </NavLink>

          {/* Desktop: horizontal nav */}
          <ul className="hidden min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto py-1 scrollbar-hide md:flex md:gap-2">
            {navItems.map(({ to, label }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-sage/12 text-sage-dark'
                        : 'text-ink-muted hover:bg-cream-200/80 hover:text-ink'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}

            {/* Desktop auth action */}
            <li className="shrink-0 pl-1">
              {token ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-ink-muted transition-all duration-200 hover:bg-cream-200/80 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
                >
                  Logout{me?.name ? ` (${me.name})` : ''}
                </button>
              ) : (
                <button type="button" onClick={handleLogin} className="btn-primary px-5">
                  Log in
                </button>
              )}
            </li>
          </ul>

          {/* Mobile: menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-200/80 text-ink transition-colors hover:bg-cream-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
        onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-soft-xl transition-transform duration-300 ease-out safe-top safe-right md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Mobile menu"
        aria-hidden={!menuOpen}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-cream-200 px-4 py-4 page-padding-safe">
            <span className="text-lg font-semibold text-ink">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cream-200 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 page-padding-safe">
            {navItems.map(({ to, label }) => {
              const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={closeMenu}
                    className={`flex min-h-14 items-center rounded-2xl px-4 text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 ${
                      isActive ? 'bg-sage/12 text-sage-dark' : 'text-ink hover:bg-cream-100'
                    }`}
                  >
                    {label}
                  </NavLink>
                </li>
              )
            })}

            {/* Mobile auth action */}
            <li className="pt-2">
              {token ? (
                <button type="button" onClick={handleLogout} className="btn-secondary w-full">
                  Logout{me?.name ? ` (${me.name})` : ''}
                </button>
              ) : (
                <button type="button" onClick={handleLogin} className="btn-primary w-full">
                  Log in
                </button>
              )}
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}