import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card, Table } from "@ui";
import { orders, STATUS_TONE, formatCurrency } from "@shared/data";
import {
  LoadingState,
  EmptyDataState,
  NoResultsState,
  UnauthorizedState,
  ErrorRetryState
} from "./components/states";

const STATES = [
  { id: "loading", label: "Loading" },
  { id: "success", label: "Success" },
  { id: "empty", label: "Empty" },
  { id: "no-results", label: "No results" },
  { id: "unauthorized", label: "Unauthorized" },
  { id: "error", label: "Error" },
  { id: "offline", label: "Offline" }
];

export default function Page() {
  const [state, setState] = useState("success");
  const [retrying, setRetrying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  function retry() {
    setRetrying(true);
    setAttempts(value => value + 1);
    setTimeout(() => {
      setRetrying(false);
      setState("success");
    }, 1200);
  }

  return (
    <>
      <PageHeader
        number={10}
        title="UX States"
        brief="Implement skeletons, empty states, no-results states, unauthorized states, and retry states"
        lead="Seven states one screen can be in. Six of them are the ones that get skipped."
      />

      <Section
        title="Switch between them"
        note="Every state below is a real component from components/states.jsx, not a mockup. Pick one and the panel underneath renders it."
      >
        <div className="flex flex-wrap gap-1.5">
          {STATES.map(item => (
            <Button
              key={item.id}
              size="sm"
              variant={state === item.id ? "primary" : "outline"}
              onClick={() => {
                setState(item.id);
                if (item.id !== "error") setAttempts(0);
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="mt-3 min-h-[280px]">
          {state === "loading" && <LoadingState />}

          {state === "success" && (
            <Card padded={false}>
              <Table>
                <Table.Head>
                  <Table.HeadCell>Order</Table.HeadCell>
                  <Table.HeadCell>Customer</Table.HeadCell>
                  <Table.HeadCell className="text-right">Total</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {orders.slice(0, 6).map(order => (
                    <Table.Row key={order.id}>
                      <Table.Cell className="font-mono text-xs">{order.id}</Table.Cell>
                      <Table.Cell>{order.customer ?? "Guest checkout"}</Table.Cell>
                      <Table.Cell className="text-right tabular-nums">
                        {formatCurrency(order.total)}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Card>
          )}

          {state === "empty" && <EmptyDataState onSeed={() => setState("success")} />}
          {state === "no-results" && (
            <NoResultsState query="zzz" onClear={() => setState("success")} />
          )}
          {state === "unauthorized" && <UnauthorizedState />}
          {state === "error" && (
            <ErrorRetryState
              message="The server responded with 503 Service Unavailable."
              onRetry={retry}
              retrying={retrying}
              attempts={attempts}
            />
          )}
          {state === "offline" && (
            <ErrorRetryState offline onRetry={retry} retrying={retrying} attempts={attempts} />
          )}
        </div>
      </Section>

      <Section
        title="Empty is not no-results, and neither is an error"
        note="Three different situations that beginners collapse into one 'no data' message. Each needs different words and a different action, because the user's next step is different in each."
      >
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-sunk dark:bg-sunk-dark">
              <tr>
                <th className="text-2xs px-3 py-2 text-left font-bold uppercase">State</th>
                <th className="text-2xs px-3 py-2 text-left font-bold uppercase">Means</th>
                <th className="text-2xs px-3 py-2 text-left font-bold uppercase">The action</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Empty",
                  "The request worked. There is genuinely no data.",
                  "Create the first one"
                ],
                [
                  "No results",
                  "There is data. Your filter excluded all of it.",
                  "Clear the filters"
                ],
                ["Unauthorized", "The data exists and you can't see it.", "Request access"],
                ["Error", "Something broke. We don't know if data exists.", "Retry"],
                ["Offline", "The request never left the browser.", "Retry when reconnected"]
              ].map(([name, meaning, action]) => (
                <tr key={name} className="border-b last:border-0">
                  <td className="px-3 py-2 font-semibold">{name}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{meaning}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          The one that causes real support tickets is showing &ldquo;no data&rdquo; for a no-results
          case. The user believes their records are gone.
        </p>
      </Section>

      <Section
        title="Skeletons that match, not spinners"
        note="A skeleton shaped like the content it replaces means nothing moves when the data lands. A centred spinner guarantees a layout shift, because the spinner and the content are never the same size."
        code={`// the skeleton mirrors the real layout: 4 KPI cards, then table rows
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {Array.from({ length: 4 }, (_, i) => (
    <div key={i} className="rounded-card border p-4">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-6 w-24" />
    </div>
  ))}
</div>

// and it announces itself once, rather than per box
<div aria-busy="true" aria-live="polite">
  <span className="sr-only">Loading dashboard data</span>`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Every skeleton box is <code className="font-mono text-xs">aria-hidden</code>, with one{" "}
          <code className="font-mono text-xs">sr-only</code> announcement for the whole region.
          Otherwise a screen reader reads out fourteen meaningless placeholders.
        </p>
      </Section>

      <Section
        title="Retry needs to say what it tried"
        note="A bare 'Something went wrong' with a retry button tells the user nothing about whether retrying is worth it. Include the status, show the attempt count, and disable the button while in flight."
        code={`<Button loading={retrying} onClick={retry}>
  {retrying ? "Retrying…" : "Try again"}
</Button>

{attempts > 0 && <p>{attempts} attempts so far</p>}`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Press <strong>Error</strong> above and retry a few times — the attempt counter is what
          tells someone to stop pressing and report it instead.
        </p>
      </Section>

      <Section
        title="The checklist"
        code={`Every screen that fetches data needs a plan for:
  loading        skeleton matching the layout
  success        the data
  empty          no records exist yet          → create action
  no results     records exist, filter excludes → clear filters action
  unauthorized   exists, not permitted         → request access
  error          request failed                → retry with the reason
  offline        never left the browser        → retry on reconnect
  partial        some widgets loaded, one failed → per-widget boundary (task 9)`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Eight rows. Most dashboards ship with two of them, which is why they feel unfinished the
          first time anything goes wrong.
        </p>
      </Section>
    </>
  );
}
