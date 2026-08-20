import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { cx } from "@shared/cx";
import { NAV, GROUPS } from "./navigation";
import { Button } from "@ui";

/* One component serves both the fixed desktop rail and the mobile drawer —
   the parent controls which by passing `onClose`. */

export default function Sidebar({ onClose }) {
  return (
    <div className="bg-surface dark:bg-surface-dark flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <span className="bg-brand-600 grid size-7 place-items-center rounded-lg text-xs font-black text-white">
            A
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">Acme Admin</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400">Day 6 · 13 tasks</p>
          </div>
        </div>

        {onClose && (
          <Button variant="ghost" size="xs" onClick={onClose} aria-label="Close menu">
            <X className="size-4" />
          </Button>
        )}
      </div>

      <nav aria-label="Dashboard" className="scrollbar-slim flex-1 overflow-y-auto px-2 py-3">
        {GROUPS.map(group => (
          <div key={group} className="mb-4 last:mb-0">
            <p className="text-2xs px-2 pb-1 font-bold tracking-[0.12em] text-slate-400 uppercase">
              {group}
            </p>
            <ul className="space-y-0.5">
              {NAV.filter(item => item.group === group).map(item => (
                <li key={item.slug}>
                  <NavLink
                    to={`/${item.slug}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cx(
                        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-600 text-white shadow-sm"
                          : "hover:bg-sunk dark:hover:bg-sunk-dark text-slate-600 dark:text-slate-300"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cx("size-4 shrink-0", !isActive && "text-slate-400")}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                        <span
                          className={cx(
                            "text-2xs ml-auto font-mono tabular-nums",
                            isActive ? "text-white/70" : "text-slate-400"
                          )}
                        >
                          {String(item.num).padStart(2, "0")}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t p-3">
        <p className="text-2xs text-slate-500 dark:text-slate-400">React 19 · Tailwind 4 · Vite</p>
      </div>
    </div>
  );
}
