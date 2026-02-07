import { request } from './client.js'
import * as mockAuth from './authHelper.js'

export async function login(email, password) {
  // Try real API first
  if (!mockAuth.isMockAuthEnabled()) {
    try {
      const response = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      return response
    } catch (error) {
      // If real API fails and it's a network error, fall back to mock for development
      if (error.message.includes('Connection error') || error.message.includes('Failed to fetch')) {
        console.warn('Real API unavailable, using mock auth for development')
        return mockAuth.login(email, password)
      }
      throw error
    }
  }
  
  // Use mock auth if enabled
  return mockAuth.login(email, password)
}

export async function register(email, password, name) {
  // Try real API first
  if (!mockAuth.isMockAuthEnabled()) {
    try {
      const response = await request('/auth/register', {
        method: 'POST',
        body: { email, password, name },
      })
      return response
    } catch (error) {
      // If real API fails and it's a network error, fall back to mock for development
      if (error.message.includes('Connection error') || error.message.includes('Failed to fetch')) {
        console.warn('Real API unavailable, using mock auth for development')
        return mockAuth.register(email, password, name)
      }
      throw error
    }
  }
  
  // Use mock auth if enabled
  return mockAuth.register(email, password, name)
}

export async function verifyEmail(email, code) {
  // Try real API first
  if (!mockAuth.isMockAuthEnabled()) {
    try {
      const response = await request('/auth/verify-email', {
        method: 'POST',
        body: { email, code },
      })
      return response
    } catch (error) {
      // Fall back to mock for development
      if (error.message.includes('Connection error') || error.message.includes('Failed to fetch')) {
        console.warn('Real API unavailable, using mock auth for development')
        return mockAuth.verifyEmail(email, code)
      }
      throw error
    }
  }
  
  // Use mock auth if enabled
  return mockAuth.verifyEmail(email, code)
}

export async function forgotPassword(email) {
  // Try real API first
  if (!mockAuth.isMockAuthEnabled()) {
    try {
      const response = await request('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      })
      return response
    } catch (error) {
      // Fall back to mock for development
      if (error.message.includes('Connection error') || error.message.includes('Failed to fetch')) {
        console.warn('Real API unavailable, using mock auth for development')
        return mockAuth.forgotPassword(email)
      }
      throw error
    }
  }
  
  // Use mock auth if enabled
  return mockAuth.forgotPassword(email)
}

export async function resetPassword(email, code, password) {
  // Try real API first
  if (!mockAuth.isMockAuthEnabled()) {
    try {
      const response = await request('/auth/reset-password', {
        method: 'POST',
        body: { email, code, password },
      })
      return response
    } catch (error) {
      // Fall back to mock for development
      if (error.message.includes('Connection error') || error.message.includes('Failed to fetch')) {
        console.warn('Real API unavailable, using mock auth for development')
        return mockAuth.resetPassword(email, code, password)
      }
      throw error
    }
  }
  
  // Use mock auth if enabled
  return mockAuth.resetPassword(email, code, password)
}

