# Task 4 — Update Flow

> Sheet description: Pre-fill edit forms, update selected records, and preserve unchanged fields correctly

## The key that matters

```jsx
<RecordForm key={editing.id} entity={entity} initial={editing} />
```

A modal that stays mounted keeps its form state. Without a key on the record id, opening product B
after product A shows **A's values under B's title** — a bug that only appears on the second edit,
which is exactly when nobody is testing.

## Preserving untouched fields

The reducer merges rather than replaces:

```js
updateRecord(record, pickSchemaValues(entity, { ...record, ...changes }))
```

`pickSchemaValues` drops anything the schema doesn't declare, so an edit form can't smuggle an extra
key into a record. And a partial payload can't blank the fields it didn't mention.

| Merge | Replace |
|-------|---------|
| `{ ...record, ...changes }` | `{ id, ...changes }` |
| untouched fields survive | every field not in the form becomes `undefined` |

## Report what actually changed

```js
const changed = Object.entries(values).filter(
  ([key, value]) => String(before[key] ?? "") !== String(value ?? "")
);
```

"Record updated" when nothing moved is a lie the user can detect. Submit the form unchanged and the
toast says so.

The list still reorders, because `updatedAt` genuinely did move. That's correct, and the page says
so rather than pretending otherwise.
