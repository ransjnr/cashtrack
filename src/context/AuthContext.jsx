import { createContext, useContext, useMemo, useState } from 'react'

const TOKEN_KEY = 'cashtrack_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() =>
    localStorage.getItem(TOKEN_KEY) || '',
  )

  const setToken = (value) => {
    const cleaned = (value || '').trim()
    setTokenState(cleaned)
    if (cleaned) {
      localStorage.setItem(TOKEN_KEY, cleaned)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  const logout = () => setToken('')

  const value = useMemo(
    () => ({
      token,
      setToken,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
