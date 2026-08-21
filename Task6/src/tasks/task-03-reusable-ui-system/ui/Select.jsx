import { useId } from "react";
import { cx } from "@shared/cx";
import { ChevronDown } from "lucide-react";

export default function Select({ label, options = [], placeholder, id, className, ...rest }) {
  const generated = useId();
  const selectId = id ?? generated;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-2xs block font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={cx(
            "bg-surface dark:bg-sunk-dark h-9 w-full appearance-none rounded-lg border pr-8 pl-3 text-sm",
            "focus:border-brand-500 focus:outline-none",
            className
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(option =>
            typeof option === "string" ? (
              <option key={option} value={option}>
                {option}
              </option>
            ) : (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )
          )}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
