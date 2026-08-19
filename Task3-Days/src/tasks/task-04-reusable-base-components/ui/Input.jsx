import { useId } from "react";

/* useId gives a stable unique id, so label htmlFor and aria-describedby
   always match even with several inputs on the page. */

export default function Input({ label, error, hint, required = false, id, className, ...rest }) {
  const generated = useId();
  const inputId = id ?? generated;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="field__req" aria-hidden="true">
              {" *"}
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        className={`field__control ${error ? "field__control--invalid" : ""} ${className ?? ""}`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={[error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined}
        aria-required={required || undefined}
        {...rest}
      />

      {hint && !error && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
