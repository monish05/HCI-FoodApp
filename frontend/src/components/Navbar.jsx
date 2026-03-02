import { useState, useEffect, useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/fridge', label: 'My Fridge' },
  { to: '/shopping', label: 'Shopping' },
]

export default function Navbar() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setMenuOpen(false)
  const handleLogout = () => {
    auth.logout()
    navigate('/login', { replace: true })
  }

  const inAccountSection = ['/profile', '/analytics', '/planner'].some((path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  )

  const profileLabel = useMemo(() => {
    if (auth.userName) return auth.userName
    if (auth.userEmail) return auth.userEmail.split('@')[0]
    return 'Profile'
  }, [auth.userEmail, auth.userName])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!profileOpen) return
    const handleClick = (event) => {
      if (!event.target.closest('[data-profile-menu]')) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [profileOpen])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 min-w-0 bg-white/90 shadow-soft backdrop-blur-xl safe-top">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 page-padding page-padding-safe py-3 sm:py-4" aria-label="Main navigation">
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-3 text-ink transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 rounded-2xl"
          >
            <img src="/logo.svg" alt="" className="h-9 w-9 sm:h-10 sm:w-10" width="40" height="40" />
            <span className="hidden text-lg font-semibold sm:inline">Easy Kitchen</span>
            <span className="text-lg font-semibold sm:hidden">Easy Kitchen</span>
          </NavLink>

          {/* Desktop: horizontal nav */}
          <ul className="hidden min-w-0 flex-1 items-center justify-end gap-1 py-1 md:flex md:gap-2">
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
            <li className="relative shrink-0" data-profile-menu>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 ${
                  inAccountSection || profileOpen
                    ? 'bg-sage/15 text-sage-dark'
                    : 'bg-cream-100 text-ink-muted hover:bg-cream-200 hover:text-ink'
                }`}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-xs font-bold uppercase">
                  {String(profileLabel || 'U').slice(0, 1)}
                </span>
                <span>{profileLabel}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-soft-lg ring-1 ring-ink/5"
                  role="menu"
                >
                  <div className="mb-2 rounded-xl bg-cream-50 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink">{profileLabel}</p>
                    <p className="truncate text-xs text-ink-muted">{auth.userEmail || 'Account'}</p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-cream-100"
                    role="menuitem"
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/analytics"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-cream-100"
                    role="menuitem"
                  >
                    Analytics
                  </NavLink>
                  <NavLink
                    to="/planner"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-cream-100"
                    role="menuitem"
                  >
                    Planner
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-xl px-3 py-2.5 text-left text-sm text-tomato-dark hover:bg-cream-100"
                    role="menuitem"
                  >
                    Log out
                  </button>
                </div>
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
        className={`fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ${menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={closeMenu}
        onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-soft-xl transition-transform duration-300 ease-out safe-top safe-right md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
                      isActive
                        ? 'bg-sage/12 text-sage-dark'
                        : 'text-ink hover:bg-cream-100'
                    }`}
                  >
                    {label}
                  </NavLink>
                </li>
              )
            })}
            <li className="mt-4 px-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Account</li>
            <li>
              <NavLink
                to="/profile"
                onClick={closeMenu}
                className="flex min-h-14 items-center rounded-2xl px-4 text-base font-medium text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 hover:bg-cream-100"
              >
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/analytics"
                onClick={closeMenu}
                className="flex min-h-14 items-center rounded-2xl px-4 text-base font-medium text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 hover:bg-cream-100"
              >
                Analytics
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/planner"
                onClick={closeMenu}
                className="flex min-h-14 items-center rounded-2xl px-4 text-base font-medium text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 hover:bg-cream-100"
              >
                Planner
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  closeMenu()
                  handleLogout()
                }}
                className="flex min-h-14 w-full items-center rounded-2xl px-4 text-base font-medium text-ink-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 hover:bg-cream-100 hover:text-ink"
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}
