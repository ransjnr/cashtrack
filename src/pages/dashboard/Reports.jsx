import PageHeader from '../../components/PageHeader.jsx'

export default function Reports() {
  return (
    <div className="page">
      <PageHeader
        title="Reports"
        subtitle="Export insights across inflows, outflows, and wallet balances."
      />

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>Performance snapshot</h3>
            <span className="label">Last 90 days</span>
          </div>
          <div className="report-highlight">
            <div>
              <span className="label">Net cash</span>
              <p className="stat-value">NGN 4,100,000</p>
            </div>
            <div>
              <span className="label">Best channel</span>
              <p className="stat-value">Transfer</p>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h3>Export center</h3>
            <span className="label">CSV or PDF</span>
          </div>
          <p className="muted">
            Generate a clean export once your transaction history lands.
          </p>
          <button className="btn ghost" type="button">
            Prepare export
          </button>
        </div>
      </section>
    </div>
  )
}
