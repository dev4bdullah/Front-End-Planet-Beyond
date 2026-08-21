import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Button, Card, Badge } from "@ui";
import { kpis, formatNumber, formatCurrency, activity } from "@shared/data";
import StatCard, { StatCardSkeleton } from "./components/StatCard";

export default function Page() {
  const [loading, setLoading] = useState(false);

  const simulate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1400);
  };

  return (
    <>
      <PageHeader
        number={4}
        title="Stats & KPI Cards"
        brief="Build dashboard stat cards with labels, values, deltas, and loading skeleton states"
        lead="Four cards, a sparkline each, and a skeleton that matches the real card's layout exactly."
        actions={
          <Button variant="secondary" size="sm" onClick={simulate}>
            Simulate loading
          </Button>
        }
      />

      <Section
        title="The KPI row"
        note="A 1 / 2 / 4 column grid. On a phone the cards stack, on a tablet they pair up, on a laptop they sit in one row — one class list, three layouts."
        code={`<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {kpis.map(kpi => <StatCard key={kpi.id} {...kpi} />)}
</div>`}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
            : kpis.map(kpi => (
                <StatCard
                  key={kpi.id}
                  {...kpi}
                  invertDelta={kpi.id === "refunds"}
                  format={kpi.suffix === "%" ? v => v : formatNumber}
                />
              ))}
        </div>
      </Section>

      <Section
        title="Why the delta colour isn't just red for down"
        note="A falling refund rate is good news. The card takes an invertDelta prop rather than hard-coding green for up, because 'up' and 'good' are not the same thing."
        code={`// revenue: up is good
<StatCard label="Revenue" delta={12.4} />

// refund rate: down is good
<StatCard label="Refund rate" delta={-0.6} invertDelta />

const isGood = invertDelta ? delta < 0 : delta > 0;`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            label="Revenue"
            value={48290}
            prefix="$"
            delta={12.4}
            spark={kpis[0].spark}
            format={formatNumber}
          />
          <StatCard
            label="Refund rate"
            value={2.8}
            suffix="%"
            delta={-0.6}
            spark={kpis[3].spark}
            invertDelta
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Both cards show a green arrow. One is up, one is down.
        </p>
      </Section>

      <Section
        title="The sparkline is a raw SVG, not a chart library"
        note="Recharts is roughly 380kB before gzip. Pulling it in for a 60×24 decoration inside a KPI card is the kind of decision that shows up in a Lighthouse score. A 12-line polyline does the same job."
        code={`function Sparkline({ points }) {
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;                 // || 1 guards a flat series

  const path = points.map((value, i) => {
    const x = (i / (points.length - 1)) * 60;
    const y = 22 - ((value - min) / span) * 20;
    return \`\${x},\${y}\`;
  }).join(" ");

  return <svg viewBox="0 0 60 24"><polyline points={path} fill="none" /></svg>;
}`}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The <code className="font-mono">|| 1</code> matters: a completely flat series makes span
          zero, and every point divides to <code className="font-mono">NaN</code>.
        </p>
      </Section>

      <Section
        title="Skeletons that match the real thing"
        note="The skeleton lives in the same file as the card it replaces, so the two can't drift apart. Three bars at the same heights and widths as the label, value and delta — so nothing shifts when the data lands."
        code={`export function StatCardSkeleton() {
  return (
    <div className="rounded-card border bg-surface p-4 shadow-card">
      <Skeleton className="h-3 w-20" />      {/* label */}
      <Skeleton className="mt-3 h-7 w-28" /> {/* value */}
      <Skeleton className="mt-3 h-3 w-24" /> {/* delta */}
    </div>
  );
}`}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Press <strong>Simulate loading</strong> at the top and watch the row above — the cards
          swap in place with no layout shift.
        </p>
      </Section>

      <Section title="Pairing KPIs with context">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <Card>
            <Card.Header title="This month" subtitle="Revenue against target" />
            <Card.Body className="space-y-2">
              {[
                ["Revenue", 48290, 42000],
                ["New customers", 412, 500],
                ["Avg order value", 37, 35]
              ].map(([label, actual, target]) => {
                const pct = Math.min(Math.round((actual / target) * 100), 130);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{label}</span>
                      <span className="text-slate-500 tabular-nums dark:text-slate-400">
                        {label === "Revenue" ? formatCurrency(actual) : formatNumber(actual)} /{" "}
                        {label === "Revenue" ? formatCurrency(target) : formatNumber(target)}
                      </span>
                    </div>
                    <div className="bg-sunk dark:bg-sunk-dark mt-1 h-1.5 overflow-hidden rounded-full">
                      <div
                        className={pct >= 100 ? "bg-success-500 h-full" : "bg-warning-500 h-full"}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header title="Recent activity" />
            <Card.Body className="space-y-2">
              {activity.slice(0, 4).map(item => (
                <div key={item.id} className="flex items-start gap-2 text-xs">
                  <Badge tone={item.tone} dot className="mt-0.5">
                    {item.tone === "danger" ? "alert" : item.tone === "warning" ? "watch" : "ok"}
                  </Badge>
                  <span className="min-w-0">
                    <span className="font-medium">{item.who}</span>{" "}
                    <span className="text-slate-500 dark:text-slate-400">{item.what}</span>
                  </span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>
      </Section>
    </>
  );
}
