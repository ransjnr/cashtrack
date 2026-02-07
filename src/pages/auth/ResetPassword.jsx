import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../api/auth.js'

export default function ResetPassword() {
  const [form, setForm] = useState({ code: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!form.code.trim()) {
      setError('Enter the reset code.')
      return
    }
    
    if (!form.password.trim()) {
      setError('Enter your new password.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await resetPassword(email || '', form.code, form.password)
      navigate('/login')
    } catch (err) {
      let errorMsg = err.message || 'Password reset failed. Please try again.'
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network')) {
        errorMsg = 'Connection error. Please check your internet and try again.'
      } else if (errorMsg.includes('401') || errorMsg.includes('Invalid')) {
        errorMsg = 'Invalid reset code. Please try again.'
      }
      
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>Create new password</h2>
        <p className="muted">Enter the reset code and your new password.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          Reset code
          <input
            type="text"
            placeholder="Enter 6 digit code"
            value={form.code}
            onChange={handleChange('code')}
            disabled={isLoading}
          />
        </label>
        <label className="field">
          New password
          <input
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={handleChange('password')}
            disabled={isLoading}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update password'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
