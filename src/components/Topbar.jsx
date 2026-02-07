import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const TITLE_MAP = {
  '/': 'Overview',
  '/inflows': 'Inflows',
  '/outflows': 'Outflows',
  '/wallets': 'Wallets',
  '/budgets': 'Budgets',
  '/reports': 'Reports',
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const title = TITLE_MAP[location.pathname] || 'Dashboard'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">Dashboard</span>
        <h2>{title}</h2>
      </div>
      <div className="topbar-actions">
        <Link className="btn ghost" to="/inflows">
          New inflow
        </Link>
        <button className="btn primary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}
