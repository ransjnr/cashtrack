export default function StatCard({ label, value, meta }) {
  return (
    <div className="stat-card">
      <span className="label">{label}</span>
      <p className="stat-value">{value}</p>
      {meta ? <p className="muted">{meta}</p> : null}
    </div>
  )
}
