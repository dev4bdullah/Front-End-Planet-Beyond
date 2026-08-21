import { SCHEMAS } from "@model/model";
import { useRecordForm } from "@tasks/task-06-manual-validation/lib/useRecordForm";
import Field from "./Field";

/* One form for all three entities — the schema decides which fields render.
   Used by the create flow (task 3), the update flow (task 4) and the
   deliverable (task 13). */

export default function RecordForm({
  entity,
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  id = "record-form"
}) {
  const form = useRecordForm(entity, initial);

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} noValidate className="stack">
      {form.errorList.length > 0 && (
        <div className="summary" role="alert">
          <strong>
            {form.errorList.length} field{form.errorList.length === 1 ? "" : "s"} need attention
          </strong>
          <ul>
            {form.errorList.map(([name, message]) => (
              <li key={name}>
                <a
                  href={`#${name}`}
                  onClick={event => {
                    event.preventDefault();
                    document.querySelector(`[name="${name}"]`)?.focus();
                  }}
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {SCHEMAS[entity].fields.map(field => (
        <Field
          key={field.name}
          field={field}
          value={form.values[field.name]}
          error={form.errorFor(field.name)}
          onChange={form.setValue}
          onBlur={form.handleBlur}
          disabled={form.submitting}
        />
      ))}

      <div className="row" style={{ justifyContent: "flex-end" }}>
        {onCancel && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
            disabled={form.submitting}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn" disabled={form.submitting}>
          {form.submitting ? "Saving…" : submitLabel}
        </button>
      </div>

      <p className="tiny muted">
        dirty: {String(form.isDirty)} · errors: {form.errorList.length}
      </p>
    </form>
  );
}
