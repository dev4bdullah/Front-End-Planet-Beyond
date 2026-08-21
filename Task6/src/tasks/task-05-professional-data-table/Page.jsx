import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Avatar, Badge, Button } from "@ui";
import { orders, STATUS_TONE, formatCurrency, formatDate } from "@shared/data";
import DataTable from "./components/DataTable";

/* Columns are declared as data, which is what lets one DataTable serve
   any dataset. `render` receives the whole row, so a cell can combine fields. */
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
        <span className="flex items-center gap-2 text-slate-400">
          <Avatar name="" size="sm" />
          Guest checkout
        </span>
      )
  },
  { key: "product", label: "Product", hideBelow: "hidden md:table-cell" },
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
  },
  {
    key: "date",
    label: "Date",
    hideBelow: "hidden sm:table-cell",
    render: row => <span className="text-xs text-slate-500">{formatDate(row.date)}</span>
  }
];

const FILTER_OPTIONS = ["paid", "pending", "shipped", "refunded", "failed"].map(value => ({
  value,
  label: value[0].toUpperCase() + value.slice(1)
}));

export default function Page() {
  const [rows, setRows] = useState(orders);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  function handleAction(action, payload) {
    if (action === "delete") {
      const ids = Array.isArray(payload) ? payload : [payload.id];
      setRows(list => list.filter(row => !ids.includes(row.id)));
      setLastAction(`Deleted ${ids.length} row${ids.length === 1 ? "" : "s"}`);
      return;
    }
    if (action === "export") {
      setLastAction(`Exported ${payload.length} rows`);
      return;
    }
    setLastAction(`Viewed ${payload.id}`);
  }

  return (
    <>
      <PageHeader
        number={5}
        title="Professional Data Table"
        brief="Add search, filters, status badges, row actions, pagination, and responsive behavior"
        lead="47 orders, and everything a table needs before it's usable on real data."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1200);
              }}
            >
              Simulate loading
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRows(orders)}>
              Reset data
            </Button>
          </>
        }
      />

      <Section
        title="The table"
        note="Search across three fields, filter by status, sort any column, select rows for a bulk action, paginate, and two different empty states. Narrow the window — the Product and Date columns drop out before the layout breaks."
      >
        <DataTable
          rows={rows}
          columns={COLUMNS}
          searchKeys={["id", "customer", "product"]}
          filterKey="status"
          filterOptions={FILTER_OPTIONS}
          loading={loading}
          pageSize={8}
          onRowAction={handleAction}
          emptyTitle="No orders left"
          emptyMessage="Every row has been deleted. Press Reset data above."
        />

        {lastAction && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last action: <strong>{lastAction}</strong>
          </p>
        )}
      </Section>

      <Section
        title="Columns as data"
        note="Declaring columns as an array is what makes one component work for any dataset. render receives the whole row, so a cell can combine fields or fall back when one is null."
        code={`const COLUMNS = [
  { key: "id",     label: "Order",  render: row => <code>{row.id}</code> },
  { key: "total",  label: "Total",  numeric: true, align: "right",
    render: row => formatCurrency(row.total) },
  { key: "status", label: "Status",
    render: row => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
  { key: "date",   label: "Date",   hideBelow: "hidden sm:table-cell" }
];

<DataTable rows={orders} columns={COLUMNS} searchKeys={["id", "customer"]} />`}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <code className="font-mono">numeric: true</code> switches the comparator from{" "}
          <code className="font-mono">localeCompare</code> to subtraction — without it,{" "}
          <code className="font-mono">$449</code> sorts before{" "}
          <code className="font-mono">$89</code>.
        </p>
      </Section>

      <Section
        title="Responsive tables without a card view"
        note="Two approaches exist. Hiding low-priority columns per breakpoint keeps it a real table, scannable and sortable. Reflowing rows into stacked cards reads better on a phone but loses column alignment. This uses the first."
        code={`// declare the breakpoint on the column
{ key: "product", label: "Product", hideBelow: "hidden md:table-cell" }

// applied to both the th and the td, so they can never disagree
<Table.HeadCell className={column.hideBelow}>
<Table.Cell className={column.hideBelow}>

// the wrapper scrolls rather than overflowing the page
<div className="overflow-x-auto">`}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The class is applied to the header and the cell from the same column definition, so they
          can never drift out of sync — the classic cause of a table whose headers don&apos;t line
          up with its data.
        </p>
      </Section>

      <Section
        title="Two empty states, not one"
        note="'No orders yet' and 'no rows match your filter' need different words and different actions. Merging them tells someone their data is gone when it's merely filtered out."
        code={`{hasFilters
  ? <EmptyState title="No matching records"
                action={<Button onClick={clearFilters}>Clear filters</Button>} />
  : <EmptyState title="No orders yet" message="Nothing has been created." />}`}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Search for <code className="font-mono">zzz</code> to see the first. Select every row and
          delete to see the second.
        </p>
      </Section>

      <Section
        title="Where useMemo actually earns its place"
        note="The filter → filter → sort chain walks the whole dataset three times, and it runs on every keystroke. This is one of the few cases where memoising is measurably worth it rather than cargo cult."
        code={`const processed = useMemo(() => {
  return rows
    .filter(row => filter ? row[filterKey] === filter : true)
    .filter(row => searchKeys.some(key =>
      String(row[key] ?? "").toLowerCase().includes(needle)))
    .sort(comparator);
}, [rows, query, filter, sort]);   // not on every unrelated re-render`}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Note the null handling in the comparator:{" "}
          <code className="font-mono">if (left == null) return 1</code> sends the guest-checkout row
          to the bottom in both directions, instead of throwing on{" "}
          <code className="font-mono">null.localeCompare</code>.
        </p>
      </Section>
    </>
  );
}
