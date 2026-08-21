import { Suspense, lazy, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Filter, Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@shared/Section";
import { Badge, Button, Card, Select, Skeleton } from "@ui";
import {
  activity,
  kpis,
  orders,
  products,
  revenueSeries,
  categorySplit,
  STATUS_TONE,
  formatCurrency,
  formatNumber
} from "@shared/data";
import StatCard, { StatCardSkeleton } from "@tasks/task-04-stats-and-kpi-cards/components/StatCard";
import DataTable from "@tasks/task-05-professional-data-table/components/DataTable";
import ErrorBoundary from "@tasks/task-09-error-boundaries/components/ErrorBoundary";
import { UnauthorizedState, ErrorRetryState } from "@tasks/task-10-ux-states/components/states";
import { Avatar } from "@ui";

/* Task 8 — the charts are the heaviest thing on this page, so they load lazily
   even though the page itself is already a lazy route. */
const Charts = lazy(() => import("./components/DashboardCharts"));

const COLUMNS = [
  { key: "id", label: "Order", render: row => <span className="font-mono text-xs">{row.id}</span> },
  {
    key: "customer",
    label: "Customer",
    render: row =>
      row.customer ? (
        <span className="flex items-center gap-2">
          <Avatar name={row.customer} size="sm" />
          <span className="truncate">{row.customer}</span>
        </span>
      ) : (
        <span className="text-slate-400">Guest checkout</span>
      )
  },
  { key: "product", label: "Product", hideBelow: "hidden lg:table-cell" },
  {
    key: "total",
    label: "Total",
    numeric: true,
    align: "right",
    render: row => formatCurrency(row.total)
  },
  {
    key: "status",
    label: "Status",
    render: row => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
  }
];

const FILTERS = ["paid", "pending", "shipped", "refunded", "failed"].map(value => ({
  value,
  label: value[0].toUpperCase() + value.slice(1)
}));

export default function Page() {
  const [rows, setRows] = useState(orders);
  const [range, setRange] = useState("6");
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState("normal");
  const reduce = useReducedMotion();

  const series = useMemo(() => revenueSeries.slice(-Number(range)), [range]);

  const lowStock = useMemo(() => products.filter(item => item.stock <= 8), []);

  function refresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1300);
  }

  const stagger = index =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }
        };

  return (
    <>
      <PageHeader
        number={13}
        title="Deliverable"
        brief="Build and deploy or prepare a production-ready React admin dashboard capstone with Lighthouse review"
        lead="Every one of the twelve previous tasks, working together as one screen."
        actions={
          <>
            <Select
              aria-label="Date range"
              value={range}
              onChange={event => setRange(event.target.value)}
              options={[
                { value: "3", label: "Last 3 months" },
                { value: "6", label: "Last 6 months" },
                { value: "7", label: "All time" }
              ]}
              className="w-40"
            />
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
              Refresh
            </Button>
            <Button size="sm" icon={Download}>
              Export
            </Button>
          </>
        }
      />

      {/* A scenario switcher, so the states from task 10 are reachable */}
      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2">
          <Filter className="size-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-2xs font-bold tracking-wide text-slate-500 uppercase">
            Demo scenario
          </span>
          {[
            ["normal", "Normal"],
            ["loading", "Loading"],
            ["error", "Error"],
            ["unauthorized", "No permission"]
          ].map(([id, label]) => (
            <Button
              key={id}
              size="xs"
              variant={scenario === id ? "primary" : "ghost"}
              onClick={() => setScenario(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {scenario === "unauthorized" ? (
        <UnauthorizedState />
      ) : scenario === "error" ? (
        <ErrorRetryState
          message="The analytics service returned 503 Service Unavailable."
          onRetry={() => setScenario("normal")}
          attempts={1}
        />
      ) : (
        <>
          {/* ---------- KPI row (task 4, animated per task 11) ---------- */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {loading || scenario === "loading"
              ? Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
              : kpis.map((kpi, index) => (
                  <motion.div key={kpi.id} {...stagger(index)}>
                    <StatCard
                      {...kpi}
                      invertDelta={kpi.id === "refunds"}
                      format={kpi.suffix === "%" ? value => value : formatNumber}
                    />
                  </motion.div>
                ))}
          </div>

          {/* ---------- charts (task 6, lazy per task 8, boundaried per task 9) ---------- */}
          <ErrorBoundary name="Analytics">
            <Suspense
              fallback={
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                  <Card>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-3 h-64 w-full" />
                  </Card>
                  <Card>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-3 h-64 w-full" />
                  </Card>
                </div>
              }
            >
              <Charts
                series={series}
                categories={categorySplit}
                loading={loading || scenario === "loading"}
              />
            </Suspense>
          </ErrorBoundary>

          {/* ---------- orders table (task 5) ---------- */}
          <Card>
            <Card.Header
              title="Orders"
              subtitle={`${rows.length} records`}
              actions={
                <Button size="xs" icon={Plus}>
                  New order
                </Button>
              }
            />
            <Card.Body>
              <ErrorBoundary name="Orders table">
                <DataTable
                  rows={rows}
                  columns={COLUMNS}
                  searchKeys={["id", "customer", "product"]}
                  filterKey="status"
                  filterOptions={FILTERS}
                  loading={loading || scenario === "loading"}
                  pageSize={6}
                  onRowAction={(action, payload) => {
                    if (action !== "delete") return;
                    const ids = Array.isArray(payload) ? payload : [payload.id];
                    setRows(list => list.filter(row => !ids.includes(row.id)));
                  }}
                  emptyTitle="No orders left"
                  emptyMessage="Every row has been deleted. Reload the page to restore them."
                />
              </ErrorBoundary>
            </Card.Body>
          </Card>

          {/* ---------- side panels ---------- */}
          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <Card.Header title="Low stock" subtitle="8 units or fewer" />
              <Card.Body className="space-y-2">
                {lowStock.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(item.price)}
                    </span>
                    <Badge tone={item.stock === 0 ? "danger" : "warning"}>
                      {item.stock === 0 ? "out of stock" : `${item.stock} left`}
                    </Badge>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header title="Activity" subtitle="Last 24 hours" />
              <Card.Body className="space-y-2">
                {activity.map(item => (
                  <div key={item.id} className="flex items-start gap-2 text-sm">
                    <Avatar name={item.who === "System" ? "" : item.who} size="sm" />
                    <p className="min-w-0">
                      <span className="font-medium">{item.who}</span>{" "}
                      <span className="text-slate-500 dark:text-slate-400">{item.what}</span>
                      <span className="text-2xs block text-slate-400">{item.when}</span>
                    </p>
                    {item.tone === "danger" && <Badge tone="danger">alert</Badge>}
                  </div>
                ))}
              </Card.Body>
            </Card>
          </div>
        </>
      )}

      {/* ---------- what came from where ---------- */}
      <Card>
        <Card.Header title="Every task, in this one screen" />
        <Card.Body>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["1 Tailwind setup", "Every colour, radius and shadow above is a @theme token"],
              ["2 Dashboard shell", "The sidebar, topbar and scroll container around this page"],
              ["3 UI system", "Button, Card, Badge, Select, Table, Skeleton, Avatar"],
              ["4 KPI cards", "The four cards at the top, with sparklines and inverted deltas"],
              ["5 Data table", "Orders — search, filter, sort, select, paginate"],
              ["6 Charts", "Revenue area chart and the category breakdown"],
              ["7 Performance", "useMemo on the series slice and the low-stock filter"],
              ["8 Code splitting", "This page is lazy, and the charts inside it are lazy again"],
              ["9 Error boundaries", "Three of them — analytics, the table, and the app root"],
              [
                "10 UX states",
                "The scenario switcher above reaches loading, error and no-permission"
              ],
              ["11 Framer Motion", "The KPI row staggers in, and respects reduced motion"],
              ["12 Testing", "StatCard, DataTable and ErrorBoundary here are all under test"]
            ].map(([task, where]) => (
              <div key={task} className="rounded-lg border p-2.5">
                <p className="text-2xs text-brand-600 dark:text-brand-400 font-bold">{task}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{where}</p>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
