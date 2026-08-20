import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card } from "@ui";
import ErrorBoundary from "./components/ErrorBoundary";
import { RenderBomb, HandlerBomb } from "./components/Bomb";

export default function Page() {
  const [armedA, setArmedA] = useState(false);
  const [armedB, setArmedB] = useState(false);
  const [log, setLog] = useState([]);

  return (
    <>
      <PageHeader
        number={9}
        title="Error Boundaries"
        brief="Add route/page-level error boundaries to prevent full app crashes"
        lead="Without a boundary, one thrown error unmounts the entire React tree and the user gets a blank white page."
      />

      <Section
        title="Two boundaries, two independent widgets"
        note="Break the first one. The second keeps working, and so does the sidebar, the topbar and every other page. That containment is the entire point."
        code={`<ErrorBoundary name="Revenue widget">
  <RevenueWidget />
</ErrorBoundary>

<ErrorBoundary name="Orders widget">
  <OrdersWidget />
</ErrorBoundary>`}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={armedA ? "danger" : "secondary"}
            onClick={() => setArmedA(value => !value)}
          >
            {armedA ? "Disarm widget A" : "Break widget A"}
          </Button>
          <Button
            size="sm"
            variant={armedB ? "danger" : "secondary"}
            onClick={() => setArmedB(value => !value)}
          >
            {armedB ? "Disarm widget B" : "Break widget B"}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ErrorBoundary
            name="Widget A"
            onError={error => setLog(list => [`Widget A: ${error.message}`, ...list].slice(0, 4))}
          >
            <RenderBomb armed={armedA} />
          </ErrorBoundary>

          <ErrorBoundary
            name="Widget B"
            onError={error => setLog(list => [`Widget B: ${error.message}`, ...list].slice(0, 4))}
          >
            <RenderBomb armed={armedB} />
          </ErrorBoundary>
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Note: pressing <strong>Try again</strong> while the switch is still armed re-throws
          immediately — the boundary can only recover if the underlying cause is gone. Disarm first,
          then retry.
        </p>

        {log.length > 0 && (
          <div className="text-2xs mt-3 rounded-lg bg-slate-900 p-3 font-mono text-slate-300">
            {log.map((entry, index) => (
              <p key={index}>&gt; {entry}</p>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="A custom fallback"
        note="The fallback prop receives the error and a reset function, so a boundary around a chart can render an empty chart shell instead of a red box."
        code={`<ErrorBoundary
  fallback={({ error, reset }) => (
    <Card>
      <p>Chart unavailable</p>
      <Button onClick={reset}>Reload chart</Button>
    </Card>
  )}
>
  <RevenueChart />
</ErrorBoundary>`}
      >
        <ErrorBoundary
          fallback={({ error, reset }) => (
            <Card className="border-warning-500/40 bg-warning-50 dark:bg-warning-500/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Chart unavailable</p>
                  <p className="text-2xs font-mono text-slate-500">{error.message}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={reset}>
                  Reload chart
                </Button>
              </div>
            </Card>
          )}
        >
          <RenderBomb armed={armedA} />
        </ErrorBoundary>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Tied to the same switch as widget A — break it and this renders the amber fallback instead
          of the default red one.
        </p>
      </Section>

      <Section
        title="What a boundary does not catch"
        note="This is the part that surprises people. Boundaries catch errors thrown during rendering, in lifecycle methods and in constructors. They do not catch event handlers, timers, or anything async."
        code={`// ✅ caught — thrown during render
function Widget({ data }) {
  return <p>{data.total}</p>;      // data is undefined
}

// ❌ not caught — event handler
<button onClick={() => { throw new Error("boom"); }} />

// ❌ not caught — async
useEffect(() => {
  fetch(url).then(r => r.json());   // a rejection here needs .catch()
}, []);

// the fix for both is ordinary try/catch, or an error state`}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <HandlerBomb />
          <Card className="text-sm">
            <p className="font-semibold">The rule of thumb</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Badge tone="success">caught</Badge> render, lifecycle, constructor
              </li>
              <li>
                <Badge tone="danger">not caught</Badge> event handlers, setTimeout, promises,
                async/await
              </li>
              <li>
                <Badge tone="warning">also not caught</Badge> errors thrown by the boundary itself,
                or by its own fallback
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        title="Where to put them"
        note="Not one boundary at the root. Three levels, so a failure is contained as close to its cause as possible."
        code={`// 1. root — the last resort, so a crash is still a styled page
<ErrorBoundary level="page"><App /></ErrorBoundary>

// 2. per route — one broken page leaves the shell and nav usable
<Route element={<ErrorBoundary level="page"><Outlet /></ErrorBoundary>}>

// 3. per widget — a failing chart doesn't take the KPI row with it
<ErrorBoundary name="Revenue chart"><Chart /></ErrorBoundary>`}
      >
        <div className="space-y-2">
          {[
            ["Root", "A styled error page instead of a blank white screen", "neutral"],
            ["Per route", "The sidebar and topbar survive; the user can navigate away", "brand"],
            ["Per widget", "One failing card, everything else on the page intact", "success"]
          ].map(([level, effect, tone]) => (
            <div key={level} className="flex items-start gap-3 rounded-lg border p-3">
              <Badge tone={tone}>{level}</Badge>
              <p className="text-xs text-slate-500 dark:text-slate-400">{effect}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This project wires the route-level boundary in{" "}
          <code className="font-mono text-xs">src/router/routes.jsx</code>, which is why breaking
          one page never costs you the sidebar.
        </p>
      </Section>

      <Section
        title="Two implementation details worth copying"
        code={`// 1. getDerivedStateFromError runs during render — no side effects.
//    componentDidCatch runs after commit — log there.
static getDerivedStateFromError(error) { return { error }; }
componentDidCatch(error, info) { logToService(error, info.componentStack); }

// 2. bump a key on reset, so the subtree remounts clean instead of
//    re-rendering a component that's still holding broken state
render() {
  if (!this.state.error) return <div key={this.state.count}>{children}</div>;
}`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          In development you&apos;ll also see React&apos;s own error overlay on top of the fallback.
          That&apos;s Vite, not a bug — dismiss it and the boundary is underneath. It doesn&apos;t
          appear in a production build.
        </p>
      </Section>
    </>
  );
}
