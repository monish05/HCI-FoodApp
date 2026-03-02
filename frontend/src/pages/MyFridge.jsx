import { useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import IngredientCard from '../components/IngredientCard'
import AddItemModal from '../components/AddItemModal'
import Modal from '../components/Modal'
import { useFridge } from '../context/FridgeContext'

const CATEGORY_ORDER = ['Produce', 'Dairy', 'Protein', 'Pantry', 'Other']

function getExpiryVariant(daysLeft) {
  if (daysLeft <= 2) return 'tomato'
  if (daysLeft <= 5) return 'amber'
  return 'sage'
}

function normalizeName(name) {
  return (name || '').trim().toLowerCase()
}

export default function MyFridge() {
  const { items, removeItem, updateItem, addItem, loading } = useFridge()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [quickAddItem, setQuickAddItem] = useState(null)
  const [quickDaysLeft, setQuickDaysLeft] = useState(7)
  const [showClearModal, setShowClearModal] = useState(false)

  const filtered = useMemo(() => {
    return [...items].sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))
  }, [items])

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.count || 0), 0),
    [items]
  )

  const expiringSoonCount = useMemo(
    () => items.filter((item) => (item.daysLeft ?? 0) <= 2).length,
    [items]
  )

  const lowStockCount = useMemo(
    () => items.filter((item) => (item.count ?? 0) <= 1).length,
    [items]
  )

  const grouped = useMemo(() => {
    const groups = {}
    const byName = {}
    for (const item of filtered) {
      const nameKey = normalizeName(item.name)
      if (!byName[nameKey]) {
        byName[nameKey] = {
          ...item,
          count: item.count || 0,
        }
      } else {
        byName[nameKey].count += item.count || 0
      }
    }
    for (const key of Object.keys(byName)) {
      const item = byName[key]
      const category = item.category || 'Other'
      if (!groups[category]) groups[category] = []
      groups[category].push(item)
    }
    return groups
  }, [filtered])

  const handleSelect = (item) => {
    setSelectedId(item.id)
  }

  const handleIncrement = (item) => {
    setQuickAddItem(item)
    setQuickDaysLeft(item.daysLeft ?? 7)
  }

  const handleDecrement = (item) => {
    const next = (item.count || 0) - 1
    if (next <= 0) {
      removeItem(item.id)
    } else {
      updateItem(item.id, { count: next })
    }
  }

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="My Fridge"
          subtitle="Track ingredients, spot what expires soon, and keep stock in control"
        />

        <div className="mb-8 rounded-3xl border border-cream-200 bg-white/80 p-5 shadow-soft sm:p-6">
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-cream-100/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Total items</p>
              <p className="mt-1 text-xl font-bold text-ink">{totalCount}</p>
            </div>
            <div className="rounded-2xl bg-cream-100/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Expiring soon</p>
              <p className="mt-1 text-xl font-bold text-tomato-dark">{expiringSoonCount}</p>
            </div>
            <div className="rounded-2xl bg-cream-100/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Low stock</p>
              <p className="mt-1 text-xl font-bold text-amber-700">{lowStockCount}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Manage your fridge inventory</p>
              <p className="mt-0.5 text-sm text-ink-muted">Add ingredients and keep your stock updated.</p>
            </div>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-sage px-6 text-sm font-semibold text-white shadow-soft transition hover:bg-sage-dark active:scale-[0.98] lg:w-auto"
            >
              Add item
            </button>
          </div>

        </div>

        {loading ? (
          <div className="card rounded-3xl p-10 text-center sm:p-12">
            <p className="text-base text-ink-muted leading-relaxed">
              Loading your fridge...
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-8">
            {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((category) => (
              <section key={category}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {category}
                </h3>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {grouped[category].map((item) => (
                    <li key={item.id}>
                      <IngredientCard
                        item={item}
                        onIncrement={() => handleIncrement(item)}
                        onSelect={() => handleSelect(item)}
                        isSelected={selectedId === item.id}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {Object.keys(grouped).filter((cat) => !CATEGORY_ORDER.includes(cat)).map((category) => (
              <section key={category}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {category}
                </h3>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {grouped[category].map((item) => (
                    <li key={item.id}>
                      <IngredientCard
                        item={item}
                        onIncrement={() => handleIncrement(item)}
                        onSelect={() => handleSelect(item)}
                        isSelected={selectedId === item.id}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="card rounded-3xl p-10 text-center sm:p-12">
            <p className="text-base text-ink-muted leading-relaxed">
              No ingredients yet. Start by adding your first item.
            </p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="btn-primary mt-6"
            >
              Add item
            </button>
          </div>
        )}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-rose-700"
          >
            Clear fridge
          </button>
        </div>
      </div>

      <AddItemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <Modal
        isOpen={Boolean(quickAddItem)}
        onClose={() => setQuickAddItem(null)}
        title="Add count"
      >
        {quickAddItem && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Add one to <span className="font-semibold text-ink">{quickAddItem.name}</span>
            </p>
            <div>
              <label htmlFor="quick-days" className="mb-2 block text-sm font-medium text-ink-muted">
                Days left for this count
              </label>
              <input
                id="quick-days"
                type="number"
                min="1"
                max="30"
                value={quickDaysLeft}
                onChange={(e) => setQuickDaysLeft(Number(e.target.value) || 7)}
                className="input w-full"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setQuickAddItem(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
                <button
                  type="button"
                  onClick={async () => {
                    await addItem({
                      name: quickAddItem.name,
                      count: 1,
                      daysLeft: quickDaysLeft,
                      category: quickAddItem.category || 'Other',
                    })
                    setQuickAddItem(null)
                  }}
                  className="btn-primary flex-1"
                >
                  Add
                </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Item details"
      >
        {selectedId && (() => {
          const item = items.find((i) => i.id === selectedId)
          if (!item) return null
          const nameKey = normalizeName(item.name)
          const batches = items
            .filter((entry) => normalizeName(entry.name) === nameKey)
            .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))
          return (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-ink-muted">Name</p>
                <p className="text-lg font-semibold text-ink">{item.name}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Batches</p>
                <div className="mt-2 space-y-2">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between rounded-2xl bg-cream-100/70 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-ink">{batch.category || 'Other'}</p>
                        <p className="text-xs text-ink-muted">Count: {batch.count ?? 1}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          getExpiryVariant(batch.daysLeft) === 'tomato'
                            ? 'bg-tomato/15 text-tomato-dark'
                            : getExpiryVariant(batch.daysLeft) === 'amber'
                              ? 'bg-amber/20 text-amber-700'
                              : 'bg-sage/15 text-sage-dark'
                        }`}>
                          {batch.daysLeft} days left
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(batch.id)}
                          className="text-sm font-medium text-tomato-dark hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear fridge"
      >
        <div className="rounded-2xl bg-rose-50 p-4 text-rose-900">
          <p className="text-sm font-semibold">
            This will delete all items in your fridge.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowClearModal(false)}
            className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-5 py-2 text-sm font-semibold text-ink-muted shadow-soft transition hover:bg-cream-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              await Promise.all(items.map((item) => removeItem(item.id)))
              setShowClearModal(false)
            }}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-rose-700"
          >
            Delete all
          </button>
        </div>
      </Modal>
    </PageContainer>
  )
}
