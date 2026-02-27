import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

const ShoppingContext = createContext(null)

const INITIAL_CATEGORIES = {
  Protein: [],
  Dairy: [],
  Produce: [],
  Pantry: [],
  Other: [],
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function ShoppingProvider({ children }) {
  const { API_BASE, authHeader, token } = useAuth()
  const [items, setItems] = useState([]) // Flat list in state

  // Load from backend
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) {
        setItems([])
        return
      }
      try {
        const res = await fetch(`${API_BASE}/api/shopping/me`, { headers: authHeader })
        if (!res.ok) throw new Error('Failed to fetch shopping list')
        const data = await res.json()
        const normalized = (data.items || []).map((it) => ({
          id: it.id || makeId(),
          name: it.name,
          amount: it.amount ?? 1,
          unit: it.unit ?? 'count',
          checked: !!it.checked,
          category: it.category || 'Other'
        }))
        if (!cancelled) setItems(normalized)
      } catch (err) {
        console.error(err)
      }
    }
    load()
    return () => { cancelled = true }
  }, [API_BASE, authHeader, token])

  // Persist to backend
  async function persist(nextItems) {
    if (!token) return
    await fetch(`${API_BASE}/api/shopping/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ items: nextItems }),
    })
  }

  // Group items by category for UI
  const categories = useMemo(() => {
    const grouped = { ...INITIAL_CATEGORIES }
    items.forEach(item => {
      const cat = grouped[item.category] ? item.category : 'Other'
      grouped[cat] = [...(grouped[cat] || []), item]
    })
    return grouped
  }, [items])

  const toggle = useCallback((id) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
      persist(next)
      return next
    })
  }, [authHeader])

  const updateQuantity = useCallback((id, delta) => {
    setItems((prev) => {
      const next = prev.map(item => {
        if (item.id === id) {
          const newAmount = Math.max(0.25, (item.amount || 1) + delta)
          return { ...item, amount: newAmount }
        }
        return item
      })
      persist(next)
      return next
    })
  }, [authHeader])

  const removeItem = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      persist(next)
      return next
    })
  }, [authHeader])

  const addItemToCategory = useCallback((categoryKey, name, amount = 1) => {
    const newItem = {
      id: makeId(),
      name: name.trim(),
      amount: amount,
      unit: 'count',
      checked: false,
      category: INITIAL_CATEGORIES[categoryKey] !== undefined ? categoryKey : 'Other'
    }
    setItems((prev) => {
      const next = [...prev, newItem]
      persist(next)
      return next
    })
  }, [authHeader])

  const addMultipleItems = useCallback((newItemsRaw) => {
    const normalized = newItemsRaw.map(it => ({
      id: it.id || makeId(),
      name: it.name,
      amount: it.amount ?? 1,
      unit: it.unit ?? 'count',
      checked: !!it.checked,
      category: it.category || 'Other'
    }))
    setItems(prev => {
      const next = [...prev, ...normalized]
      persist(next)
      return next
    })
  }, [authHeader])

  const clearCrossedOff = useCallback(() => {
    const removedItems = items.filter(i => i.checked)
    const next = items.filter(i => !i.checked)

    if (removedItems.length > 0) {
      setItems(next)
      persist(next)
    }
    return removedItems
  }, [items, authHeader])

  const updateItemCategory = useCallback((id, newCategory) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, category: newCategory } : item
      )
      persist(next)
      return next
    })
  }, [authHeader])

  const value = useMemo(
    () => ({ categories, items, toggle, updateQuantity, removeItem, addItemToCategory, addMultipleItems, clearCrossedOff, updateItemCategory }),
    [categories, items, toggle, updateQuantity, removeItem, addItemToCategory, addMultipleItems, clearCrossedOff, updateItemCategory]
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
