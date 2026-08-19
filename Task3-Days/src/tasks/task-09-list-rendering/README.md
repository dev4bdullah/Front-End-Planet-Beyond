# Task 9 — List Rendering

> Sheet description: Render dynamic arrays with proper keys, empty states, status badges, and conditional actions

## The demo worth actually running

The first section has two buttons: `key={row.id}` and `key={index}`. Each row contains an
uncontrolled input.

1. Type different text into all three boxes
2. Press **Reverse order**

With **id keys**, the text follows its row. With **index keys**, the text stays behind — React
thinks row 0 is still row 0 and only swaps the visible label. That's the bug, and it's invisible
until a list has state inside it.

## Key rules

| Key | Verdict | Why |
|-----|---------|-----|
| `item.id` | correct | tied to the data, survives reordering |
| `index` | only if static | no reorder, no insert, no delete, no inner state |
| `Math.random()` | never | new key every render → everything remounts every time |
| no key | never | React falls back to index and warns |

Two facts people miss:

- Keys only need to be unique **among siblings**, not globally
- Keys are **not passed to the component**. `props.key` is `undefined`. Pass the id twice if the
  child needs it: `<Row key={item.id} id={item.id} />`

## Every list needs four states

```jsx
{loading                        ? <Skeleton count={3} />
: !items.length && !hasFilters  ? <EmptyState title="No tasks yet" />
: !visible.length               ? <EmptyState title="Nothing matches" />
: <ul>{visible.map(...)}</ul>}
```

The two empty states say different things. "Nothing matches your search" and "you have no tasks
yet" need different messages and different actions — merging them confuses people.

## Filter, search and sort are derived

```js
const visible = tasks
  .filter(byStatus)
  .filter(bySearch)
  .sort(byPriority);
```

All three run during render. Nothing is stored twice, so nothing can fall out of sync. Note the
`.sort()` here operates on the array returned by `.filter()` — a fresh array, so it's safe. Sorting
`tasks` directly would mutate state.

## Grouping

```js
const groups = products.reduce((acc, item) => {
  (acc[item.category] ||= []).push(item);
  return acc;
}, {});
```

Then `Object.entries(groups).map(...)`. Insertion order is preserved for string keys, so groups come
out in the order they first appeared.
