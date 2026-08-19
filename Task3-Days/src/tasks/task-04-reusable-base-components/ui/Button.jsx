/* Variant + size as props, never as separate components.
   ButtonPrimary / ButtonSmall / ButtonPrimarySmall is how a codebase ends up
   with 30 near-identical files. */

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  active = false,
  loading = false,
  disabled = false,
  type = "button",
  className,
  ...rest // everything else — onClick, aria-*, data-* — passes straight through
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        "btn",
        variant !== "primary" && `btn--${variant}`,
        size !== "md" && `btn--${size}`,
        block && "btn--block",
        active && "btn--active",
        className
      )}
      {...rest}
    >
      {loading && <span className="spinner spinner--sm" aria-hidden="true" />}
      {children}
    </button>
  );
}
