import { useMemo, useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card, Table } from "@ui";
import { revenueSeries, categorySplit, trafficSources, formatNumber } from "@shared/data";
import ChartCard from "./components/ChartCard";
import { RevenueArea, CategoryBars, CategoryDonut, OrdersBars } from "./components/charts";

const RANGES = [
  { id: "3m", label: "3M", months: 3 },
  { id: "6m", label: "6M", months: 6 },
  { id: "all", label: "All", months: 12 }
];

export default function Page() {
  const [range, setRange] = useState("all");

  const data = useMemo(() => {
    const months = RANGES.find(item => item.id === range).months;
    return revenueSeries.slice(-months);
  }, [range]);

  const growth = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].revenue;
    const last = data[data.length - 1].revenue;
    return Math.round(((last - first) / first) * 100);
  }, [data]);

  return (
    <>
      <PageHeader
        number={6}
        title="Charts & Analytics"
        brief="Add basic charts for trends, category breakdowns, and dashboard summaries"
        lead="Four chart types built on recharts, with axis and tooltip styling shared rather than repeated."
        actions={
          <div className="flex gap-1 rounded-lg border p-0.5">
            {RANGES.map(item => (
              <Button
                key={item.id}
                size="xs"
                variant={range === item.id ? "primary" : "ghost"}
                onClick={() => setRange(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        }
      />

      <Section
        title="Trend — area chart with a target line"
        note="An area chart shows shape. The dashed target line is what makes it answer a question: are we above plan or below it?"
        code={`<ResponsiveContainer width="100%" height="100%">
  <AreaChart data={data}>
    <defs>
      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="var(--color-brand-500)" stopOpacity={0.35} />
        <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0.02} />
      </linearGradient>
    </defs>
    <Area dataKey="revenue" fill="url(#revenueFill)" />
    <Line dataKey="target" strokeDasharray="4 4" dot={false} />
  </AreaChart>
</ResponsiveContainer>`}
      >
        <ChartCard
          title="Revenue"
          subtitle={`${data.length} months · ${growth >= 0 ? "+" : ""}${growth}% over the period`}
          actions={
            <Badge tone={growth >= 0 ? "success" : "danger"}>
              {growth >= 0 ? "growing" : "declining"}
            </Badge>
          }
          height={280}
        >
          <RevenueArea data={data} />
        </ChartCard>
      </Section>

      <Section
        title="Breakdown — bars and a donut on the same data"
        note="Horizontal bars are easier to compare and leave room for long labels. A donut is better at conveying 'share of total' and worse at everything else. Same numbers, two questions."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <ChartCard
            title="Revenue by category"
            subtitle="Horizontal bars — easy to rank"
            height={240}
          >
            <CategoryBars data={categorySplit} />
          </ChartCard>

          <ChartCard title="Share of total" subtitle="Donut — share, not rank" height={240}>
            <CategoryDonut data={categorySplit} />
          </ChartCard>
        </div>
      </Section>

      <Section
        title="Volume — a plain bar chart"
        note="Orders are counts, not a continuous quantity, so bars are more honest than a line. A line implies values between the points exist."
      >
        <ChartCard title="Orders per month" height={220}>
          <OrdersBars data={data} />
        </ChartCard>
      </Section>

      <Section
        title="Not everything needs a chart"
        note="Five rows of two numbers is a table. A chart here would be decoration — the reader wants to compare exact conversion rates, and bars make that harder, not easier."
      >
        <Card padded={false}>
          <Table>
            <Table.Head>
              <Table.HeadCell>Source</Table.HeadCell>
              <Table.HeadCell className="text-right">Sessions</Table.HeadCell>
              <Table.HeadCell className="text-right">Conversion</Table.HeadCell>
              <Table.HeadCell className="hidden text-right sm:table-cell">
                Est. orders
              </Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {trafficSources.map(row => (
                <Table.Row key={row.source}>
                  <Table.Cell className="font-medium">{row.source}</Table.Cell>
                  <Table.Cell className="text-right tabular-nums">
                    {formatNumber(row.sessions)}
                  </Table.Cell>
                  <Table.Cell className="text-right tabular-nums">
                    <Badge
                      tone={
                        row.conversion > 4
                          ? "success"
                          : row.conversion > 2.5
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {row.conversion}%
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="hidden text-right tabular-nums sm:table-cell">
                    {formatNumber(Math.round((row.sessions * row.conversion) / 100))}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </Section>

      <Section
        title="Three recharts traps"
        code={`// 1. ResponsiveContainer needs a parent with a REAL height.
//    A percentage height inside a container with no height renders nothing.
<div style={{ height: 260 }}>
  <ResponsiveContainer width="100%" height="100%">...</ResponsiveContainer>
</div>

// 2. Colours from CSS variables, so dark mode works without a second chart config
<Bar fill="var(--color-brand-500)" />

// 3. gradient ids are global to the document — two charts sharing an id
//    silently share the gradient
<linearGradient id="revenueFill">   {/* unique per chart */}`}
      >
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li>
            <strong className="text-slate-700 dark:text-slate-200">The blank chart.</strong>{" "}
            <code className="font-mono text-xs">ResponsiveContainer</code> measures its parent. If
            the parent has no height, the chart is zero pixels tall and renders nothing at all — no
            error, no warning.
          </li>
          <li>
            <strong className="text-slate-700 dark:text-slate-200">Recharts is large.</strong>{" "}
            Roughly 380kB before gzip. Task 8 lazy-loads this page for exactly that reason, and task
            4 draws its sparklines by hand rather than importing it.
          </li>
          <li>
            <strong className="text-slate-700 dark:text-slate-200">
              Give the chart a text equivalent.
            </strong>{" "}
            An SVG is invisible to a screen reader. The subtitle on the revenue card states the
            growth figure in words, which is the minimum.
          </li>
        </ul>
      </Section>
    </>
  );
}
