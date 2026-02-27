import { useState, useMemo, useRef } from 'react'
import Modal from './Modal'
import { useFridge } from '../context/FridgeContext'
import { FRIDGE_UNITS } from '../data/mockData'
import IngredientAutocomplete from './IngredientAutocomplete'

const MODES = { receipt: 'From receipt', manual: 'Add one item' }

// Parse "2 Milk" or "Milk" -> { name, amount }
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
  const { addItem, addItems } = useFridge()
  const [mode, setMode] = useState('manual')

  // Manual form
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('1')
  const [newUnit, setNewUnit] = useState('count')
  const [newDays, setNewDays] = useState(5)
  const [newCategory, setNewCategory] = useState('Other')

  // From receipt
  const [receiptText, setReceiptText] = useState('')
  const [receiptDays, setReceiptDays] = useState(7)
  const [receiptImage, setReceiptImage] = useState(null)
  const [receiptImagePreview, setReceiptImagePreview] = useState(null)
  const [addedCount, setAddedCount] = useState(0)
  const fileInputRef = useRef(null)

  const parsed = useMemo(() => {
    if (mode !== 'receipt') return []
    return receiptText.split(/\n/).map(parseLine).filter(Boolean)
  }, [mode, receiptText])

  const reset = () => {
    setNewName('')
    setNewAmount('1')
    setNewUnit('count')
    setNewDays(5)
    setNewCategory('Other')
    setReceiptText('')
    setReceiptDays(7)
    setAddedCount(0)
    if (receiptImagePreview) {
      URL.revokeObjectURL(receiptImagePreview)
    }
    setReceiptImage(null)
    setReceiptImagePreview(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleReceiptImage = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (receiptImagePreview) URL.revokeObjectURL(receiptImagePreview)
    setReceiptImage(file)
    setReceiptImagePreview(URL.createObjectURL(file))
  }

  const handleAddFromReceipt = () => {
    if (parsed.length === 0) return
    const items = parsed.map((p) => ({
      name: p.name,
      amount: p.amount,
      unit: 'count',
      daysLeft: receiptDays,
    }))
    const count = addItems(items)
    setAddedCount((c) => c + count)
  }

  const handleAddManual = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    addItem({
      name: newName.trim(),
      amount: Number(newAmount) || 1,
      unit: newUnit,
      daysLeft: Number(newDays) || 5,
      category: newCategory,
    })
    handleClose()
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
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${mode === key ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'receipt' && (
          <>
            <p className="text-sm text-ink-muted leading-relaxed">
              Scan your receipt (optional) or type items below. One item per line; use <strong>2 Milk</strong> for quantity.
            </p>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Receipt image (optional)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleReceiptImage}
                  className="hidden"
                  aria-label="Upload receipt photo"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  {receiptImagePreview ? 'Change photo' : 'Scan / Upload receipt'}
                </button>
                {receiptImagePreview && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                    <img
                      src={receiptImagePreview}
                      alt="Receipt"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="receipt-items" className="mb-1.5 block text-sm font-medium text-ink">
                Type or paste items (one per line)
              </label>
              <textarea
                id="receipt-items"
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
                placeholder="Milk&#10;2 Eggs&#10;Bread&#10;Chicken breast"
                rows={5}
                className="input w-full resize-y min-h-[120px]"
              />
            </div>

            {parsed.length > 0 && (
              <>
                <p className="text-sm font-medium text-ink">
                  {parsed.length} item{parsed.length !== 1 ? 's' : ''} → fridge
                </p>
                <div className="flex items-center gap-4">
                  <label htmlFor="receipt-days" className="text-sm text-ink-muted">
                    Days until expiry
                  </label>
                  <input
                    id="receipt-days"
                    type="number"
                    min="1"
                    max="30"
                    value={receiptDays}
                    onChange={(e) => setReceiptDays(Number(e.target.value) || 7)}
                    className="input w-20"
                  />
                </div>
              </>
            )}

            {addedCount > 0 && (
              <p className="rounded-2xl bg-sage/10 px-4 py-3 text-sm text-sage-dark" role="status">
                Added {addedCount} item{addedCount !== 1 ? 's' : ''} to fridge.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddFromReceipt}
                disabled={parsed.length === 0}
                className="btn-primary flex-1"
              >
                Add to fridge
              </button>
              <button type="button" onClick={handleClose} className="btn-secondary">
                Done
              </button>
            </div>
          </>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleAddManual} className="space-y-5">
            <div>
              <label htmlFor="add-name" className="mb-1.5 block text-sm font-medium text-ink">
                Name
              </label>
              <IngredientAutocomplete
                value={newName}
                onChange={setNewName}
                placeholder="e.g. Milk"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div>
                <label htmlFor="add-amount" className="mb-1.5 block text-sm font-medium text-ink">
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
                  className="input w-full"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="add-unit" className="mb-1.5 block text-sm font-medium text-ink">
                  Unit
                </label>
                <select
                  id="add-unit"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="input min-w-[7rem] w-full"
                >
                  {FRIDGE_UNITS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
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
                value={newDays}
                onChange={(e) => setNewDays(e.target.value)}
                className="input w-full max-w-[8rem]"
              />
            </div>
            <div>
              <label htmlFor="add-category" className="mb-1.5 block text-sm font-medium text-ink">
                Category
              </label>
              <select
                id="add-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input w-full"
              >
                {['Protein', 'Dairy', 'Produce', 'Pantry', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={!newName.trim()}>
                Add
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
