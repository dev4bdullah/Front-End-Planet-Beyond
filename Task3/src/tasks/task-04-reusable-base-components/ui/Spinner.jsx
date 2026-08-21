export default function Spinner({ size = "md", label = "Loading" }) {
  return (
    <span
      className={`spinner ${size !== "md" ? `spinner--${size}` : ""}`}
      role="status"
      aria-label={label}
    />
  );
}
