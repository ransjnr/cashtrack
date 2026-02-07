const API_BASE = 'https://cashtrack-01.onrender.com/api/v1'
const TOKEN_KEY = 'cashtrack_token'

const normalizeToken = (value) => value.replace(/^Bearer\s+/i, '').trim()

const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || ''

export async function request(path, options = {}) {
  const { method = 'GET', body, token } = options
  const resolvedToken = (token || getStoredToken()).trim()
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (body) {
    headers.set('Content-Type', 'application/json')
  }

  if (resolvedToken) {
    headers.set('Authorization', `Bearer ${normalizeToken(resolvedToken)}`)
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await response.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!response.ok) {
      const message = data?.message || data?.error || text || `HTTP ${response.status}`
      throw new Error(message)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error. Please check your connection.')
  }
}

