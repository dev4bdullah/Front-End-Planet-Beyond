export default function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="state">
      <strong className="state__title">{title}</strong>
      {message && <p>{message}</p>}
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}
