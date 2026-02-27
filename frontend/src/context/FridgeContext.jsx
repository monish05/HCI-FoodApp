import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { fridgeItems as mockFridgeItems } from '../data/mockData'

const FridgeContext = createContext(null)

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function FridgeProvider({ children }) {
  const { API_BASE, authHeader, token } = useAuth()
  const [items, setItems] = useState([])

  // Load fridge from backend after login
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) {
        setItems([])
        return
      }
      try {
        const res = await fetch(`${API_BASE}/api/fridge/me`, { headers: authHeader })
        if (!res.ok) throw new Error('fridge fetch failed')
        const data = await res.json()
        const normalized = (data.items || []).map((it) => ({
          id: it.id || makeId(),
          name: it.name,
          amount: it.amount ?? it.qty ?? 1,
          unit: it.unit ?? 'count',
          daysLeft: it.daysLeft ?? 7,
          category: it.category || 'Other'
        }))
        if (!cancelled) setItems(normalized)
      } catch {
        // fallback for demo if backend empty
        if (!cancelled) setItems(mockFridgeItems)
      }
    }
    load()
    return () => { cancelled = true }
  }, [API_BASE, authHeader, token])

  async function persist(nextItems) {
    if (!token) return
    await fetch(`${API_BASE}/api/fridge/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ items: nextItems }),
    })
  }

  const addItem = async (item) => {
    const next = [{ ...item, id: item.id || makeId() }, ...items]
    setItems(next)
    await persist(next)
  }

  const removeItem = async (id) => {
    const next = items.filter((x) => x.id !== id)
    setItems(next)
    await persist(next)
  }

  const updateAmount = async (id, delta) => {
    const next = items.map(item => {
      if (item.id === id) {
        const newAmount = Math.max(0, (item.amount || 0) + delta)
        return { ...item, amount: newAmount }
      }
      return item
    }).filter(it => it.amount > 0)
    setItems(next)
    await persist(next)
  }

  const decrementItems = async (ingredientNames) => {
    const namesNorm = ingredientNames.map(n => n.toLowerCase().trim())
    const next = items.map(item => {
      const match = namesNorm.some(nn =>
        item.name.toLowerCase().trim().includes(nn) ||
        nn.includes(item.name.toLowerCase().trim())
      )
      if (match) {
        return { ...item, amount: Math.max(0, (item.amount || 0) - 1) }
      }
      return item
    }).filter(it => it.amount > 0)
    setItems(next)
    await persist(next)
  }

  const updateCategory = async (id, newCategory) => {
    const next = items.map(it => it.id === id ? { ...it, category: newCategory } : it)
    setItems(next)
    await persist(next)
  }

  const addMultipleItems = async (itemsToAdd) => {
    if (!token) return
    try {
      // Call the new specific backend merge endpoint
      const res = await fetch(`${API_BASE}/api/fridge/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ items: itemsToAdd }),
      })
      if (res.ok) {
        const data = await res.json()
        const normalized = (data.items || []).map((it) => ({
          id: it.id || makeId(),
          name: it.name,
          amount: it.amount ?? 1,
          unit: it.unit ?? 'count',
          daysLeft: it.daysLeft ?? 7,
          category: it.category || 'Other'
        }))
        setItems(normalized)
      }
    } catch (err) {
      console.error("Failed to add multiple items to fridge", err)
    }
  }

  const value = useMemo(() => ({ items, addItem, removeItem, updateAmount, decrementItems, updateCategory, addMultipleItems, setItems }), [items])
  return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>
}

export function useFridge() {
  return useContext(FridgeContext)
}