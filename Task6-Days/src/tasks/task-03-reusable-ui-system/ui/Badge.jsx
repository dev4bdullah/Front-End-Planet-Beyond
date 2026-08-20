import { cx } from "@shared/cx";

const TONES = {
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300",
  success: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
  warning: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500",
  danger: "bg-danger-50 text-danger-700 dark:bg-danger-500/15 dark:text-danger-500",
  neutral: "bg-sunk text-slate-600 dark:bg-sunk-dark dark:text-slate-400"
};

export default function Badge({ children, tone = "neutral", dot = false, className }) {
  return (
    <span
      className={cx(
        "text-2xs inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold capitalize",
        TONES[tone],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
