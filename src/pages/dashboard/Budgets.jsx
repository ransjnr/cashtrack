import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function Budgets() {
  return (
    <div className="page">
      <PageHeader
        title="Budgets"
        subtitle="Allocate cash targets and monitor variance by team."
      />

      <section className="panel">
        <div className="panel-header">
          <h3>Budget tracker</h3>
          <span className="label">Monthly</span>
        </div>
        <EmptyState
          title="No budgets created"
          description="Start a new budget to track spend against targets."
          action={<button className="btn primary" type="button">Create budget</button>}
        />
      </section>
    </div>
  )
}
