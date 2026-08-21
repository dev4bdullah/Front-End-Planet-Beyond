import { useId } from "react";

export default function Textarea({ label, error, hint, required = false, id, ...rest }) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={fieldId}>
          {label}
          {required && <span className="field__req"> *</span>}
        </label>
      )}
      <textarea
        id={fieldId}
        className={`field__control ${error ? "field__control--invalid" : ""}`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
