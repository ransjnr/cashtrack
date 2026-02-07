import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/reset-password')
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
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button className="btn primary" type="submit">
          Send reset code
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Return to login</Link>
      </div>
    </div>
  )
}
