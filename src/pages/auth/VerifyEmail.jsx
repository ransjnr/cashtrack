import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { verifyEmail } from '../../api/auth.js'

export default function VerifyEmail() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!code.trim()) {
      setError('Enter the verification code.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await verifyEmail(email || '', code)
      navigate('/login')
    } catch (err) {
      let errorMsg = err.message || 'Verification failed. Please try again.'
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network')) {
        errorMsg = 'Connection error. Please check your internet and try again.'
      } else if (errorMsg.includes('401') || errorMsg.includes('Invalid')) {
        errorMsg = 'Invalid verification code. Please try again.'
      }
      
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>Verify your email</h2>
        <p className="muted">Enter the verification code we sent you.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          Verification code
          <input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
              if (error) setError('')
            }}
            disabled={isLoading}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify and sign in'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
