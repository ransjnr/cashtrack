import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { login } from '../../api/auth.js'
import { isMockAuthEnabled } from '../../api/authHelper.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMockMode, setIsMockMode] = useState(false)
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setIsMockMode(isMockAuthEnabled())
  }, [])

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!form.email.trim()) {
      setError('Enter your email address.')
      return
    }
    
    if (!form.password.trim()) {
      setError('Enter your password.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await login(form.email, form.password)
      const token = response?.token || response?.data?.token
      
      if (!token) {
        setError('Login successful but no token received. Please try again.')
        return
      }
      
      setToken(token)
      const destination = location.state?.from || '/'
      navigate(destination)
    } catch (err) {
      let errorMsg = err.message || 'Login failed. Please check your credentials.'
      
      // More helpful error messages
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network')) {
        errorMsg = 'Connection error. Please check your internet and try again.'
      } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        errorMsg = 'Invalid email or password. Please try again.'
      } else if (errorMsg.includes('404')) {
        errorMsg = 'Account not found. Please register first.'
      }
      
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>Welcome back</h2>
        <p className="muted">Log in to your structured cash workspace.</p>
        {isMockMode && (
          <p style={{ fontSize: '0.85rem', color: '#2563eb', marginTop: '8px' }}>
            ℹ️ Using development mode (offline authentication)
          </p>
        )}
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          Email
          <input
            type="email"
            placeholder="you@business.com"
            value={form.email}
            onChange={handleChange('email')}
            disabled={isLoading}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange('password')}
            disabled={isLoading}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Create account</Link>
      </div>
    </div>
  )
}
