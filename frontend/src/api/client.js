const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : '')
const TOKEN_KEY = 'auth_token'
const PROFILE_KEY = 'auth_profile'
const PREFS_KEY = 'has_preferences'

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  getProfile() {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  },
  setProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  },
  getHasPreferences() {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw === 'true'
  },
  setHasPreferences(value) {
    localStorage.setItem(PREFS_KEY, value ? 'true' : 'false')
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(PREFS_KEY)
  },
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    let message = error.detail || 'Request failed'
    if (Array.isArray(message)) {
      message = message
        .map((item) => item.msg || item.message || JSON.stringify(item))
        .join(', ')
    } else if (typeof message === 'object') {
      message = JSON.stringify(message)
    }
    throw new Error(message)
  }

  return res.json()
}

export async function register(payload) {
  return request('/auth/register', { method: 'POST', body: payload })
}

export async function login({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

export async function getPreferences(token) {
  return request('/preferences/me', { token })
}

export async function getUserProfile(token) {
  return request('/users/me', { token })
}

export async function updateUserProfile(token, payload) {
  return request('/users/me', { method: 'PUT', body: payload, token })
}

export async function savePreferences(token, payload, isNew = false) {
  return request('/preferences', {
    method: isNew ? 'POST' : 'PUT',
    body: payload,
    token,
  })
}

export async function getRecipes(token, params = {}) {
  const query = new URLSearchParams()
  if (params.limit) query.set('limit', String(params.limit))
  if (params.q) query.set('q', params.q)
  if (params.course) query.set('course', params.course)
  if (params.max_time) query.set('max_time', String(params.max_time))
  if (params.sort) query.set('sort', params.sort)
  if (params.ignore_prefs) query.set('ignore_prefs', 'true')
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request(`/recipes${suffix}`, { token })
}

export async function getRecipe(token, id) {
  return request(`/recipes/${id}`, { token })
}

export async function getSimilarRecipes(token, id) {
  return request(`/recipes/${id}/similar`, { token })
}

export async function getFilters(token) {
  return request('/recipes/filters', { token })
}

export async function getIngredients(token, limit = 500) {
  const query = new URLSearchParams()
  if (limit) query.set('limit', String(limit))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request(`/recipes/ingredients${suffix}`, { token })
}

export async function getFridgeItems(token) {
  return request('/fridge', { token })
}

export async function addFridgeItem(token, payload) {
  return request('/fridge', { method: 'POST', body: payload, token })
}

export async function updateFridgeItem(token, id, payload) {
  return request(`/fridge/${id}`, { method: 'PUT', body: payload, token })
}

export async function deleteFridgeItem(token, id) {
  return request(`/fridge/${id}`, { method: 'DELETE', token })
}

export async function consumeRecipe(token, recipeId) {
  return request('/fridge/consume', { method: 'POST', body: { recipe_id: recipeId }, token })
}
