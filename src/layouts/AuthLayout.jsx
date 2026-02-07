import { Link, Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero-inner">
          <span className="eyebrow">CashTrack</span>
          <h1>Own every cash movement.</h1>
          <p>
            Build a clean cash journal, split flows by channel, and keep your
            operations dashboard crisp and structured.
          </p>
          <div className="hero-metrics">
            <div>
              <span className="label">Structured views</span>
              <p className="metric">7 core modules</p>
            </div>
            <div>
              <span className="label">Realtime inflows</span>
              <p className="metric">API ready</p>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <h3>Security first</h3>
          <p>
            Your token never leaves this browser. We store it locally to keep
            API calls fast and controlled.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <Outlet />
        </div>
        <p className="auth-footer">
          Need help? <Link to="/login">Contact support</Link>
        </p>
      </section>
    </div>
  )
}
