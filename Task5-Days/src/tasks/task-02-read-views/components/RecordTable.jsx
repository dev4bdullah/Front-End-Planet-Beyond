import {
  SCHEMAS,
  STATUS,
  PRIORITY,
  formatPrice,
  formatRelative,
  titleCase,
  titleOf
} from "@model/model";
import { cx } from "@shared/cx";

/* The same records as the card view, laid out for scanning and comparison
   rather than for browsing. Low-priority columns drop out on narrow screens
   instead of the table overflowing. */

const COLUMNS = {
  products: [
    { key: "name", label: "Product" },
    { key: "sku", label: "SKU", hide: "hide-sm" },
    { key: "category", label: "Category", hide: "hide-md", render: r => titleCase(r.category) },
    { key: "price", label: "Price", align: "right", render: r => formatPrice(r.price) },
    { key: "stock", label: "Stock", align: "right" },
    { key: "status", label: "Status", render: r => statusBadge(r) }
  ],
  users: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email", hide: "hide-sm" },
    { key: "role", label: "Role", render: r => <span className="chip">{titleCase(r.role)}</span> },
    { key: "status", label: "Status", render: r => statusBadge(r) }
  ],
  tasks: [
    { key: "title", label: "Task" },
    { key: "assignee", label: "Assignee", hide: "hide-sm" },
    {
      key: "priority",
      label: "Priority",
      render: r => (
        <span className={cx("badge", `badge--${PRIORITY[r.priority]?.tone}`)}>
          {PRIORITY[r.priority]?.label ?? r.priority}
        </span>
      )
    },
    { key: "dueDate", label: "Due", hide: "hide-md" },
    { key: "status", label: "Status", render: r => statusBadge(r) }
  ]
};

function statusBadge(record) {
  const status = STATUS[record.status] ?? { label: record.status, tone: "" };
  return (
    <span className={cx("badge", status.tone && `badge--${status.tone}`)}>{status.label}</span>
  );
}

export default function RecordTable({
  entity,
  records,
  onEdit,
  onDelete,
  pending = [],
  failed = [],
  actions = true
}) {
  const columns = COLUMNS[entity] ?? [{ key: SCHEMAS[entity].titleField, label: "Name" }];

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={column.hide}
                style={{ textAlign: column.align ?? "left" }}
              >
                {column.label}
              </th>
            ))}
            <th className="hide-sm">Updated</th>
            {actions && <th style={{ textAlign: "right" }}>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {records.map(record => (
            <tr
              key={record.id}
              style={{
                opacity: pending.includes(record.id) ? 0.55 : 1,
                background: failed.includes(record.id)
                  ? "color-mix(in srgb, var(--bad) 8%, transparent)"
                  : undefined
              }}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={column.hide}
                  style={{ textAlign: column.align ?? "left" }}
                >
                  {column.render ? column.render(record) : (record[column.key] ?? "—")}
                </td>
              ))}

              <td className="hide-sm muted tiny">{formatRelative(record.updatedAt)}</td>

              {actions && (
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onEdit?.(record)}
                    aria-label={`Edit ${titleOf(entity, record)}`}
                  >
                    Edit
                  </button>{" "}
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    style={{ color: "var(--bad)" }}
                    onClick={() => onDelete?.(record)}
                    aria-label={`Delete ${titleOf(entity, record)}`}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
