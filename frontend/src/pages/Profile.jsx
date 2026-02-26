import { useEffect, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free']
const ALLERGY_OPTIONS = ['Peanut', 'Tree Nuts', 'Milk', 'Egg', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame']

function norm(s) {
  return String(s || '').trim()
}

export default function Profile() {
  const { API_BASE, authHeader } = useAuth()

  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [dietary, setDietary] = useState([])
  const [allergies, setAllergies] = useState([])
  const [timePreference, setTimePreference] = useState('any')

  // custom allergy input
  const [customAllergy, setCustomAllergy] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/user/prefs`, { headers: authHeader })
        const data = await res.json()
        const prefs = data.prefs || {}
        if (cancelled) return

        setDietary(prefs.dietary || [])
        setAllergies(prefs.allergies || [])
        setTimePreference(prefs.time_preference || 'any')
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [API_BASE, authHeader])

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  function addAllergy(value) {
    const v = norm(value)
    if (!v) return
    const exists = allergies.some((a) => a.toLowerCase() === v.toLowerCase())
    if (!exists) setAllergies([...allergies, v])
  }

  function removeAllergy(value) {
    setAllergies(allergies.filter((a) => a !== value))
  }

  async function onSave() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/user/prefs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          dietary,
          allergies,
          time_preference: timePreference,
          cuisines: [],
          spice_level: null,
        }),
      })
      if (!res.ok) throw new Error('save failed')
      setMsg('Saved!')
      setTimeout(() => setMsg(''), 1200)
    } catch (e) {
      console.error(e)
      setMsg('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader title="Profile" subtitle="Set preferences for personalized recipe suggestions." />

        {!loaded ? (
          <p className="py-10 text-center text-sm text-ink-muted">Loading…</p>
        ) : (
          <div className="card rounded-3xl p-6 sm:p-8">
            {/* Dietary */}
            <h2 className="text-base font-semibold text-ink">Dietary</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(dietary, setDietary, opt)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    dietary.includes(opt)
                      ? 'bg-sage/15 text-sage-dark'
                      : 'bg-cream-200/70 text-ink hover:bg-cream-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Allergies */}
            <h2 className="mt-8 text-base font-semibold text-ink">Allergies</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Add any allergens you want to avoid. You can also type your own.
            </p>

            {/* Quick-select */}
            <div className="mt-3 flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((opt) => {
                const active = allergies.some((a) => a.toLowerCase() === opt.toLowerCase())
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => (active ? removeAllergy(opt) : addAllergy(opt))}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-tomato/10 text-tomato-dark'
                        : 'bg-cream-200/70 text-ink hover:bg-cream-200'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Custom input */}
            <div className="mt-4 flex gap-2">
              <input
                className="input flex-1"
                placeholder="Custom allergy (e.g., kiwi, mustard)…"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAllergy(customAllergy)
                    setCustomAllergy('')
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  addAllergy(customAllergy)
                  setCustomAllergy('')
                }}
              >
                Add
              </button>
            </div>

            {/* Selected allergy chips */}
            {allergies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {allergies.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => removeAllergy(a)}
                    className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/10"
                    title="Click to remove"
                  >
                    {a} <span className="opacity-60">×</span>
                  </button>
                ))}
              </div>
            )}

            {/* Time preference */}
            <h2 className="mt-8 text-base font-semibold text-ink">Time preference</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { v: 'quick', label: 'Quick (≤20 min)' },
                { v: 'under30', label: 'Under 30 min' },
                { v: 'any', label: 'Any' },
              ].map((x) => (
                <button
                  key={x.v}
                  type="button"
                  onClick={() => setTimePreference(x.v)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    timePreference === x.v
                      ? 'bg-sage/15 text-sage-dark'
                      : 'bg-cream-100 text-ink hover:bg-cream-200/70'
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>

            {/* Save */}
            <div className="mt-8 flex items-center justify-end gap-3">
              {msg && <span className="text-sm text-ink-muted">{msg}</span>}
              <button type="button" className="btn-primary" onClick={onSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}