import { NavLink } from 'react-router-dom'

const navSections = [
  {
    label: 'Dashboard',
    items: [
      { to: '/', label: 'Overview' },
      { to: '/inflows', label: 'Inflows' },
      { to: '/outflows', label: 'Outflows' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/wallets', label: 'Wallets' },
      { to: '/budgets', label: 'Budgets' },
      { to: '/reports', label: 'Reports' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">CT</span>
        <div>
          <p>CashTrack</p>
          <span className="subtle">Structured finance</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label} className="nav-section">
            <span className="nav-label">{section.label}</span>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="label">Status</span>
        <p className="subtle">All systems ready</p>
      </div>
    </aside>
  )
}
