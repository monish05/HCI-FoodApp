import { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { shoppingCategories as defaultCategories } from '../data/mockData'

const STORAGE_KEY = 'fridge-to-feast-shopping'
const FROM_RECEIPT = 'From receipt'
const FOR_RECIPES = 'For recipes'

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

  const addItemsToCategory = useCallback((categoryKey, names) => {
    const list = names.filter((n) => n?.trim()).map((name, i) => ({
      id: `item-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      checked: false,
    }))
    if (list.length === 0) return 0
    setCategories((prev) => {
      const existing = prev[categoryKey] || []
      return {
        ...prev,
        [categoryKey]: [...existing, ...list],
      }
    })
    return list.length
  }, [])

  const addItems = useCallback((names) => {
    return addItemsToCategory(FROM_RECEIPT, names)
  }, [addItemsToCategory])

  const value = useMemo(
    () => ({ categories, setCategories, toggle, addItems, addItemsToCategory }),
    [categories, toggle, addItems, addItemsToCategory]
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
