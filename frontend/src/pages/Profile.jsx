import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import FilterPill from '../components/FilterPill'
import { getFilters, getUserProfile, savePreferences, updateUserProfile } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [filters, setFilters] = useState({ cuisines: [], diets: [] })
  const [cuisines, setCuisines] = useState(auth.preferences?.cuisines || [])
  const [diets, setDiets] = useState(auth.preferences?.diets || [])
  const [firstName, setFirstName] = useState(auth.userName || '')
  const [lastName, setLastName] = useState(auth.userLastName || '')
  const [email, setEmail] = useState(auth.userEmail || '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avoidInput, setAvoidInput] = useState(
    (auth.preferences?.avoid_ingredients || []).join(', ')
  )
  const [maxCookTime, setMaxCookTime] = useState(
    auth.preferences?.max_cook_time ? String(auth.preferences.max_cook_time) : ''
  )
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    getFilters(auth.token)
      .then(setFilters)
      .catch(() => setFilters({ cuisines: [], diets: [] }))
    getUserProfile(auth.token)
      .then((profile) => {
        setFirstName(profile.first_name || '')
        setLastName(profile.last_name || '')
        setEmail(profile.email || '')
        setPhone(profile.phone || '')
        setAddress(profile.address || '')
        auth.setUserProfile({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
        })
      })
      .catch(() => {})
  }, [auth.isAuthenticated, auth.token, navigate])

  const avoidIngredients = useMemo(
    () => avoidInput.split(',').map((item) => item.trim()).filter(Boolean),
    [avoidInput],
  )

  const toggleValue = (value, list, setList) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const profilePayload = { first_name: firstName, last_name: lastName, phone, address }
      const profile = await updateUserProfile(auth.token, profilePayload)
      auth.setUserProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
      })

      const payload = {
        cuisines,
        diets,
        avoid_ingredients: avoidIngredients,
        max_cook_time: maxCookTime ? Number(maxCookTime) : null,
      }
      const prefs = await savePreferences(auth.token, payload, false)
      auth.setPreferences(prefs)
    } catch (err) {
      setError(err.message || 'Unable to update preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    auth.logout()
    navigate('/login', { replace: true })
  }

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Profile & preferences"
          subtitle="Update your tastes anytime."
        />
        <form onSubmit={handleSubmit} className="card rounded-3xl p-6 sm:p-8 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-ink-muted mb-3">Account details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
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
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink-muted">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input w-full"
                  value={email}
                  disabled
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
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="mb-2 block text-sm font-medium text-ink-muted">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  className="input w-full"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-muted mb-3">Cuisine preferences</h3>
            <div className="flex flex-wrap gap-3">
              {(filters.cuisines || []).slice(0, 18).map((cuisine) => (
                <FilterPill
                  key={cuisine}
                  label={cuisine}
                  active={cuisines.includes(cuisine)}
                  onClick={() => toggleValue(cuisine, cuisines, setCuisines)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-muted mb-3">Dietary preferences</h3>
            <div className="flex flex-wrap gap-3">
              {(filters.diets || []).slice(0, 18).map((diet) => (
                <FilterPill
                  key={diet}
                  label={diet}
                  active={diets.includes(diet)}
                  onClick={() => toggleValue(diet, diets, setDiets)}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="avoid" className="mb-2 block text-sm font-medium text-ink-muted">
              Ingredients to avoid (comma separated)
            </label>
            <input
              id="avoid"
              type="text"
              className="input w-full"
              placeholder="e.g. peanuts, shrimp"
              value={avoidInput}
              onChange={(e) => setAvoidInput(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="maxCookTime" className="mb-2 block text-sm font-medium text-ink-muted">
              Max cook time (minutes)
            </label>
            <input
              id="maxCookTime"
              type="number"
              min="0"
              className="input w-full"
              placeholder="e.g. 30"
              value={maxCookTime}
              onChange={(e) => setMaxCookTime(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-tomato/10 px-4 py-3 text-sm text-tomato-dark">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  )
}
