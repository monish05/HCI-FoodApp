import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  authStorage,
  login as apiLogin,
  register as apiRegister,
  getPreferences as apiGetPreferences,
} from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authStorage.getToken())
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState(authStorage.getProfile()?.first_name || null)
  const [userLastName, setUserLastName] = useState(authStorage.getProfile()?.last_name || null)
  const [userEmail, setUserEmail] = useState(authStorage.getProfile()?.email || null)
  const [preferences, setPreferences] = useState(null)
  const [hasPreferencesFlag, setHasPreferencesFlag] = useState(authStorage.getHasPreferences())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function hydrate() {
      if (!token) {
        if (isMounted) setLoading(false)
        return
      }
      try {
        const prefs = await apiGetPreferences(token)
        if (isMounted) setPreferences(prefs)
      } catch (error) {
        authStorage.clear()
        if (isMounted) setToken(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    hydrate()
    return () => { isMounted = false }
  }, [token])

  const hasPreferences = Boolean(hasPreferencesFlag)

  const value = useMemo(
    () => ({
      token,
      userId,
      userName,
      userLastName,
      userEmail,
      preferences,
      loading,
      isAuthenticated: Boolean(token),
      hasPreferences,
      async login(credentials) {
        const res = await apiLogin(credentials)
        authStorage.setToken(res.token)
        authStorage.setProfile({ first_name: res.first_name, last_name: res.last_name, email: res.email })
        authStorage.setHasPreferences(res.has_preferences)
        setToken(res.token)
        setUserId(res.user_id)
        setUserName(res.first_name)
        setUserLastName(res.last_name)
        setUserEmail(res.email)
        setHasPreferencesFlag(res.has_preferences)
        return res
      },
      async register(credentials) {
        const res = await apiRegister(credentials)
        authStorage.setToken(res.token)
        authStorage.setProfile({ first_name: res.first_name, last_name: res.last_name, email: res.email })
        authStorage.setHasPreferences(res.has_preferences)
        setToken(res.token)
        setUserId(res.user_id)
        setUserName(res.first_name)
        setUserLastName(res.last_name)
        setUserEmail(res.email)
        setHasPreferencesFlag(res.has_preferences)
        return res
      },
      async refreshPreferences() {
        if (!token) return null
        const prefs = await apiGetPreferences(token)
        setPreferences(prefs)
        if (prefs) {
          authStorage.setHasPreferences(true)
          setHasPreferencesFlag(true)
        }
        return prefs
      },
      setHasPreferences(value) {
        authStorage.setHasPreferences(value)
        setHasPreferencesFlag(Boolean(value))
      },
      setUserProfile(profile) {
        authStorage.setProfile(profile)
        setUserName(profile?.first_name || null)
        setUserLastName(profile?.last_name || null)
        setUserEmail(profile?.email || null)
      },
      logout() {
        authStorage.clear()
        setToken(null)
        setUserId(null)
        setPreferences(null)
        setUserName(null)
        setUserLastName(null)
        setUserEmail(null)
        setHasPreferencesFlag(false)
      },
      setPreferences,
    }),
    [token, userId, preferences, loading, hasPreferences, userName, userLastName, userEmail, hasPreferencesFlag],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
