export default function Badge({ children, tone = "brand", solid = false }) {
  return (
    <span
      className={`badge ${tone !== "brand" ? `badge--${tone}` : ""} ${solid ? "badge--solid" : ""}`}
    >
      {children}
    </span>
  );
}
