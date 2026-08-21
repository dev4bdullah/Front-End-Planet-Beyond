import { cx } from "@shared/cx";
import { Loader2 } from "lucide-react";

/* Variants live in a lookup object, not in a chain of ternaries inside the
   className. Adding a variant is one line, and every consumer gets it. */

const VARIANTS = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 border-transparent shadow-sm",
  secondary:
    "bg-sunk text-slate-800 hover:bg-hairline border-hairline dark:bg-sunk-dark dark:text-slate-100 dark:hover:bg-hairline-dark",
  outline:
    "bg-transparent text-slate-700 hover:bg-sunk border-hairline dark:text-slate-200 dark:hover:bg-sunk-dark",
  ghost:
    "bg-transparent text-slate-600 hover:bg-sunk border-transparent dark:text-slate-300 dark:hover:bg-sunk-dark",
  danger: "bg-danger-600 text-white hover:bg-danger-700 border-transparent shadow-sm",
  success: "bg-success-600 text-white hover:bg-success-700 border-transparent shadow-sm"
};

const SIZES = {
  xs: "h-7 px-2 text-2xs gap-1",
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2"
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  block = false,
  className,
  disabled,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-lg border font-semibold whitespace-nowrap transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-3.5" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
