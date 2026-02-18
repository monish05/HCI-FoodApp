import { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { fridgeItems as defaultItems } from '../data/mockData'

const STORAGE_KEY = 'fridge-to-feast-fridge'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultItems
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : defaultItems
  } catch {
    return defaultItems
  }
}

const FridgeContext = createContext(null)

export function FridgeProvider({ children }) {
  const [items, setItems] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (_) {}
  }, [items])

  const addItem = useCallback((item) => {
    const entry = {
      id: item.id || `f${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: item.name?.trim() || 'Unknown',
      amount: typeof item.amount === 'number' ? item.amount : 1,
      unit: item.unit || 'count',
      daysLeft: typeof item.daysLeft === 'number' ? item.daysLeft : 7,
    }
    setItems((prev) => [...prev, entry])
    return entry.id
  }, [])

  const addItems = useCallback((list) => {
    const base = Date.now()
    const next = list.map((item, i) => ({
      id: `f${base}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      name: item.name?.trim() || 'Unknown',
      amount: typeof item.amount === 'number' ? item.amount : 1,
      unit: item.unit || 'count',
      daysLeft: typeof item.daysLeft === 'number' ? item.daysLeft : 7,
    }))
    setItems((prev) => [...prev, ...next])
    return next.length
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const value = useMemo(
    () => ({ items, setItems, addItem, addItems, removeItem }),
    [items, addItem, addItems, removeItem]
  )

  return (
    <FridgeContext.Provider value={value}>
      {children}
    </FridgeContext.Provider>
  )
}

export function useFridge() {
  const ctx = useContext(FridgeContext)
  if (!ctx) throw new Error('useFridge must be used within FridgeProvider')
  return ctx
}
