# Task 5 — Professional Data Table

> Sheet description: Add search, filters, status badges, row actions, pagination, and responsive behavior

## What's in it

Search across chosen fields, a status filter, sortable columns, pagination with ellipsis, row
selection with a bulk action bar, per-row actions, a loading state, and **two** distinct empty
states. 47 orders to try it on.

## Columns as data

```js
const COLUMNS = [
  { key: "id",     label: "Order",  render: row => <code>{row.id}</code> },
  { key: "total",  label: "Total",  numeric: true, align: "right",
    render: row => formatCurrency(row.total) },
  { key: "status", label: "Status",
    render: row => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
  { key: "date",   label: "Date",   hideBelow: "hidden sm:table-cell" }
];
```

Declaring columns as an array is what lets one component serve any dataset. `render` receives the
whole row, so a cell can combine fields or fall back when one is null.

`numeric: true` switches the comparator from `localeCompare` to subtraction. Without it `$449` sorts
before `$89` — `DataTable.test.jsx` asserts on exactly that.

## Responsive without a card view

The `hideBelow` class is applied to both the `<th>` and the `<td>` from the same column definition,
so they can never drift apart — the classic cause of a table whose headers stop lining up with its
data. The wrapper scrolls rather than overflowing the page.

The alternative is reflowing rows into stacked cards on mobile. That reads better on a phone but
loses column alignment and sortability. This uses the first approach.

## Two empty states

"No orders yet" and "no rows match your filter" need different words and different actions. Merging
them tells someone their data is gone when it's merely filtered out — the version of this bug that
generates support tickets.

Search for `zzz` to see one; delete every row to see the other.

## Nulls sort last, both directions

```js
if (left == null) return 1;
if (right == null) return -1;
```

One row has no customer (a guest checkout). Without these two lines, sorting by customer throws on
`null.localeCompare`.

## Where `useMemo` genuinely earns it

The filter → filter → sort chain walks the whole dataset three times and runs on every keystroke.
This is one of the few places memoising is measurably worth it rather than cargo cult — task 7 covers
the distinction.

## Tested

`DataTable.test.jsx` covers 11 behaviours: pagination, search, status filter, numeric sort in both
directions, selection, select-all-on-page, the bulk action callback, both empty states and the
loading state.
