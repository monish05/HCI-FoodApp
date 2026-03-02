import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import FilterPill from '../components/FilterPill'
import { getFilters, savePreferences } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Survey() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [filters, setFilters] = useState({ cuisines: [], diets: [] })
  const [cuisines, setCuisines] = useState([])
  const [diets, setDiets] = useState([])
  const [avoidInput, setAvoidInput] = useState('')
  const [maxCookTime, setMaxCookTime] = useState('')
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
      const payload = {
        cuisines,
        diets,
        avoid_ingredients: avoidIngredients,
        max_cook_time: maxCookTime ? Number(maxCookTime) : null,
      }
      const prefs = await savePreferences(auth.token, payload, true)
      auth.setPreferences(prefs)
      auth.setHasPreferences(true)
      navigate('/recipes', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to save preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Quick preference survey"
          subtitle="Tell us what you like so we can curate recipes for you."
        />
        <form onSubmit={handleSubmit} className="card rounded-3xl p-6 sm:p-8 space-y-8">
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

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save preferences'}
          </button>
        </form>
      </div>
    </PageContainer>
  )
}
