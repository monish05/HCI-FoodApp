import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import IngredientCard from '../components/IngredientCard'
import AddItemModal from '../components/AddItemModal'
import { useFridge } from '../context/FridgeContext'

export default function MyFridge() {
  const { items, removeItem } = useFridge()
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase().trim())
  )

  const handleRemove = (item) => {
    removeItem(item.id)
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
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="btn-primary w-full sm:w-auto"
            >
              Add item
            </button>
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
              {search.trim() ? 'No ingredients match your search.' : 'No ingredients yet. Add items or from a receipt.'}
            </p>
            {!search.trim() && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="btn-primary mt-6"
              >
                Add item
              </button>
            )}
          </div>
        )}
      </div>

      <AddItemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </PageContainer>
  )
}
