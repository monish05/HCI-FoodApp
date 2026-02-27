import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import IngredientCard from '../components/IngredientCard'
import AddItemModal from '../components/AddItemModal'
import { useFridge } from '../context/FridgeContext'

const CATEGORIES = ['Protein', 'Dairy', 'Produce', 'Pantry', 'Other']

export default function MyFridge() {
  const { items, updateCategory } = useFridge()
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [dragOverCat, setDragOverCat] = useState(null)

  const filtered = items
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase().trim())
    )
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))

  const groupedItems = {
    Protein: [], Dairy: [], Produce: [], Pantry: [], Other: []
  }

  filtered.forEach(item => {
    const cat = groupedItems[item.category] ? item.category : 'Other'
    groupedItems[cat].push(item)
  })

  const handleDragOver = (e, category) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCat !== category) {
      setDragOverCat(category)
    }
  }

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const isOutside =
      e.clientX < rect.left ||
      e.clientX >= rect.right ||
      e.clientY < rect.top ||
      e.clientY >= rect.bottom

    if (isOutside) {
      setDragOverCat(null)
    }
  }

  const handleDrop = (e, category) => {
    e.preventDefault()
    setDragOverCat(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      updateCategory(id, category)
    }
  }

  const hasItems = items.length > 0
  const hasFilteredResults = filtered.length > 0

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="My fridge"
          subtitle="Your ingredient inventory"
        />

        <div className="card mb-12 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
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
              className="btn-primary"
            >
              Add item
            </button>
          </div>
          <p className="mt-4 text-xs font-medium text-ink-muted leading-relaxed">
            Expiry: 1—2 days (red) · 3—5 days (amber) · 6+ days (green)
          </p>
        </div>

        {!hasItems ? (
          <div className="card rounded-3xl p-10 text-center sm:p-12">
            <p className="text-base text-ink-muted leading-relaxed">
              No ingredients yet. Add items manually or from a receipt.
            </p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="btn-primary mt-6"
            >
              Add item
            </button>
          </div>
        ) : !hasFilteredResults ? (
          <div className="card rounded-3xl p-10 text-center sm:p-12">
            <p className="text-base text-ink-muted leading-relaxed">
              No ingredients match your search "{search}".
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {CATEGORIES.map((cat) => {
              const isOver = dragOverCat === cat
              return (
                <section key={cat}>
                  <h2 className="mb-4 text-xl font-bold text-ink">{cat}</h2>
                  <div
                    onDragOver={(e) => handleDragOver(e, cat)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, cat)}
                    className={`min-h-[160px] rounded-3xl border-2 border-dashed transition-all duration-300 p-4 ${isOver
                        ? 'border-sage bg-sage/10 scale-[1.01] shadow-lg'
                        : 'border-transparent bg-transparent hover:border-sage/20 hover:bg-sage/5'
                      }`}
                  >
                    {groupedItems[cat]?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {groupedItems[cat].map((item) => (
                          <IngredientCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-3xl border border-cream-200/60 bg-cream-50/30">
                        <p className="text-sm font-medium text-ink-muted px-4 text-center">
                          Drop items here to move to {cat}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      <AddItemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </PageContainer>
  )
}
