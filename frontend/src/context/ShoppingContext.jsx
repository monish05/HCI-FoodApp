import { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { shoppingCategories as defaultCategories } from '../data/mockData'

const STORAGE_KEY = 'fridge-to-feast-shopping'
const FROM_RECEIPT = 'From receipt'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultCategories
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : defaultCategories
  } catch {
    return defaultCategories
  }
}

const ShoppingContext = createContext(null)

export function ShoppingProvider({ children }) {
  const [categories, setCategories] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
    } catch (_) {}
  }, [categories])

  const toggle = useCallback((catKey, id) => {
    setCategories((prev) => {
      if (!prev[catKey]) return prev
      return {
        ...prev,
        [catKey]: prev[catKey].map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      }
    })
  }, [])

  const addItems = useCallback((names) => {
    const list = names.filter((n) => n?.trim()).map((name, i) => ({
      id: `receipt-${Date.now()}-${i}`,
      name: name.trim(),
      checked: false,
    }))
    if (list.length === 0) return 0
    setCategories((prev) => {
      const existing = prev[FROM_RECEIPT] || []
      return {
        ...prev,
        [FROM_RECEIPT]: [...existing, ...list],
      }
    })
    return list.length
  }, [])

  const value = useMemo(
    () => ({ categories, setCategories, toggle, addItems }),
    [categories, toggle, addItems]
  )

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  )
}

export function useShopping() {
  const ctx = useContext(ShoppingContext)
  if (!ctx) throw new Error('useShopping must be used within ShoppingProvider')
  return ctx
}
