import { Badge, Button, EmptyState } from "@ui";

const TONE = { high: "bad", medium: "warn", low: "ok" };

export default function TaskList({ tasks, totalCount, onToggle, onEdit, onDelete, onReset }) {
  if (!tasks.length) {
    return (
      <EmptyState
        title={totalCount ? "Nothing matches" : "No tasks yet"}
        message={
          totalCount ? "Try a different search or filter." : "Add your first one using the form."
        }
        action={
          totalCount ? (
            <Button size="sm" onClick={onReset}>
              Clear filters
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <ul className="list">
      {/* Stable keys — task 9's whole point */}
      {tasks.map(task => (
        <li className={`list__item ${task.done ? "list__item--done" : ""}`} key={task.id}>
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => onToggle(task.id)}
            aria-label={`Mark ${task.title} complete`}
          />
          <span className="list__text">{task.title}</span>
          <Badge tone={TONE[task.priority]}>{task.priority}</Badge>

          {/* Conditional action — finished tasks can't be edited */}
          {!task.done && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
              Edit
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onDelete(task)}>
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}
