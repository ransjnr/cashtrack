// Development/Mock Auth Support
// Set VITE_MOCK_AUTH=true in .env.local to use mock authentication
const USE_MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true'

// Simple in-memory mock database for development
const mockAccounts = new Map()

export async function login(email, password) {
  if (USE_MOCK_AUTH) {
    const account = mockAccounts.get(email)
    if (account && account.password === password) {
      return { token: `mock_token_${Date.now()}`, email, name: account.name }
    }
    throw new Error('Invalid email or password.')
  }
  // Use real API
  return null
}

export async function register(email, password, name) {
  if (USE_MOCK_AUTH) {
    if (mockAccounts.has(email)) {
      throw new Error('Email already registered.')
    }
    mockAccounts.set(email, { password, name, email })
    return { success: true, message: 'Registration successful!' }
  }
  // Use real API
  return null
}

export async function verifyEmail(email, code) {
  if (USE_MOCK_AUTH) {
    // Mock verification - any code works in dev mode
    return { success: true, message: 'Email verified!' }
  }
  // Use real API
  return null
}

export async function forgotPassword(email) {
  if (USE_MOCK_AUTH) {
    // Mock password reset - always succeeds
    return { success: true, message: 'Reset code sent!' }
  }
  // Use real API
  return null
}

export async function resetPassword(email, code, password) {
  if (USE_MOCK_AUTH) {
    const account = mockAccounts.get(email)
    if (account) {
      account.password = password
      return { success: true, message: 'Password reset successful!' }
    }
    throw new Error('Account not found.')
  }
  // Use real API
  return null
}

export function isMockAuthEnabled() {
  return USE_MOCK_AUTH
}
