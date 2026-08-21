/* Falls back to initials when there's no image — the common real-world case. */

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({ name = "", src, size = "md", square = false }) {
  const className = `avatar ${size !== "md" ? `avatar--${size}` : ""} ${square ? "avatar--square" : ""}`;

  if (src) {
    return <img className={className} src={src} alt={name} />;
  }

  return (
    <span className={className} role="img" aria-label={name || "User"}>
      {initials(name) || "?"}
    </span>
  );
}
