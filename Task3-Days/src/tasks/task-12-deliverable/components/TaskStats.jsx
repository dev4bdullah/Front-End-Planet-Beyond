export default function TaskStats({ stats }) {
  return (
    <div className="grid">
      <div className="stat">
        <span className="stat__value">{stats.total}</span>
        <span className="stat__label">Total</span>
      </div>
      <div className="stat">
        <span className="stat__value">{stats.done}</span>
        <span className="stat__label">Done</span>
      </div>
      <div className="stat">
        <span className="stat__value">{stats.open}</span>
        <span className="stat__label">Open</span>
      </div>
      <div className="stat">
        <span className="stat__value">{stats.rate}%</span>
        <span className="stat__label">Complete</span>
      </div>
    </div>
  );
}
