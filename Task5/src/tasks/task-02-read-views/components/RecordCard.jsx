import { STATUS, PRIORITY, formatPrice, formatRelative, titleCase, titleOf } from "@model/model";
import { cx } from "@shared/cx";

export default function RecordCard({
  entity,
  record,
  onEdit,
  onDelete,
  pending,
  failed,
  actions = true
}) {
  const status = STATUS[record.status] ?? { label: record.status, tone: "" };

  return (
    <article className={cx("record", pending && "record--pending", failed && "record--failed")}>
      <div className="record__head">
        <p className="record__title">{titleOf(entity, record)}</p>
        <span className={cx("badge", status.tone && `badge--${status.tone}`)}>{status.label}</span>
      </div>

      {entity === "products" && (
        <>
          <p className="record__meta">
            {record.sku} · {titleCase(record.category)}
          </p>
          <p className="small" style={{ fontWeight: 700 }}>
            {formatPrice(record.price)}{" "}
            <span className={cx("tiny", Number(record.stock) === 0 && "muted")}>
              · {record.stock} in stock
            </span>
          </p>
        </>
      )}

      {entity === "users" && (
        <>
          <p className="record__meta">{record.email}</p>
          <span className="chip">{titleCase(record.role)}</span>
        </>
      )}

      {entity === "tasks" && (
        <>
          <p className="record__meta">
            {record.assignee} · due {record.dueDate}
          </p>
          <span className={cx("badge", `badge--${PRIORITY[record.priority]?.tone}`)}>
            {PRIORITY[record.priority]?.label ?? record.priority}
          </span>
        </>
      )}

      <p className="record__meta">edited {formatRelative(record.updatedAt)}</p>

      {pending && <p className="tiny muted">Saving…</p>}
      {failed && (
        <p className="tiny" style={{ color: "var(--bad)" }}>
          Rolled back — the save failed.
        </p>
      )}

      {actions && (
        <div className="record__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEdit?.(record)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onDelete?.(record)}
            style={{ color: "var(--bad)" }}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
