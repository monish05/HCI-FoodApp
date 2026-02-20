import { useState } from 'react'
import Modal from './Modal'
import { useFridge } from '../context/FridgeContext'

export default function AddItemModal({ isOpen, onClose }) {
  const { addItem } = useFridge()
  const [newName, setNewName] = useState('')
  const [newDays, setNewDays] = useState(7)
  const [alreadyInFridge, setAlreadyInFridge] = useState(false)

  const reset = () => {
    setNewName('')
    setNewDays(7)
    setAlreadyInFridge(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setAlreadyInFridge(false)
    const result = addItem({
      name: newName.trim(),
      daysLeft: Number(newDays) || 7,
    })
    if (result.added) {
      handleClose()
    } else {
      setAlreadyInFridge(true)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add item">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="add-name" className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="add-name"
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              setAlreadyInFridge(false)
            }}
            placeholder="e.g. Milk"
            className="input w-full"
            autoFocus
          />
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
        {alreadyInFridge && (
          <p className="rounded-2xl bg-tomato/10 px-4 py-3 text-sm text-tomato" role="alert">
            Already in fridge.
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={!newName.trim()}>
            Add
          </button>
        </div>
      </form>
    </Modal>
  )
}
