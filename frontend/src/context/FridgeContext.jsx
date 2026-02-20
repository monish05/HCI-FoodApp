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

  const isSimilar = useCallback((a, b) => {
    const na = (a || '').toLowerCase().trim()
    const nb = (b || '').toLowerCase().trim()
    if (!na || !nb) return false
    if (na === nb) return true
    return na.includes(nb) || nb.includes(na)
  }, [])

  const hasSimilar = useCallback((list, name) => {
    return list.some((i) => isSimilar((i.name || ''), name))
  }, [isSimilar])

  const addItem = useCallback((item) => {
    const name = item.name?.trim() || 'Unknown'
    if (hasSimilar(items, name)) return { added: false, alreadyInFridge: true }
    const entry = {
      id: item.id || `f${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      daysLeft: typeof item.daysLeft === 'number' ? item.daysLeft : 7,
    }
    setItems((prev) => [...prev, entry])
    return { added: true, id: entry.id }
  }, [items, hasSimilar])

  const addItems = useCallback((list) => {
    const results = { added: 0, alreadyInFridge: [] }
    const base = Date.now()
    const toAdd = []
    list.forEach((item, i) => {
      const name = item.name?.trim() || 'Unknown'
      const inFridge = hasSimilar(items, name)
      const inBatch = toAdd.some((t) => isSimilar(t.name, name))
      if (inFridge || inBatch) {
        if (inFridge) results.alreadyInFridge.push(name)
        return
      }
      toAdd.push({
        id: `f${base}-${i}-${Math.random().toString(36).slice(2, 9)}`,
        name,
        daysLeft: typeof item.daysLeft === 'number' ? item.daysLeft : 7,
      })
      results.added++
    })
    if (toAdd.length > 0) setItems((prev) => [...prev, ...toAdd])
    return results
  }, [items, hasSimilar, isSimilar])

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
