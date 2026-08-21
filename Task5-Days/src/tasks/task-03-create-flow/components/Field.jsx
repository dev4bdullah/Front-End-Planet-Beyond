import { useId } from "react";
import { titleCase } from "@model/model";

/* One component per field type, driven by the schema from task 1.
   useId ties the label, hint and error together, so several instances on a
   page can never share an id. */

export default function Field({ field, value, error, onChange, onBlur, disabled }) {
  const generated = useId();
  const id = `${generated}-${field.name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const common = {
    id,
    name: field.name,
    value: value ?? "",
    disabled,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby":
      [error && errorId, field.hint && hintId].filter(Boolean).join(" ") || undefined,
    className: error ? "is-invalid" : undefined,
    onChange: event => onChange?.(field.name, event.target.value),
    onBlur: () => onBlur?.(field.name)
  };

  return (
    <div className="field">
      <label htmlFor={id}>
        {field.label}
        {field.required && <span style={{ color: "var(--bad)" }}> *</span>}
      </label>

      {field.type === "select" ? (
        <select {...common}>
          <option value="">Choose one</option>
          {field.options.map(option => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea {...common} rows={3} style={{ resize: "vertical", minHeight: "70px" }} />
      ) : (
        <input
          {...common}
          type={field.type === "number" ? "number" : field.type}
          step={field.step}
          // The type attribute is kept even with custom validation — it's what
          // gives a phone the right keyboard
          inputMode={field.type === "number" ? "decimal" : undefined}
        />
      )}

      {field.hint && !error && (
        <p className="field__hint" id={hintId}>
          {field.hint}
        </p>
      )}

      <p className="field__error" id={errorId} role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
  );
}
