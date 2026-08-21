import { AlertTriangle, Inbox, Lock, RefreshCw, SearchX, WifiOff } from "lucide-react";
import { Button, Card, Skeleton } from "@ui";

/* Task 10 — every state a data-fetching screen can be in.
   Kept in one file so the set is easy to audit: if a screen renders one of
   these, it should have a plan for all of them. */

export function LoadingState({ rows = 4 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-card bg-surface dark:bg-surface-dark border p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-3 h-6 w-24" />
          </div>
        ))}
      </div>
      <div className="rounded-card bg-surface dark:bg-surface-dark border p-3">
        <Skeleton className="h-8 w-full" count={rows} />
      </div>
      <span className="sr-only">Loading dashboard data</span>
    </div>
  );
}

export function EmptyDataState({ onSeed }) {
  return (
    <div className="rounded-card flex flex-col items-center gap-2 border border-dashed px-6 py-14 text-center">
      <span className="bg-sunk dark:bg-sunk-dark grid size-11 place-items-center rounded-full text-slate-400">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold">No orders yet</p>
      <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
        Once your store takes its first order it will appear here, along with revenue and customer
        figures.
      </p>
      <Button size="sm" onClick={onSeed} className="mt-2">
        Load sample data
      </Button>
    </div>
  );
}

export function NoResultsState({ query, onClear }) {
  return (
    <div className="rounded-card flex flex-col items-center gap-2 border border-dashed px-6 py-14 text-center">
      <span className="bg-sunk dark:bg-sunk-dark grid size-11 place-items-center rounded-full text-slate-400">
        <SearchX className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold">
        No results for{" "}
        {query ? <span className="font-mono">&ldquo;{query}&rdquo;</span> : "that filter"}
      </p>
      <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
        Your data is still here — nothing matches the current search and filters.
      </p>
      <Button size="sm" variant="secondary" onClick={onClear} className="mt-2">
        Clear filters
      </Button>
    </div>
  );
}

export function UnauthorizedState() {
  return (
    <Card className="border-warning-500/40 bg-warning-50 dark:bg-warning-500/10">
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <span className="bg-warning-500/15 text-warning-600 grid size-11 place-items-center rounded-full">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold">You don&apos;t have access to revenue data</p>
        <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
          This dashboard needs the <span className="font-mono">finance.read</span> permission. Your
          role is <span className="font-mono">support</span>.
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary">
            Request access
          </Button>
          <Button size="sm" variant="ghost">
            Back to orders
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ErrorRetryState({ message, onRetry, retrying, attempts, offline }) {
  const Icon = offline ? WifiOff : AlertTriangle;

  return (
    <Card className="border-danger-500/40 bg-danger-50 dark:bg-danger-500/10">
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <span className="bg-danger-500/15 text-danger-600 grid size-11 place-items-center rounded-full">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="text-danger-700 dark:text-danger-500 text-sm font-semibold">
          {offline ? "You appear to be offline" : "Couldn't load the dashboard"}
        </p>
        <p className="max-w-sm text-xs text-slate-600 dark:text-slate-300">
          {offline ? "Check your connection. We'll retry automatically when it returns." : message}
        </p>
        {attempts > 0 && (
          <p className="text-2xs text-slate-500 dark:text-slate-400">
            {attempts} attempt{attempts === 1 ? "" : "s"} so far
          </p>
        )}
        <Button
          size="sm"
          variant="danger"
          icon={RefreshCw}
          loading={retrying}
          onClick={onRetry}
          className="mt-2"
        >
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      </div>
    </Card>
  );
}
