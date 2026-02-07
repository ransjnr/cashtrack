export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-card">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action ? <div className="empty-actions">{action}</div> : null}
    </div>
  )
}
