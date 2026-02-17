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
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-cream-200/80 bg-cream/95 backdrop-blur-md safe-top">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 page-padding page-padding-safe py-2.5 sm:py-3" aria-label="Main navigation">
          <NavLink
            to="/"
            className="shrink-0 text-base font-semibold text-ink transition-opacity hover:opacity-80 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sage sm:text-lg"
          >
            <span className="hidden sm:inline">Fridge-to-Table</span>
            <span className="sm:hidden">F2T</span>
          </NavLink>
          <ul className="flex min-w-0 flex-1 items-center justify-end gap-0.5 overflow-x-auto py-1 scrollbar-hide [-webkit-overflow-scrolling:touch] sm:justify-end sm:gap-2">
            {navItems.map(({ to, label }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `touch-target inline-flex items-center justify-center whitespace-nowrap rounded-xl px-2.5 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage sm:px-3 sm:text-sm ${
                      isActive ? 'bg-sage/15 text-sage-dark' : 'text-ink-muted hover:bg-cream-200 hover:text-ink'
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
      {/* Mobile bottom nav for thumb-friendly access */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-cream-200/80 bg-cream/95 backdrop-blur-md safe-bottom md:hidden"
        aria-label="Mobile navigation"
      >
        <ul className="flex items-center justify-around page-padding-safe py-2">
          {navItems.map(({ to, short }) => (
            <li key={to} className="min-w-0 flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage ${
                    isActive ? 'text-sage-dark' : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                <span className="w-full truncate text-center">{short}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
