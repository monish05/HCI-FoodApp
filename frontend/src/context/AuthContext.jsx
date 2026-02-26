import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  )

  async function refreshMe(nextToken = token) {
    if (!nextToken) {
      setMe(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const res = await fetch(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${nextToken}` },
    })
    if (!res.ok) {
      logout()
      return
    }
    setMe(await res.json())
    setLoading(false)
  }

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
    await refreshMe(data.access_token)
  }

  async function register({ email, password, name }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) throw new Error('Register failed')
    const data = await res.json()
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
    await refreshMe(data.access_token)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setMe(null)
    setLoading(false)
  }

  useEffect(() => {
    refreshMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ API_BASE, token, me, loading, authHeader, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}