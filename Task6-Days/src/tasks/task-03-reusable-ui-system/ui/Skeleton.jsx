import { cx } from "@shared/cx";

/* aria-hidden on purpose — a screen reader shouldn't announce placeholder boxes. */

export default function Skeleton({ className, count = 1 }) {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      aria-hidden="true"
      className={cx("shimmer rounded-md", count > 1 && "mb-2 last:mb-0", className ?? "h-4 w-full")}
    />
  ));
}
