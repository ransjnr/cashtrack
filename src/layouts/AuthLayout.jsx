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
        </div>

      </section>
      <section className="auth-panel">
        {/* <div className="auth-card"> */}
          <Outlet />
        {/* </div> */}
      </section>
    </div>
  )
}
