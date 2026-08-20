import { cx } from "@shared/cx";

const SIZES = { sm: "size-6 text-2xs", md: "size-8 text-xs", lg: "size-11 text-sm" };

/* Deterministic colour from the name, so the same person is always the same
   colour without storing one. */
const PALETTE = [
  "bg-brand-600",
  "bg-success-600",
  "bg-warning-600",
  "bg-danger-600",
  "bg-slate-600"
];

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({ name = "", size = "md", className }) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return (
    <span
      role="img"
      aria-label={name || "Unassigned"}
      className={cx(
        "grid shrink-0 place-items-center rounded-full font-bold text-white select-none",
        SIZES[size],
        name ? PALETTE[hash % PALETTE.length] : "bg-slate-300 dark:bg-slate-700",
        className
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
