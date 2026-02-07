import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function VerifyEmail() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/login')
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
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
        <button className="btn primary" type="submit">
          Verify and sign in
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
