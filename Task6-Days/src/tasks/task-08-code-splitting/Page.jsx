import { Suspense, lazy, useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card, Skeleton } from "@ui";
import { revenueSeries } from "@shared/data";

/* Lazy inside a page, not just per route. This chart pulls in recharts, which is
   the single largest dependency in the project — so it stays out of the bundle
   until someone actually asks for it. */
const LazyChart = lazy(() =>
  import("@tasks/task-06-charts-and-analytics/components/charts").then(module => ({
    default: () => <module.RevenueArea data={revenueSeries} />
  }))
);

export default function Page() {
  const [showChart, setShowChart] = useState(false);

  return (
    <>
      <PageHeader
        number={8}
        title="Code Splitting"
        brief="Lazy-load route pages with React.lazy and Suspense fallback UI"
        lead="Every page in this dashboard is already lazy. Open the Network tab and click through the sidebar to watch the chunks arrive."
      />

      <Section
        title="Prove it in 30 seconds"
        note="This is the whole task — the evidence is in the Network tab, not on the page."
      >
        <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {[
            "Press F12 → Network tab, filter to JS",
            "Reload the page. Note how few files load.",
            "Click Charts & Analytics in the sidebar — a new chunk appears, and it's the biggest one on the site",
            "Click back to this page, then Charts again. Nothing downloads the second time; it's cached.",
            "Run npm run build and look at dist/assets — one file per lazy page, plus separate react, charts and motion chunks"
          ].map((step, index) => (
            <li key={index} className="flex gap-2">
              <span className="bg-brand-600 text-2xs grid size-5 shrink-0 place-items-center rounded-full font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="How the routes are wired"
        note="React.lazy takes a function returning a dynamic import. Vite sees the import() and creates a chunk per page automatically — no config."
        code={`const pages = {
  "kpi-cards": lazy(() => import("@tasks/task-04-stats-and-kpi-cards/Page")),
  charts:      lazy(() => import("@tasks/task-06-charts-and-analytics/Page")),
  deliverable: lazy(() => import("@tasks/task-13-deliverable/Page"))
};

function Page({ slug }) {
  const Component = pages[slug];
  return (
    <ErrorBoundary level="page">        {/* a failed chunk lands here */}
      <Suspense fallback={<LoadingState />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The nesting order matters. The boundary wraps Suspense, so a chunk that fails to download
          — a deploy mid-session, a flaky connection — renders the error fallback with a retry
          rather than an unhandled rejection.
        </p>
      </Section>

      <Section
        title="Lazy inside a page, too"
        note="Splitting per route is the easy win. The next one is splitting a heavy component that most visitors never open. The chart below pulls in recharts — roughly 380kB before gzip — and it isn't fetched until you press the button."
        code={`const LazyChart = lazy(() => import("./components/charts"));

{showChart
  ? <Suspense fallback={<Skeleton className="h-64" />}><LazyChart /></Suspense>
  : <Button onClick={() => setShowChart(true)}>Load chart</Button>}`}
      >
        <div className="space-y-3">
          {!showChart ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10">
              <p className="text-sm font-semibold">Chart not loaded</p>
              <p className="max-w-sm text-center text-xs text-slate-500 dark:text-slate-400">
                recharts is not in memory yet. Open the Network tab first, then press the button and
                watch a new JS file arrive.
              </p>
              <Button size="sm" onClick={() => setShowChart(true)}>
                Load chart
              </Button>
            </div>
          ) : (
            <Card>
              <div className="h-64">
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <LazyChart />
                </Suspense>
              </div>
            </Card>
          )}
        </div>
      </Section>

      <Section
        title="Vendor chunks"
        note="Route splitting handles your code. Libraries need manualChunks, or every page chunk ends up with its own copy of React."
        code={`// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react:  ["react", "react-dom", "react-router-dom"],
        charts: ["recharts"],
        motion: ["framer-motion"]
      }
    }
  }
}`}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["react", "shared by every page — cached once, never re-downloaded", "brand"],
            ["charts", "only fetched by /charts and this page", "success"],
            ["motion", "only fetched by /framer-motion", "success"]
          ].map(([name, why, tone]) => (
            <Card key={name}>
              <Badge tone={tone}>{name}</Badge>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{why}</p>
            </Card>
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Splitting vendors this way also improves caching across deploys: change one page and the
          react chunk&apos;s hash is unchanged, so returning visitors don&apos;t re-download it.
        </p>
      </Section>

      <Section
        title="The Suspense fallback is not a spinner"
        note="A chunk takes 100–600ms on a real connection. A centred spinner for that long, followed by content appearing at a different size, is worse than a skeleton that already matches the shape of the page."
        code={`// ❌ layout jumps when the page arrives
<Suspense fallback={<Spinner />}>

// ✅ the fallback already looks like the page
<Suspense fallback={<LoadingState />}>`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This project uses task 10&apos;s <code className="font-mono text-xs">LoadingState</code>{" "}
          as the route fallback — four KPI skeletons and a table, which is what most of these pages
          actually look like.
        </p>
      </Section>

      <Section
        title="What not to lazy-load"
        code={`❌ small components — an extra round trip costs more than 2kB saved
❌ anything needed on first paint — you've added latency, not removed weight
❌ the page the user landed on — that's just a slower first render

✅ route pages
✅ heavy libraries behind an interaction (charts, editors, PDF, maps)
✅ modals and drawers that most visitors never open
✅ admin-only sections of a shared bundle`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A useful sanity check: if the lazy chunk is smaller than about 20kB, the round trip
          probably costs more than the bytes you saved.
        </p>
      </Section>
    </>
  );
}
