# Task 2 — Read Views

> Sheet description: Display records in both responsive card view and admin-style table view

## Cards or table

Not a style preference — they answer different questions.

| | Cards | Table |
|---|-------|-------|
| Good at | browsing, one record at a time | comparing a field across many records |
| Density | 3–4 fields before it crowds | 6–8 columns comfortably |
| Mobile | reflows naturally | needs columns dropped or scroll |
| Sorting | feels odd — cards imply no order | expected; the header is the affordance |
| Bulk actions | awkward to place a checkbox | a natural first column |

Offering both, with the choice remembered, is the usual answer for an admin screen. Task 11
persists it.

## Responsive without a separate mobile component

Column definitions carry their own breakpoint class, applied to the `<th>` **and** the `<td>` from
the same object:

```jsx
{ key: "sku", label: "SKU", hide: "hide-sm" }

<th className={column.hide}>
<td className={column.hide}>
```

One source, so a header can never drift out of line with its data — the classic cause of a table
whose columns stop matching.

## Derived, never stored

The visible list is computed by `selectVisible()` during render. Storing a filtered copy means two
sources of truth and a `useEffect` keeping them married.
