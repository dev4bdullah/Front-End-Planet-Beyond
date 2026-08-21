import { useState } from "react";
import { Code2 } from "lucide-react";

/* Wrappers every task page uses, so the layout and the "show code" affordance
   stay identical across all thirteen. */

export function PageHeader({ number, title, brief, lead, actions }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <p className="text-2xs text-brand-600 dark:text-brand-400 font-bold tracking-[0.14em] uppercase">
          Day 6 · Task {number}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {lead && <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">{lead}</p>}
        {brief && (
          <p className="border-brand-500 max-w-2xl border-l-2 pl-3 text-xs text-slate-500 dark:text-slate-400">
            Sheet description: {brief}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

export function Section({ title, note, code, children, className }) {
  const [open, setOpen] = useState(false);

  return (
    <section
      className={`rounded-card bg-surface shadow-card dark:bg-surface-dark border ${className ?? ""}`}
    >
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {code && (
          <button
            type="button"
            onClick={() => setOpen(value => !value)}
            className="text-brand-600 dark:text-brand-400 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold hover:underline"
          >
            <Code2 className="size-3.5" />
            {open ? "Hide code" : "Show code"}
          </button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {note && <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">{note}</p>}
        {children}
        {open && (
          <pre className="scrollbar-slim overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-200">
            {code.trim()}
          </pre>
        )}
      </div>
    </section>
  );
}
