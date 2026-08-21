/* Wraps a real checkbox rather than styling a div. Keyboard support, form
   participation and screen-reader semantics all come free that way. */

export default function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={event => onChange?.(event.target.checked)}
      />
      <span className={`switch__track ${checked ? "switch__track--on" : ""}`} aria-hidden="true">
        <span className={`switch__thumb ${checked ? "switch__thumb--on" : ""}`} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
