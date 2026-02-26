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

  const value = useMemo(() => ({ items, addItem, removeItem, setItems }), [items])
  return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>
}

export function useFridge() {
  return useContext(FridgeContext)
}