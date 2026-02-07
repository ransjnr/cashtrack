import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function Wallets() {
  return (
    <div className="page">
      <PageHeader
        title="Wallets"
        subtitle="Track cash and bank wallets with clear ownership."
      />

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>Wallet list</h3>
            <span className="label">2 active</span>
          </div>
          <div className="wallet-list">
            <div className="wallet-card">
              <div>
                <span className="label">Cash vault</span>
                <p className="stat-value">NGN 420,000</p>
              </div>
              <span className="badge accent">Cash</span>
            </div>
            <div className="wallet-card">
              <div>
                <span className="label">Operations bank</span>
                <p className="stat-value">NGN 8,340,000</p>
              </div>
              <span className="badge neutral">Bank</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h3>Create wallet</h3>
            <span className="label">Setup</span>
          </div>
          <EmptyState
            title="Wallet creation"
            description="Add new cash boxes or bank accounts here."
            action={<button className="btn primary" type="button">New wallet</button>}
          />
        </div>
      </section>
    </div>
  )
}
