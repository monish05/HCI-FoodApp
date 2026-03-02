import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'

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
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title={mode === 'login' ? 'Welcome back' : 'Create your account'}
          subtitle="Sign in to personalize your recipes."
        />
        <div className="card mx-auto max-w-xl rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-ink-muted">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="input w-full"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-ink-muted">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="input w-full"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink-muted">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="input w-full"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="mb-2 block text-sm font-medium text-ink-muted">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    className="input w-full"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink-muted">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full pr-12"
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

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-muted">
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
    </PageContainer>
  )
}
