import { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import {
  getFridgeItems,
  addFridgeItem,
  updateFridgeItem,
  deleteFridgeItem,
} from '../api/client'

const FridgeContext = createContext(null)

export function FridgeProvider({ children }) {
  const auth = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadItems() {
      if (!auth.token) {
        if (isMounted) {
          setItems([])
          setLoading(false)
        }
        return
      }
      try {
        const data = await getFridgeItems(auth.token)
        if (isMounted) {
          setItems(
            (data || []).map((item) => ({
              id: item.id,
              name: item.name,
              count: item.count,
              daysLeft: item.days_left ?? item.daysLeft ?? 7,
              category: item.category || 'Other',
            }))
          )
        }
      } catch (_) {
        if (isMounted) setItems([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadItems()
    return () => { isMounted = false }
  }, [auth.token])

  const refresh = useCallback(async () => {
    if (!auth.token) return
    const data = await getFridgeItems(auth.token)
    setItems(
      (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        count: item.count,
        daysLeft: item.days_left ?? item.daysLeft ?? 7,
        category: item.category || 'Other',
      }))
    )
  }, [auth.token])

  const addItem = useCallback(async (item) => {
    if (!auth.token) return null
    const entry = await addFridgeItem(auth.token, {
      name: item.name?.trim() || 'Unknown',
      count: typeof item.count === 'number' ? item.count : 1,
      days_left: typeof item.daysLeft === 'number' ? item.daysLeft : 7,
      category: item.category || 'Other',
    })
    const normalized = {
      id: entry.id,
      name: entry.name,
      count: entry.count,
      daysLeft: entry.days_left ?? entry.daysLeft ?? 7,
      category: entry.category || 'Other',
    }
    setItems((prev) => [...prev, normalized])
    return normalized.id
  }, [auth.token])

  const addItems = useCallback(async (list) => {
    if (!auth.token || list.length === 0) return 0
    const created = await Promise.all(
      list.map((item) =>
        addFridgeItem(auth.token, {
          name: item.name?.trim() || 'Unknown',
          count: typeof item.count === 'number' ? item.count : 1,
          days_left: typeof item.daysLeft === 'number' ? item.daysLeft : 7,
          category: item.category || 'Other',
        })
      )
    )
    const normalized = created.map((entry) => ({
      id: entry.id,
      name: entry.name,
      count: entry.count,
      daysLeft: entry.days_left ?? entry.daysLeft ?? 7,
      category: entry.category || 'Other',
    }))
    setItems((prev) => [...prev, ...normalized])
    return normalized.length
  }, [auth.token])

  const updateItem = useCallback(async (id, updates) => {
    if (!auth.token) return null
    const payload = {}
    if (updates.name != null) payload.name = updates.name
    if (updates.count != null) payload.count = updates.count
    if (updates.daysLeft != null) payload.days_left = updates.daysLeft
    if (updates.category != null) payload.category = updates.category
    const updated = await updateFridgeItem(auth.token, id, payload)
    const normalized = {
      id: updated.id,
      name: updated.name,
      count: updated.count,
      daysLeft: updated.days_left ?? updated.daysLeft ?? 7,
      category: updated.category || 'Other',
    }
    setItems((prev) => prev.map((item) => (item.id === id ? normalized : item)))
    return normalized
  }, [auth.token])

  const removeItem = useCallback(async (id) => {
    if (!auth.token) return
    await deleteFridgeItem(auth.token, id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [auth.token])

  const value = useMemo(
    () => ({ items, setItems, loading, addItem, addItems, updateItem, removeItem, refresh }),
    [items, loading, addItem, addItems, updateItem, removeItem, refresh]
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
