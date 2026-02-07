import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function Outflows() {
  return (
    <div className="page">
      <PageHeader
        title="Outflows"
        subtitle="Plan vendor payments, salaries, and every cash exit."
      />

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>Upcoming outflows</h3>
            <span className="label">Next 14 days</span>
          </div>
          <EmptyState
            title="No outflows scheduled"
            description="Add your first outflow to start forecasting."
            action={<button className="btn primary" type="button">Add outflow</button>}
          />
        </div>
        <div className="panel">
          <div className="panel-header">
            <h3>Outflow mix</h3>
            <span className="label">Preview</span>
          </div>
          <div className="donut-placeholder" />
          <p className="muted">Categorize cash exits once your data arrives.</p>
        </div>
      </section>
    </div>
  )
}
