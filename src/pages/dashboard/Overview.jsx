import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'

export default function Overview() {
  return (
    <div className="page">
      <PageHeader
        title="Overview"
        subtitle="Your cash position, structured by inflows, outflows, and wallets."
      />

      <section className="stat-grid">
        <StatCard label="Total balance" value="NGN 12,480,000" meta="+5.2% this month" />
        <StatCard label="Inflows" value="NGN 3,200,000" meta="42 deposits" />
        <StatCard label="Outflows" value="NGN 1,980,000" meta="18 payments" />
        <StatCard label="Cash on hand" value="NGN 720,000" meta="2 wallets" />
      </section>

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>Flow mix</h3>
            <span className="badge accent">Healthy</span>
          </div>
          <div className="bar-stack">
            <div style={{ width: '58%' }} className="bar inflow" />
            <div style={{ width: '42%' }} className="bar outflow" />
          </div>
          <div className="bar-meta">
            <div>
              <span className="label">Inflows</span>
              <p>58%</p>
            </div>
            <div>
              <span className="label">Outflows</span>
              <p>42%</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Top channels</h3>
            <span className="label">Last 30 days</span>
          </div>
          <ul className="list">
            <li>
              <span>Bank transfer</span>
              <span>NGN 1,840,000</span>
            </li>
            <li>
              <span>POS collections</span>
              <span>NGN 820,000</span>
            </li>
            <li>
              <span>Cash payments</span>
              <span>NGN 540,000</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Operational focus</h3>
          <span className="label">Today</span>
        </div>
        <div className="focus-grid">
          <div>
            <span className="label">Next payout</span>
            <p className="focus-value">NGN 250,000</p>
            <p className="muted">Supplier settlement due in 2 days.</p>
          </div>
          <div>
            <span className="label">Cash target</span>
            <p className="focus-value">NGN 1,200,000</p>
            <p className="muted">Current coverage at 60%.</p>
          </div>
          <div>
            <span className="label">Alerts</span>
            <p className="focus-value">2 pending</p>
            <p className="muted">Budget variance for marketing.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
