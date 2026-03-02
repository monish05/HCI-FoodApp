import { useMemo, useState } from 'react'
import Modal from './Modal'
import { useFridge } from '../context/FridgeContext'

const MODES = { quick: 'Quick add', bulk: 'Bulk add' }
const CATEGORIES = ['Produce', 'Dairy', 'Protein', 'Pantry', 'Other']
const EXPIRY_PRESETS = [
  { label: 'Soon', value: 3 },
  { label: 'This week', value: 7 },
  { label: 'Longer', value: 14 },
]
const POPULAR_INGREDIENTS = [
  'Milk',
  'Eggs',
  'Bread',
  'Chicken',
  'Tomatoes',
  'Onion',
  'Cheese',
  'Rice',
]

function parseLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return null
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/)
  if (match) {
    return { name: match[2].trim(), amount: parseFloat(match[1]) || 1 }
  }
  return { name: trimmed, amount: 1 }
}

export default function AddItemModal({ isOpen, onClose }) {
  const { addItem, addItems, items } = useFridge()
  const [mode, setMode] = useState('quick')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [count, setCount] = useState(1)
  const [daysLeft, setDaysLeft] = useState(7)
  const [category, setCategory] = useState('Other')

  const [bulkText, setBulkText] = useState('')
  const [bulkDaysLeft, setBulkDaysLeft] = useState(7)
  const [bulkCategory, setBulkCategory] = useState('Other')

  const parsed = useMemo(() => {
    if (mode !== 'bulk') return []
    return bulkText.split(/\n/).map(parseLine).filter(Boolean)
  }, [mode, bulkText])

  const suggestionNames = useMemo(() => {
    const existing = Array.from(
      new Set(
        (items || [])
          .map((item) => item.name?.trim())
          .filter(Boolean)
      )
    )
    const merged = Array.from(new Set([...existing, ...POPULAR_INGREDIENTS]))
    const query = name.trim().toLowerCase()
    if (!query) return merged.slice(0, 8)
    return merged
      .filter((value) => value.toLowerCase().includes(query))
      .slice(0, 8)
  }, [items, name])

  const canQuickAdd = Boolean(name.trim()) && Number(count) >= 1 && Number(daysLeft) >= 1
  const canBulkAdd = parsed.length > 0 && Number(bulkDaysLeft) >= 1

  const reset = () => {
    setMode('quick')
    setSaving(false)
    setError('')
    setName('')
    setCount(1)
    setDaysLeft(7)
    setCategory('Other')
    setBulkText('')
    setBulkDaysLeft(7)
    setBulkCategory('Other')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleQuickAdd = async (event) => {
    event.preventDefault()
    if (!canQuickAdd) return
    setSaving(true)
    setError('')
    try {
      await addItem({
        name: name.trim(),
        count: Number(count) || 1,
        daysLeft: Number(daysLeft) || 7,
        category,
      })
      handleClose()
    } catch (err) {
      setError(err?.message || 'Unable to add item right now.')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkAdd = async () => {
    if (!canBulkAdd) return
    setSaving(true)
    setError('')
    try {
      const payload = parsed.map((entry) => ({
        name: entry.name,
        count: Math.max(1, Number(entry.amount) || 1),
        daysLeft: Number(bulkDaysLeft) || 7,
        category: bulkCategory,
      }))
      await addItems(payload)
      handleClose()
    } catch (err) {
      setError(err?.message || 'Unable to add items right now.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add item">
      <div className="space-y-5">
        <div className="flex rounded-2xl bg-cream-100/80 p-1">
          {(Object.entries(MODES)).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                mode === key ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="rounded-2xl bg-tomato/10 px-4 py-3 text-sm text-tomato-dark" role="alert">
            {error}
          </p>
        ) : null}

        {mode === 'quick' && (
          <form onSubmit={handleQuickAdd} className="space-y-5">
            <div>
              <label htmlFor="add-name" className="mb-1.5 block text-sm font-medium text-ink">
                Ingredient
              </label>
              <input
                id="add-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Milk"
                className="input w-full"
                autoFocus
              />
              {suggestionNames.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestionNames.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setName(suggestion)}
                      className="rounded-full bg-cream-100 px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-cream-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-count" className="mb-1.5 block text-sm font-medium text-ink">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCount((prev) => Math.max(1, Number(prev || 1) - 1))}
                    className="h-10 w-10 rounded-xl border border-cream-200 text-lg font-semibold text-ink-muted hover:bg-cream-100"
                  >
                    −
                  </button>
                  <input
                    id="add-count"
                    type="number"
                    min="1"
                    step="1"
                    value={count}
                    onChange={(event) => setCount(Math.max(1, Number(event.target.value) || 1))}
                    className="input w-full text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setCount((prev) => Math.max(1, Number(prev || 1) + 1))}
                    className="h-10 w-10 rounded-xl border border-cream-200 text-lg font-semibold text-ink-muted hover:bg-cream-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="add-category" className="mb-1.5 block text-sm font-medium text-ink">
                  Category
                </label>
                <select
                  id="add-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="input w-full"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="add-days" className="mb-1.5 block text-sm font-medium text-ink">
                Days until expiry
              </label>
              <input
                id="add-days"
                type="number"
                min="1"
                max="30"
                  value={daysLeft}
                  onChange={(event) => setDaysLeft(Math.max(1, Number(event.target.value) || 7))}
                className="input w-full max-w-[8rem]"
              />
                <div className="mt-2 flex flex-wrap gap-2">
                  {EXPIRY_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setDaysLeft(preset.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        Number(daysLeft) === preset.value
                          ? 'bg-sage/20 text-sage-dark'
                          : 'bg-cream-100 text-ink-muted hover:bg-cream-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleClose} className="btn-secondary flex-1">
                Cancel
              </button>
                <button type="submit" className="btn-primary flex-1" disabled={!canQuickAdd || saving}>
                  {saving ? 'Adding…' : 'Add to fridge'}
              </button>
            </div>
          </form>
        )}

          {mode === 'bulk' && (
            <div className="space-y-5">
              <p className="text-sm text-ink-muted leading-relaxed">
                Paste one ingredient per line. Use formats like <strong>2 Milk</strong> or <strong>Chicken</strong>.
              </p>

              <textarea
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                placeholder="Milk&#10;2 Eggs&#10;Bread"
                rows={7}
                className="input w-full min-h-[140px] resize-y"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
                  <select
                    value={bulkCategory}
                    onChange={(event) => setBulkCategory(event.target.value)}
                    className="input w-full"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Days until expiry</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={bulkDaysLeft}
                    onChange={(event) => setBulkDaysLeft(Math.max(1, Number(event.target.value) || 7))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-cream-100/80 px-4 py-3 text-sm text-ink-muted">
                {parsed.length > 0
                  ? `${parsed.length} item${parsed.length !== 1 ? 's' : ''} ready to add`
                  : 'Add at least one line to continue'}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkAdd}
                  disabled={!canBulkAdd || saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Adding…' : 'Add all items'}
                </button>
              </div>
            </div>
          )}
      </div>
    </Modal>
  )
}
