import { useEffect, useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import Modal from '../components/Modal'
import { useShopping } from '../context/ShoppingContext'
import { useFridge } from '../context/FridgeContext'
import { useAuth } from '../context/AuthContext'
import { getIngredients } from '../api/client'

export default function ShoppingList() {
  const {
    categories,
    toggle,
    addItemToCategory,
    updateItem,
    removeItem,
    moveItem,
    clearChecked,
    clearAll,
  } = useShopping()
  const { addItem, items: fridgeItems, updateItem: updateFridgeItem, removeItem: removeFridgeItem } = useFridge()
  const auth = useAuth()
  const [ingredients, setIngredients] = useState([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [countInput, setCountInput] = useState(1)
  const [showIngredientMenu, setShowIngredientMenu] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')
  const [showClearAllModal, setShowClearAllModal] = useState(false)
  const [showClearCheckedModal, setShowClearCheckedModal] = useState(false)

  const displayName = (value) =>
    (value || '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s*\[[^\]]*\]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

  const normalizeName = (value) =>
    (value || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()

  const defaultCategory = useMemo(() => {
    if (categories.Pantry) return 'Pantry'
    const keys = Object.keys(categories || {})
    return keys[0] || 'From receipt'
  }, [categories])

  useEffect(() => {
    if (!categoryInput) setCategoryInput(defaultCategory)
  }, [categoryInput, defaultCategory])

  useEffect(() => {
    let isMounted = true
    async function loadIngredients() {
      if (!auth.token) return
      try {
        const data = await getIngredients(auth.token)
        if (isMounted) setIngredients(data.ingredients || [])
      } catch (_) {
        if (isMounted) setIngredients([])
      }
    }
    loadIngredients()
    return () => { isMounted = false }
  }, [auth.token])

  const handleToggle = async (catName, item) => {
    const count = typeof item.count === 'number' ? item.count : 1
    const fridgeCategory = catName === 'For recipes' ? 'Other' : catName
    if (!item.checked) {
      await addItem({ name: item.name, count, daysLeft: 7, category: fridgeCategory })
      toggle(catName, item.id)
      return
    }

    let remaining = count
    const matches = (fridgeItems || [])
      .filter((entry) =>
        normalizeName(entry.name) === normalizeName(item.name) &&
        (entry.category || 'Other') === fridgeCategory
      )
      .sort((a, b) => Number(a.daysLeft ?? 9999) - Number(b.daysLeft ?? 9999))

    for (const entry of matches) {
      if (remaining <= 0) break
      const current = Number(entry.count ?? 1)
      const next = Math.max(0, current - remaining)
      const removed = current - next
      remaining -= removed
      if (next <= 0) {
        await removeFridgeItem(entry.id)
      } else {
        await updateFridgeItem(entry.id, { count: next })
      }
    }

    toggle(catName, item.id)
  }

  const handleAddItem = () => {
    if (!ingredientInput.trim()) return
    const normalizedCount = Math.max(1, Number(countInput) || 1)
    addItemToCategory(categoryInput || defaultCategory, ingredientInput, normalizedCount)
    setIngredientInput('')
    setCountInput(1)
  }

  const filteredIngredients = useMemo(() => {
    const query = ingredientInput.trim().toLowerCase()
    if (!query) return ingredients.slice(0, 12)
    return ingredients
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 12)
  }, [ingredients, ingredientInput])

  const [dragTarget, setDragTarget] = useState(null)

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Shopping list"
          subtitle="Check off as you shop"
        />
        <div className="mb-8 rounded-3xl border border-cream-200 bg-white/80 p-5 shadow-soft sm:p-6">
          <h3 className="text-base font-semibold text-ink">Add item</h3>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="relative flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Ingredient
              </label>
              <input
                value={ingredientInput}
                onChange={(event) => setIngredientInput(event.target.value)}
                onFocus={() => setShowIngredientMenu(true)}
                onBlur={() => {
                  setTimeout(() => setShowIngredientMenu(false), 100)
                }}
                placeholder="Start typing..."
                className="mt-2 w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink shadow-soft focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
              />
              {showIngredientMenu && ingredientInput.trim() && filteredIngredients.length > 0 && (
                <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
                  <ul className="max-h-64 overflow-auto py-1 text-sm">
                    {filteredIngredients.map((name) => (
                      <li key={name}>
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault()
                            setIngredientInput(name)
                            setShowIngredientMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-ink transition hover:bg-cream-100"
                        >
                          {displayName(name)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="w-full lg:w-52">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Category
              </label>
              <select
                value={categoryInput || defaultCategory}
                onChange={(event) => setCategoryInput(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink shadow-soft focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
              >
                {Object.keys(categories || {}).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCountInput(Math.max(1, Number(countInput) - 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-200 bg-white text-base font-semibold text-ink transition hover:bg-cream-100"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={countInput}
                onChange={(event) => setCountInput(event.target.value)}
                className="h-10 w-20 rounded-2xl border border-cream-200 bg-white px-3 text-center text-sm text-ink shadow-soft focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
              />
              <button
                type="button"
                onClick={() => setCountInput(Math.max(1, Number(countInput) + 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-200 bg-white text-base font-semibold text-ink transition hover:bg-cream-100"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sage px-6 text-sm font-semibold text-white shadow-soft transition hover:bg-sage-dark active:scale-[0.98]"
            >
              Add to list
            </button>
          </div>
        </div>
        <div className="space-y-8 sm:space-y-10">
          {Object.entries(categories).map(([catName, items]) => (
            <section
              key={catName}
              onDragOver={(event) => {
                event.preventDefault()
                setDragTarget(catName)
              }}
              onDragLeave={() => setDragTarget((prev) => (prev === catName ? null : prev))}
              onDrop={(event) => {
                event.preventDefault()
                const fromKey = event.dataTransfer.getData('text/category')
                const itemId = event.dataTransfer.getData('text/itemId')
                moveItem(fromKey, catName, itemId)
                setDragTarget(null)
              }}
              className={`rounded-3xl p-2 transition ${
                dragTarget === catName ? 'bg-sage/10 ring-2 ring-sage/30' : ''
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink sm:text-xl">{catName}</h3>
                {dragTarget === catName && (
                  <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-sage">
                    Drop here to move
                  </span>
                )}
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li key={item.id}>
                    <article
                      className="card card-lift group inline-flex w-full flex-col gap-3 rounded-2xl p-4 transition-all duration-200 ease-out sm:max-w-[360px]"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/category', catName)
                        event.dataTransfer.setData('text/itemId', item.id)
                        event.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={() => setDragTarget(null)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3
                            className={`text-base font-semibold leading-tight ${
                              item.checked ? 'text-ink-muted line-through' : 'text-ink'
                            }`}
                          >
                            {displayName(item.name)}
                          </h3>
                          <span className="mt-1 inline-flex items-center rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-muted">
                          Qty: {item.count ?? 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 bg-white text-ink-muted opacity-70 transition group-hover:opacity-100"
                            aria-hidden
                            title="Drag to move"
                          >
                            ⋮⋮
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(catName, item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                            aria-label="Delete item"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleToggle(catName, item)}
                            className="h-5 w-5 shrink-0 rounded-full border-cream-300 text-sage focus:ring-sage focus:ring-offset-2"
                          />
                            Add to fridge
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.checked) {
                                updateItem(catName, item.id, { count: 1, checked: false })
                                return
                              }
                              const next = Math.max(1, Number(item.count ?? 1) - 1)
                              updateItem(catName, item.id, { count: next })
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 bg-white text-base font-semibold text-ink transition hover:bg-cream-100"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-semibold text-ink">
                            {item.count ?? 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.checked) {
                                updateItem(catName, item.id, { count: 1, checked: false })
                                return
                              }
                              const next = Math.max(1, Number(item.count ?? 1) + 1)
                              updateItem(catName, item.id, { count: next })
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 bg-white text-base font-semibold text-ink transition hover:bg-cream-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowClearCheckedModal(true)}
            className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-6 py-3 text-sm font-semibold text-ink-muted shadow-soft transition hover:bg-cream-100"
            aria-label="Clear checked items"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 6h18" />
              <path d="M8 6v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
            Clear checked
          </button>
          <button
            type="button"
            onClick={() => setShowClearAllModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-rose-700"
            aria-label="Clear entire shopping list"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 6h18" />
              <path d="M8 6v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
            Clear all
          </button>
        </div>
        <Modal
          isOpen={showClearAllModal}
          onClose={() => setShowClearAllModal(false)}
          title="Clear shopping list"
        >
          <div className="rounded-2xl bg-rose-50 p-4 text-rose-900">
            <p className="text-sm font-semibold">
              This will delete all items in your shopping cart.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowClearAllModal(false)}
              className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-5 py-2 text-sm font-semibold text-ink-muted shadow-soft transition hover:bg-cream-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearAll()
                setShowClearAllModal(false)
              }}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-rose-700"
            >
              Delete all
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={showClearCheckedModal}
          onClose={() => setShowClearCheckedModal(false)}
          title="Clear checked items"
        >
          <div className="rounded-2xl bg-cream-50 p-4 text-ink">
            <p className="text-sm font-semibold">
              This will delete all checked items from your shopping cart.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowClearCheckedModal(false)}
              className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-5 py-2 text-sm font-semibold text-ink-muted shadow-soft transition hover:bg-cream-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearChecked()
                setShowClearCheckedModal(false)
              }}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-ink/90"
            >
              Delete checked
            </button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  )
}
