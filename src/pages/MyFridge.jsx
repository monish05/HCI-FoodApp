import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import IngredientCard from '../components/IngredientCard'
import Modal from '../components/Modal'
import { fridgeItems as initialItems } from '../data/mockData'

export default function MyFridge() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(initialItems)
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newDays, setNewDays] = useState(5)

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase().trim())
  )

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setItems((prev) => [
      ...prev,
      {
        id: `f${Date.now()}`,
        name: newName.trim(),
        quantity: newQty.trim() || '1',
        daysLeft: Number(newDays) || 5,
      },
    ])
    setNewName('')
    setNewQty('')
    setNewDays(5)
    setModalOpen(false)
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <SectionHeader
          title="My Fridge"
          subtitle="Your ingredient inventory"
        />
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <label htmlFor="fridge-search" className="sr-only">
            Search ingredients
          </label>
          <input
            id="fridge-search"
            type="search"
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-12 flex-1 rounded-2xl border border-cream-300 bg-white px-4 shadow-soft focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            aria-label="Search ingredients"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="min-h-12 rounded-2xl bg-sage px-5 font-medium text-white shadow-soft transition-colors hover:bg-sage-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              Add item
            </button>
            <button
              type="button"
              className="min-h-12 rounded-2xl bg-cream-200 px-5 font-medium text-ink transition-colors hover:bg-cream-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              Upload receipt
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-cream-200/40 p-3 text-sm text-ink-muted">
          <span className="font-medium text-ink">Expiry:</span> 1–2 days (red) · 3–5 days (amber) · 6+ days (green)
        </div>

        {filtered.length > 0 ? (
          <ul className="mt-6 grid gap-3">
            {filtered.map((item) => (
              <li key={item.id}>
                <IngredientCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-soft">
            <p className="text-ink-muted">
              {search.trim() ? 'No ingredients match your search.' : 'No ingredients yet. Add items to track expiry.'}
            </p>
            {!search.trim() && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 text-sage font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded"
              >
                Add your first item
              </button>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add item">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-ink mb-1">
              Name
            </label>
            <input
              id="add-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Milk"
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="add-qty" className="block text-sm font-medium text-ink mb-1">
              Quantity
            </label>
            <input
              id="add-qty"
              type="text"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="e.g. 1 L"
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <div>
            <label htmlFor="add-days" className="block text-sm font-medium text-ink mb-1">
              Days until expiry
            </label>
            <input
              id="add-days"
              type="number"
              min="1"
              max="30"
              value={newDays}
              onChange={(e) => setNewDays(e.target.value)}
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-xl bg-cream-200 py-2.5 font-medium text-ink hover:bg-cream-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-sage py-2.5 font-medium text-white hover:bg-sage-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              Add
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  )
}
