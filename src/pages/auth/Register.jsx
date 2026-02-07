import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth.js'
import { isMockAuthEnabled } from '../../api/authHelper.js'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMockMode, setIsMockMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsMockMode(isMockAuthEnabled())
  }, [])

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!form.name.trim()) {
      setError('Enter your business name.')
      return
    }
    
    if (!form.email.trim()) {
      setError('Enter your email address.')
      return
    }
    
    if (!form.password.trim()) {
      setError('Create a password.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await register(form.email, form.password, form.name)
      navigate('/verify-email', { state: { email: form.email } })
    } catch (err) {
      let errorMsg = err.message || 'Registration failed. Please try again.'
      
      // More helpful error messages
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network')) {
        errorMsg = 'Connection error. Please check your internet and try again.'
      } else if (errorMsg.includes('409') || errorMsg.includes('already')) {
        errorMsg = 'This email is already registered. Try logging in instead.'
      } else if (errorMsg.includes('400') || errorMsg.includes('Invalid')) {
        errorMsg = 'Invalid input. Please check your entries.'
      }
      
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>Create your cashtrack account</h2>
        <p className="muted">Set up your CashTrack account in minutes.</p>
        {isMockMode && (
          <p style={{ fontSize: '0.85rem', color: '#2563eb', marginTop: '8px' }}>
            ℹ️ Using development mode (offline authentication)
          </p>
        )}
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          Business name
          <input
            type="text"
            placeholder="Rosemary"
            value={form.name}
            onChange={handleChange('name')}
            disabled={isLoading}
          />
        </label>
        <label className="field">
          Work email
          <input
            type="email"
            placeholder="finance@business.com"
            value={form.email}
            onChange={handleChange('email')}
            disabled={isLoading}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange('password')}
            disabled={isLoading}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Continue'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
