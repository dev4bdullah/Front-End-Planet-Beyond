import { memo } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cx } from "@shared/cx";
import { Skeleton } from "@ui";

/* Sparkline drawn as a raw SVG polyline. Recharts for a 60x24 decoration would
   pull the whole charting library into a KPI card — see task 8 for the cost. */
function Sparkline({ points = [], tone }) {
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 60;
      const y = 22 - ((value - min) / span) * 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 60 24"
      className="h-6 w-16 shrink-0"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={path}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={
          tone === "up"
            ? "stroke-success-500"
            : tone === "down"
              ? "stroke-danger-500"
              : "stroke-slate-400"
        }
      />
    </svg>
  );
}

/* Loading variant lives in the same file as the real card, so the two can't
   drift apart in shape — the skeleton matches the layout it replaces. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-card bg-surface shadow-card dark:bg-surface-dark border p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-7 w-28" />
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}

const StatCard = memo(function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  delta,
  spark,
  invertDelta = false,
  format = v => v
}) {
  // A falling refund rate is good news, so some cards invert the colour
  const isGood = invertDelta ? delta < 0 : delta > 0;
  const isFlat = delta === 0 || delta === undefined;
  const DeltaIcon = isFlat ? Minus : delta > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-card bg-surface shadow-card hover:shadow-pop dark:bg-surface-dark border p-4 transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          {label}
        </p>
        <Sparkline points={spark} tone={isFlat ? "flat" : isGood ? "up" : "down"} />
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
        {prefix}
        {format(value)}
        {suffix}
      </p>

      {!isFlat && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span
            className={cx(
              "inline-flex items-center gap-0.5 font-semibold",
              isGood ? "text-success-600" : "text-danger-600"
            )}
          >
            <DeltaIcon className="size-3.5" aria-hidden="true" />
            {Math.abs(delta)}%
          </span>
          <span className="text-slate-500 dark:text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
});

export default StatCard;
