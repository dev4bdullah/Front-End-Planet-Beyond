import { useId } from "react";
import { cx } from "@shared/cx";

export default function Input({ label, error, hint, icon: Icon, id, className, ...rest }) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-2xs block font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cx(
            "bg-surface dark:bg-sunk-dark h-9 w-full rounded-lg border px-3 text-sm transition-colors",
            "focus:border-brand-500 placeholder:text-slate-400 focus:outline-none",
            Icon && "pl-8",
            error && "border-danger-500",
            className
          )}
          {...rest}
        />
      </div>

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-2xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-2xs text-danger-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
