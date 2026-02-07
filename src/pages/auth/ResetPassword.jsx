import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [form, setForm] = useState({ code: '', password: '' })
  const navigate = useNavigate()

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/login')
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
          />
        </label>
        <label className="field">
          New password
          <input
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={handleChange('password')}
          />
        </label>
        <button className="btn primary" type="submit">
          Update password
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
