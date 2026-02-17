import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import IngredientCard from '../components/IngredientCard'
import Modal from '../components/Modal'
import { fridgeItems as initialItems, FRIDGE_UNITS } from '../data/mockData'

export default function MyFridge() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(initialItems)
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('1')
  const [newUnit, setNewUnit] = useState('count')
  const [newDays, setNewDays] = useState(5)

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase().trim())
  )

  const handleRemove = (item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const amount = Number(newAmount) || 1
    setItems((prev) => [
      ...prev,
      {
        id: `f${Date.now()}`,
        name: newName.trim(),
        amount,
        unit: newUnit,
        daysLeft: Number(newDays) || 5,
      },
    ])
    setNewName('')
    setNewAmount('1')
    setNewUnit('count')
    setNewDays(5)
    setModalOpen(false)
  }

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="My Fridge"
          subtitle="Your ingredient inventory"
        />

        <div className="card mb-6 rounded-3xl p-6 sm:mb-8 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <input
              id="fridge-search"
              type="search"
              placeholder="Search ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input flex-1"
              aria-label="Search ingredients"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary w-full sm:w-auto"
              >
                Add item
              </button>
              <button type="button" className="btn-secondary w-full sm:w-auto">
                Upload receipt
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-muted leading-relaxed">
            <span className="font-medium text-ink">Expiry:</span> 1–2 days (red) · 3–5 days (amber) · 6+ days (green)
          </p>
        </div>

        {filtered.length > 0 ? (
          <ul className="grid gap-4 sm:gap-6">
            {filtered.map((item) => (
              <li key={item.id}>
                <IngredientCard item={item} onRemove={handleRemove} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card rounded-3xl p-10 text-center sm:p-12">
            <p className="text-base text-ink-muted leading-relaxed">
              {search.trim() ? 'No ingredients match your search.' : 'No ingredients yet. Add items to track expiry.'}
            </p>
            {!search.trim() && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary mt-6"
              >
                Add your first item
              </button>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add item">
        <form onSubmit={handleAdd} className="space-y-6">
          <div>
            <label htmlFor="add-name" className="mb-2 block text-sm font-medium text-ink">
              Name
            </label>
            <input
              id="add-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Milk"
              className="input"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label htmlFor="add-amount" className="mb-2 block text-sm font-medium text-ink">
                Amount
              </label>
              <input
                id="add-amount"
                type="number"
                min="0.25"
                step="0.25"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="2"
                className="input"
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="add-unit" className="mb-2 block text-sm font-medium text-ink">
                Unit
              </label>
              <select
                id="add-unit"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="input min-w-[7rem]"
              >
                {FRIDGE_UNITS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="add-days" className="mb-2 block text-sm font-medium text-ink">
              Days until expiry
            </label>
            <input
              id="add-days"
              type="number"
              min="1"
              max="30"
              value={newDays}
              onChange={(e) => setNewDays(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Add
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  )
}
