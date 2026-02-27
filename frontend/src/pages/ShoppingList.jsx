import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { useShopping } from '../context/ShoppingContext'
import { useFridge } from '../context/FridgeContext'
import IngredientAutocomplete from '../components/IngredientAutocomplete'

const CATEGORIES = ['Protein', 'Dairy', 'Produce', 'Pantry', 'Other']

export default function ShoppingList() {
  const { categories, items, toggle, updateQuantity, removeItem, addItemToCategory, clearCrossedOff, updateItemCategory } = useShopping()
  const { addMultipleItems } = useFridge()

  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('1')
  const [newCategory, setNewCategory] = useState('Other')

  const handleToggle = (item) => {
    toggle(item.id)
  }

  const handleClear = async () => {
    const crossedOff = clearCrossedOff()
    if (crossedOff.length > 0) {
      const toFridge = crossedOff.map(item => ({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        daysLeft: 7, // default expiry
        category: item.category
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

  // Count crossed off items
  const crossedOffCount = items.filter(i => i.checked).length

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Shopping list"
          subtitle="Check off as you shop"
        />

        {/* Add Item Form */}
        <div className="card mb-8 rounded-3xl p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-bold text-ink">Add to List</h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-ink">Ingredient</label>
              <IngredientAutocomplete
                value={newName}
                onChange={setNewName}
                placeholder="e.g. Tomato"
              />
            </div>
            <div className="w-full sm:w-24">
              <label className="mb-1.5 block text-sm font-medium text-ink">Amount</label>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input w-full"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto mt-2 sm:mt-0" disabled={!newName.trim()}>
              Add
            </button>
          </form>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm font-medium text-ink-muted">
            {crossedOffCount} item{crossedOffCount !== 1 ? 's' : ''} ready for fridge
          </p>
          <button
            onClick={handleClear}
            disabled={crossedOffCount === 0}
            className="btn-secondary text-sm px-4 py-2"
          >
            Clear & Move to Fridge
          </button>
        </div>

        <div className="space-y-8 sm:space-y-10">
          {Object.entries(categories).map(([catName, catItems]) => {
            if (catItems.length === 0) return null;
            return (
              <section key={catName}>
                <h3 className="mb-4 text-lg font-bold text-ink sm:text-xl">{catName}</h3>
                <ul className="space-y-3">
                  {catItems.map((item) => (
                    <li key={item.id}>
                      <div className="card card-lift flex flex-col sm:flex-row sm:items-center gap-4 rounded-3xl p-5 transition-all duration-200 focus-within:ring-2 focus-within:ring-sage focus-within:ring-offset-2 sm:p-6">

                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleToggle(item)}
                            className="h-5 w-5 shrink-0 rounded-full border-cream-300 text-sage focus:ring-sage focus:ring-offset-2 cursor-pointer"
                          />
                          <span
                            className={`min-w-0 flex-1 truncate text-base font-medium leading-relaxed ${item.checked ? 'text-ink-muted line-through' : 'text-ink'
                              }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-3 sm:mt-0 ml-9 sm:ml-0">
                          <select
                            value={item.category}
                            onChange={(e) => updateItemCategory(item.id, e.target.value)}
                            className="text-xs bg-cream-100 border-none rounded-lg px-2 py-1 focus:ring-sage cursor-pointer text-ink-muted hover:text-ink transition-colors"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="flex items-center gap-2 bg-cream-100 rounded-lg p-1">
                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-ink-muted hover:text-ink font-medium transition-colors" disabled={item.amount <= 0.25}>-</button>
                            <span className="text-sm font-medium w-6 text-center">{item.amount}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-ink-muted hover:text-ink font-medium transition-colors">+</button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-tomato/10 text-tomato hover:bg-tomato hover:text-white transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>

                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </PageContainer>
  )
}
