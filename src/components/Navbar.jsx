import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/fridge', label: 'My Fridge' },
  { to: '/planner', label: 'Planner' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/cooking', label: 'Cooking' },
  { to: '/shopping', label: 'Shopping' },
  { to: '/analytics', label: 'Analytics' },
]

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-cream-200/80 bg-cream/95 backdrop-blur-md">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav className="mx-auto flex max-w-7xl items-center justify-between page-padding py-3" aria-label="Main navigation">
        <NavLink
          to="/"
          className="text-lg font-semibold text-ink transition-opacity hover:opacity-80 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sage"
        >
          Fridge-to-Table
        </NavLink>
        <ul className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide sm:gap-2">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage ${
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
  )
}
