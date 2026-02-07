import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/verify-email')
  }

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>Create your workspace</h2>
        <p className="muted">Set up your CashTrack account in minutes.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          Business name
          <input
            type="text"
            placeholder="Brightline Stores"
            value={form.name}
            onChange={handleChange('name')}
          />
        </label>
        <label className="field">
          Work email
          <input
            type="email"
            placeholder="finance@business.com"
            value={form.email}
            onChange={handleChange('email')}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange('password')}
          />
        </label>
        <button className="btn primary" type="submit">
          Continue
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
