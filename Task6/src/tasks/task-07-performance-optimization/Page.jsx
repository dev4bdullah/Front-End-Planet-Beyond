import { memo, useCallback, useMemo, useRef, useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card, Input } from "@ui";
import { orders } from "@shared/data";

/* A render counter that doesn't itself cause a render. */
function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

function CountBadge({ renders, expected }) {
  const good = renders <= expected;
  return (
    <Badge tone={good ? "success" : "danger"}>
      {renders} render{renders === 1 ? "" : "s"}
    </Badge>
  );
}

/* ---------- the four cases ---------- */

function PlainChild({ label }) {
  const renders = useRenderCount();
  return (
    <Card className="text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">No memo</span>
        <CountBadge renders={renders} expected={1} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </Card>
  );
}

const MemoStable = memo(function MemoStable({ label }) {
  const renders = useRenderCount();
  return (
    <Card className="text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">memo + string prop</span>
        <CountBadge renders={renders} expected={1} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </Card>
  );
});

const MemoUnstableObject = memo(function MemoUnstableObject({ config }) {
  const renders = useRenderCount();
  return (
    <Card className="text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">memo + inline object</span>
        <CountBadge renders={renders} expected={1} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        mode {config.mode} — memo defeated
      </p>
    </Card>
  );
});

const MemoStableCallback = memo(function MemoStableCallback({ onPing }) {
  const renders = useRenderCount();
  return (
    <Card className="text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">memo + useCallback</span>
        <CountBadge renders={renders} expected={1} />
      </div>
      <Button size="xs" variant="ghost" onClick={onPing} className="mt-1.5">
        Ping parent
      </Button>
    </Card>
  );
});

export default function Page() {
  const [text, setText] = useState("");
  const [pings, setPings] = useState(0);
  const [heavyOn, setHeavyOn] = useState(true);

  const parentRenders = useRenderCount();

  // Unstable on purpose — a brand new object on every render
  const inlineConfig = { mode: "compact" };

  // Stable — same reference for the life of the component
  const ping = useCallback(() => setPings(value => value + 1), []);

  /* A real aggregation over 47 rows, the same shape task 5's table uses. */
  const summary = useMemo(() => {
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + order.total;
      return acc;
    }, {});
    return Object.entries(byStatus).sort((a, b) => b[1] - a[1]);
  }, []);

  /* Deliberately expensive, and toggleable, so the cost is visible. */
  const expensive = useMemo(() => {
    if (!heavyOn) return 0;
    let total = 0;
    for (let i = 0; i < 2_000_000; i++) total += i % 7;
    return total;
  }, [heavyOn]);

  return (
    <>
      <PageHeader
        number={7}
        title="Performance Optimization"
        brief="Use React.memo, useMemo, and useCallback only where they reduce measurable re-renders"
        lead="Four cards, each counting its own renders. Two of them prove that memo often does nothing."
      />

      <Section
        title="Type here, then watch the counters"
        note="Every keystroke re-renders this page. The cards below receive different kinds of prop, and only two of them actually skip the re-render."
        code={`// ✅ memo works — a string is compared by value
<MemoStable label="stable" />

// ❌ memo defeated — { mode: "compact" } is a new object every render
<MemoUnstableObject config={{ mode: "compact" }} />

// ✅ fixed — useCallback keeps the function identity stable
const ping = useCallback(() => setPings(v => v + 1), []);
<MemoStableCallback onPing={ping} />`}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <Input
                label="Type to re-render the page"
                placeholder="every keystroke is one parent render"
                value={text}
                onChange={event => setText(event.target.value)}
              />
            </div>
            <Badge tone="brand">parent: {parentRenders} renders</Badge>
            <Badge tone="neutral">pings: {pings}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PlainChild label="re-renders with the parent, always" />
            <MemoStable label="skipped — the prop is unchanged" />
            <MemoUnstableObject config={inlineConfig} />
            <MemoStableCallback onPing={ping} />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Card 1 climbs because it isn&apos;t memoised. Card 3 climbs <em>despite</em> being
            memoised, because <code className="font-mono">memo</code> compares props by reference
            and an inline object literal is a new reference every time. That card is the whole
            point: wrapping a component in <code className="font-mono">memo</code> without
            stabilising its props adds a comparison and buys nothing.
          </p>
        </div>
      </Section>

      <Section
        title="useMemo where it's measurable"
        note="Toggle the expensive calculation off and on, then type in the box above. With useMemo the 2,000,000-iteration loop runs once per toggle — not once per keystroke."
        code={`const expensive = useMemo(() => {
  let total = 0;
  for (let i = 0; i < 2_000_000; i++) total += i % 7;
  return total;
}, [heavyOn]);        // ← recomputes only when heavyOn changes`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant={heavyOn ? "primary" : "secondary"}
            onClick={() => setHeavyOn(value => !value)}
          >
            {heavyOn ? "Calculation on" : "Calculation off"}
          </Button>
          <span className="font-mono text-sm tabular-nums">{expensive.toLocaleString()}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            recomputed {heavyOn ? "on toggle only" : "not at all"}
          </span>
        </div>
      </Section>

      <Section
        title="A realistic aggregation"
        note="47 orders reduced into totals by status. This is the shape of memoisation that pays off in a dashboard — it runs on data changes, not on unrelated re-renders."
        code={`const summary = useMemo(() => {
  const byStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + order.total;
    return acc;
  }, {});
  return Object.entries(byStatus).sort((a, b) => b[1] - a[1]);
}, []);   // orders never changes here; in a real app it would be [orders]`}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {summary.map(([status, total]) => (
            <Card key={status} className="text-center">
              <p className="text-2xs font-bold tracking-wide text-slate-500 uppercase">{status}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">${total.toLocaleString()}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="When each tool is the right one"
        code={`React.memo      skip re-rendering a child whose props haven't changed
useMemo         cache an expensive VALUE between renders
useCallback     keep a FUNCTION identity stable across renders
useRef          hold a value that must survive renders without causing one`}
      >
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-sunk dark:bg-sunk-dark">
              <tr>
                <th className="text-2xs px-3 py-2 text-left font-bold uppercase">
                  Reach for it when
                </th>
                <th className="text-2xs px-3 py-2 text-left font-bold uppercase">Skip it when</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "The Profiler shows a component rendering often and expensively",
                  "You haven't measured — you're guessing"
                ],
                [
                  "A child receives an object or callback and is memoised",
                  "The child isn't memoised, so the reference doesn't matter"
                ],
                [
                  "A calculation walks hundreds of rows on every keystroke",
                  "The calculation is a single arithmetic expression"
                ],
                [
                  "A long list re-renders while an unrelated input changes",
                  "The component renders in under a millisecond anyway"
                ]
              ].map(([yes, no]) => (
                <tr key={yes} className="border-b last:border-0">
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{yes}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          The sheet wording is worth taking literally:{" "}
          <em>only where they reduce measurable re-renders</em>. Every{" "}
          <code className="font-mono text-xs">memo</code> adds a prop comparison, every{" "}
          <code className="font-mono text-xs">useMemo</code> adds a dependency array to keep
          correct, and both make the genuinely slow component harder to find in the Profiler.
        </p>
      </Section>

      <Section
        title="Cheaper wins than memoisation"
        code={`// 1. Move state down. If only <Search /> uses the query, the query
//    doesn't belong in the page component.

// 2. Pass children instead of re-rendering. <Layout>{children}</Layout>
//    doesn't re-render children when Layout's own state changes.

// 3. Render less. Task 5 paginates to 8 rows — that beats memoising 47.

// 4. Split the bundle. Task 8 removes 380kB of recharts from first paint,
//    which no amount of memo can do.`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Moving state down is almost always the better fix. A memoised child is a workaround for
          state living too high up.
        </p>
      </Section>
    </>
  );
}
