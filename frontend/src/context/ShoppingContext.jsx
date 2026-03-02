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

  const updateItem = useCallback((catKey, id, updates) => {
    setCategories((prev) => {
      if (!prev[catKey]) return prev
      return {
        ...prev,
        [catKey]: prev[catKey].map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }
    })
  }, [])

  const removeItem = useCallback((catKey, id) => {
    setCategories((prev) => {
      if (!prev[catKey]) return prev
      return {
        ...prev,
        [catKey]: prev[catKey].filter((item) => item.id !== id),
      }
    })
  }, [])

  const moveItem = useCallback((fromKey, toKey, id) => {
    if (!fromKey || !toKey || fromKey === toKey) return
    setCategories((prev) => {
      if (!prev[fromKey] || !prev[toKey]) return prev
      const item = prev[fromKey].find((entry) => entry.id === id)
      if (!item) return prev
      return {
        ...prev,
        [fromKey]: prev[fromKey].filter((entry) => entry.id !== id),
        [toKey]: [...prev[toKey], item],
      }
    })
  }, [])

  const clearCategory = useCallback((catKey) => {
    setCategories((prev) => {
      if (!prev[catKey]) return prev
      return {
        ...prev,
        [catKey]: [],
      }
    })
  }, [])

  const clearChecked = useCallback(() => {
    setCategories((prev) => {
      const next = {}
      for (const key of Object.keys(prev)) {
        next[key] = (prev[key] || []).filter((item) => !item.checked)
      }
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setCategories((prev) => {
      const next = {}
      for (const key of Object.keys(prev)) {
        next[key] = []
      }
      return next
    })
  }, [])

  const addItemsToCategory = useCallback((categoryKey, names) => {
    const list = names.filter((n) => n?.trim()).map((name, i) => ({
      id: `item-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      count: 1,
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

  const addItemToCategory = useCallback((categoryKey, name, count = 1) => {
    const trimmed = name?.trim()
    if (!trimmed) return 0
    const item = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      count: Math.max(1, Number(count) || 1),
      checked: false,
    }
    setCategories((prev) => {
      const existing = prev[categoryKey] || []
      return {
        ...prev,
        [categoryKey]: [...existing, item],
      }
    })
    return 1
  }, [])

  const addItems = useCallback((names) => {
    return addItemsToCategory(FROM_RECEIPT, names)
  }, [addItemsToCategory])

  const value = useMemo(
    () => ({
      categories,
      setCategories,
      toggle,
      addItems,
      addItemsToCategory,
      addItemToCategory,
      updateItem,
      removeItem,
      moveItem,
      clearCategory,
      clearChecked,
      clearAll,
    }),
    [
      categories,
      toggle,
      addItems,
      addItemsToCategory,
      addItemToCategory,
      updateItem,
      removeItem,
      moveItem,
      clearCategory,
      clearChecked,
      clearAll,
    ]
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
