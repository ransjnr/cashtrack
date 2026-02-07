import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', token: '' })
  const [error, setError] = useState('')
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.token.trim()) {
      setError('Add your bearer token to continue.')
      return
    }
    setToken(form.token)
    const destination = location.state?.from || '/'
    navigate(destination)
  }

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>Welcome back</h2>
        <p className="muted">Log in to your structured cash workspace.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          Email
          <input
            type="email"
            placeholder="you@business.com"
            value={form.email}
            onChange={handleChange('email')}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange('password')}
          />
        </label>
        <label className="field">
          Bearer token
          <input
            type="password"
            placeholder="Paste token"
            value={form.token}
            onChange={handleChange('token')}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn primary" type="submit">
          Sign in
        </button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Create account</Link>
      </div>
    </div>
  )
}
