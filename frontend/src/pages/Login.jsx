import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import { useAuth } from '../context/AuthContext'

const EXPECT_ITEMS = [
  {
    title: 'Recipes that match your fridge',
    text: 'Get personalized suggestions from what you already have at home.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 12h6M9 17h4" />
      </svg>
    ),
  },
  {
    title: 'Smart meal planning',
    text: 'Plan the week faster with quick picks and expiring-first ideas.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Less waste, more wins',
    text: 'Track what to use soon and cook before ingredients expire.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4 0 7 3.4 7 7.6 0 5.7-7 10.4-7 10.4S5 16.3 5 10.6C5 6.4 8 3 12 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11.5 11.2 13l3.3-3.5" />
      </svg>
    ),
  },
]

export default function Login() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const action = mode === 'login' ? auth.login : auth.register
      const payload = mode === 'login'
        ? { email, password }
        : { email, password, first_name: firstName, last_name: lastName, phone, address }
      const res = await action(payload)
      const next = res.has_preferences ? '/' : '/survey'
      navigate(next, { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer className="!overflow-hidden !pb-0 !pt-4 md:!pt-6 md:!pb-0">
      <div className="page-content flex min-h-[calc(100dvh-1.5rem)] items-center py-2 md:min-h-[calc(100dvh-2.5rem)] md:py-3">
        <section className="w-full rounded-4xl border border-cream-200 bg-white p-5 shadow-card sm:p-6 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sage/10 ring-1 ring-cream-200">
                  <img src="/logo.svg" alt="Easy Kitchen" className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Meal Planning Companion</p>
                  <h1 className="text-4xl font-bold leading-tight text-ink">Easy Kitchen</h1>
                </div>
              </div>
              <p className="mt-3 max-w-xl text-lg text-ink-muted">
                {mode === 'login'
                  ? 'Everything you need to plan meals, use what you have, and cook without stress.'
                  : 'Create your account and personalize your kitchen in under a minute.'}
              </p>

              <div className="mt-6 rounded-3xl border border-cream-200 bg-cream-50 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">What to expect in the app</h2>
                <ul className="mt-4 space-y-4">
                    {EXPECT_ITEMS.map((item) => (
                      <li key={item.title} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white text-sage-dark ring-1 ring-cream-200">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-base font-semibold text-ink">{item.title}</p>
                          <p className="text-sm text-ink-muted">{item.text}</p>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-3xl border border-cream-200 bg-cream-50 p-5 sm:p-6">
              <div className="mb-4 border-b border-cream-200 pb-3.5">
                <h2 className="text-2xl font-bold text-ink">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {mode === 'login' ? 'Use your email to continue.' : 'Set up your account in under a minute.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-ink-muted">
                          First name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          className="input w-full bg-white shadow-none ring-1 ring-cream-200"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-ink-muted">
                          Last name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          className="input w-full bg-white shadow-none ring-1 ring-cream-200"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink-muted">
                        Phone number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="input w-full bg-white shadow-none ring-1 ring-cream-200"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="mb-1 block text-sm font-medium text-ink-muted">
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        className="input w-full bg-white shadow-none ring-1 ring-cream-200"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-muted">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input w-full bg-white shadow-none ring-1 ring-cream-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-muted">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input w-full bg-white pr-12 shadow-none ring-1 ring-cream-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 002.83 2.83" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A6.94 6.94 0 012 12c1.73 3.1 4.9 5 8.37 5 1.29 0 2.52-.26 3.62-.74" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.12 14.12A6.94 6.94 0 0022 12c-1.73-3.1-4.9-5-8.37-5-.95 0-1.86.14-2.71.4" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl bg-tomato/10 px-4 py-3 text-sm text-tomato-dark">
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary mt-1 w-full !rounded-2xl" disabled={loading}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-ink-muted">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="font-medium text-sage-dark hover:underline"
                >
                  {mode === 'login' ? 'Create one' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
