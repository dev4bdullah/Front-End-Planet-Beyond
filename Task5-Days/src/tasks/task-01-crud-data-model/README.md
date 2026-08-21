# Task 1 — CRUD Data Model

> Sheet description: Define a clean users/products/tasks data model with IDs, status, priority, timestamps, and validation rules

## Files

- `model.js` — schemas, enums, id generation, record lifecycle, display helpers
- `seed.js` — fixed sample data for all three entities

## The schema drives everything

```js
SCHEMAS.products.fields  →  the form inputs        (tasks 3, 4, 7, 13)
                         →  the validation rules   (task 6)
                         →  the table columns      (task 2)
                         →  the search fields      (task 10's selector)
```

Adding a field to a product is meant to be **one edit** in `model.js`. Everything that renders or
validates it follows. That's the difference between a data model and a pile of interfaces.

## System fields are not schema fields

`id`, `createdAt` and `updatedAt` are managed by the model helpers and deliberately absent from
`fields`. A form can't render them, so a form can't corrupt them.

```js
export function updateRecord(record, changes) {
  return {
    ...record,
    ...changes,
    id: record.id,                 // re-applied AFTER the spread
    createdAt: record.createdAt,
    updatedAt: new Date().toISOString()
  };
}
```

The page has a button that tries to overwrite the id and watches it fail. There's a test for it too.

## Enums as objects

```js
export const STATUS = {
  active:   { label: "Active",   tone: "ok" },
  archived: { label: "Archived", tone: "warn" }
};
```

Every badge in Day 5 reads from this, so the same status can never be green in one view and grey in
another. `PRIORITY` carries a `rank` because high/medium/low don't sort alphabetically.

## Ids

`prd_m2k4x9a1` — prefixed so a stray id in a log says which entity it belongs to, timestamp-led so
ids sort roughly by creation order.

`crypto.randomUUID()` is the right answer once ids leave the browser. This is a client-only demo,
and a readable prefix is worth more here than cross-machine collision resistance.

## Seed data

Fixed ids and timestamps, so the dataset is identical on every load. A moving dataset makes a demo —
and a test — impossible to reason about.
