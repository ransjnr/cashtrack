import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await forgotPassword(email)
      setSuccess(true)
      setTimeout(() => {
        navigate('/reset-password', { state: { email } })
      }, 2000)
    } catch (err) {
      let errorMsg = err.message || 'Unable to send reset code. Please try again.'
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network')) {
        errorMsg = 'Connection error. Please check your internet and try again.'
      } else if (errorMsg.includes('404')) {
        errorMsg = 'Email account not found.'
      }
      
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>Reset access</h2>
        <p className="muted">We will email a secure reset code.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          Email address
          <input
            type="email"
            placeholder="you@business.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (error) setError('')
            }}
            disabled={isLoading}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p style={{ color: '#15803d', margin: '8px 0 0' }}>Reset code sent! Redirecting...</p> : null}
        <button className="btn primary" type="submit" disabled={isLoading || success}>
          {isLoading ? 'Sending...' : 'Send reset code'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Return to login</Link>
      </div>
    </div>
  )
}
