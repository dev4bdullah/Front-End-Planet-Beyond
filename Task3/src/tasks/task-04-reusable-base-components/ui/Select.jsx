import { useId } from "react";

export default function Select({
  label,
  error,
  hint,
  options = [],
  placeholder = "Choose one",
  required = false,
  id,
  ...rest
}) {
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

      <select
        id={fieldId}
        className={`field__control ${error ? "field__control--invalid" : ""}`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>

      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
