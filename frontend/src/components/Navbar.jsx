import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', short: 'Home' },
  { to: '/fridge', label: 'My Fridge', short: 'Fridge' },
  { to: '/planner', label: 'Planner', short: 'Plan' },
  { to: '/recipes', label: 'Recipes', short: 'Recipes' },
  { to: '/cooking', label: 'Cooking', short: 'Cook' },
  { to: '/shopping', label: 'Shopping', short: 'Shop' },
  { to: '/analytics', label: 'Analytics', short: 'Stats' },
]

export default function Navbar() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 min-w-0 bg-white/80 shadow-soft backdrop-blur-xl safe-top">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 page-padding page-padding-safe py-4" aria-label="Main navigation">
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-3 text-ink transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 rounded-2xl"
          >
            <img src="/logo.svg" alt="" className="h-9 w-9 sm:h-10 sm:w-10" width="40" height="40" />
            <span className="hidden text-lg font-semibold sm:inline">Fridge to Feast</span>
            <span className="text-lg font-semibold sm:hidden">Feast</span>
          </NavLink>
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
          </ul>
        </nav>
      </header>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 min-w-0 bg-white/80 shadow-soft backdrop-blur-xl safe-bottom md:hidden"
        aria-label="Mobile navigation"
      >
        <ul className="flex items-center justify-around gap-0 page-padding-safe py-3">
          {navItems.map(({ to, short }) => (
            <li key={to} className="min-w-0 flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage ${
                    isActive ? 'text-sage-dark' : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                <span className="truncate w-full text-center">{short}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
