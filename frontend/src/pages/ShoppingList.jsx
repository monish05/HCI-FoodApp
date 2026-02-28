import { useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { useShopping } from '../context/ShoppingContext'
import { useFridge } from '../context/FridgeContext'
import IngredientAutocomplete from '../components/IngredientAutocomplete'

const CATEGORIES = ['Protein', 'Dairy', 'Produce', 'Pantry', 'Other']

export default function ShoppingList() {
  const {
    categories,
    items,
    toggle,
    updateQuantity,
    removeItem,
    addItemToCategory,
    clearCrossedOff,
    updateItemCategory,
  } = useShopping()

  const { addMultipleItems } = useFridge()

  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('1')
  const [newCategory, setNewCategory] = useState('Other')

  // Tabs: All + each category
  const TABS = useMemo(() => ['All', ...CATEGORIES], [])
  const [activeTab, setActiveTab] = useState('All')

  const handleToggle = (item) => {
    toggle(item.id)
  }

  const handleClear = async () => {
    const crossedOff = clearCrossedOff()
    if (crossedOff.length > 0) {
      const toFridge = crossedOff.map((item) => ({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        daysLeft: 7,
        category: item.category,
      }))
      await addMultipleItems(toFridge)
    }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    addItemToCategory(newCategory, newName, Number(newAmount) || 1)
    setNewName('')
    setNewAmount('1')
  }

  const crossedOffCount = items.filter((i) => i.checked).length

  const tabItems = useMemo(() => {
    if (activeTab === 'All') return items
    return items.filter((i) => i.category === activeTab)
  }, [activeTab, items])

  const emptyStateText = useMemo(() => {
    if (activeTab === 'All') return 'No items in your shopping list yet.'
    return `No items in ${activeTab}.`
  }, [activeTab])

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader title="Shopping list" subtitle="Check off as you shop" />

        {/* Add Item (more compact) */}
        <div className="card mb-6 rounded-3xl p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink sm:text-lg">Add to List</h3>
            <div className="text-xs font-medium text-ink-muted">
              {crossedOffCount} ready for fridge
            </div>
          </div>

          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_160px_auto] sm:items-end">
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-ink">Ingredient</label>
              <IngredientAutocomplete value={newName} onChange={setNewName} placeholder="e.g. Tomato" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Amount</label>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input w-full"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={!newName.trim()}
            >
              Add
            </button>
          </form>

          {/* Clear bar */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              onClick={handleClear}
              disabled={crossedOffCount === 0}
              className="btn-secondary w-full text-sm sm:w-auto"
            >
              Clear &amp; Move to Fridge
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {TABS.map((tab) => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-ink text-cream' : 'bg-cream-100 text-ink hover:bg-cream-200',
                ].join(' ')}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Compact list (single list for all tabs) */}
        {tabItems.length === 0 ? (
          <div className="mt-10 text-center text-sm font-medium text-ink-muted">
            {emptyStateText}
          </div>
        ) : (
          <ul className="space-y-2 sm:space-y-3">
            {tabItems.map((item) => (
              <li key={item.id}>
                <div className="card flex items-center gap-3 rounded-2xl p-3 sm:p-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggle(item)}
                    className="h-5 w-5 shrink-0 cursor-pointer rounded-full border-cream-300 text-sage focus:ring-sage focus:ring-offset-2"
                  />

                  {/* Name + optional category badge (when viewing All) */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'min-w-0 truncate text-sm font-semibold sm:text-base',
                          item.checked ? 'text-ink-muted line-through' : 'text-ink',
                        ].join(' ')}
                      >
                        {item.name}
                      </span>

                      {activeTab === 'All' ? (
                        <span className="shrink-0 rounded-full bg-cream-100 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                          {item.category}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    {/* Category picker (quick move between tabs/types) */}
                    <select
                      value={item.category}
                      onChange={(e) => updateItemCategory(item.id, e.target.value)}
                      className="hidden rounded-lg bg-cream-100 px-2 py-2 text-xs font-semibold text-ink-muted hover:text-ink focus:ring-sage sm:block"
                      aria-label="Change category"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {/* Quantity - / + */}
                    <div className="flex items-center gap-1 rounded-full bg-cream-100 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-white hover:text-ink transition-colors disabled:opacity-40"
                        disabled={item.amount <= 0.25}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span className="w-10 text-center text-sm font-bold tabular-nums text-ink">
                        {item.amount}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-white hover:text-ink transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-tomato/10 text-tomato hover:bg-tomato hover:text-white transition-colors"
                      aria-label={`Remove ${item.name}`}
                      title="Remove"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Mobile-only category picker (keeps row compact on small screens) */}
                <div className="mt-2 sm:hidden">
                  <select
                    value={item.category}
                    onChange={(e) => updateItemCategory(item.id, e.target.value)}
                    className="input w-full text-sm"
                    aria-label="Change category"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  )
}