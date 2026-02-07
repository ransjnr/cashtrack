import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p className="muted">This page does not exist yet.</p>
      <Link className="btn primary" to="/">
        Go to dashboard
      </Link>
    </div>
  )
}
