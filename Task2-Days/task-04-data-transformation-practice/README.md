# Task 4 — Data Transformation Practice

> Sheet description: Use map/filter/find/some/every/reduce/sort on realistic task/user datasets

## Run it

Right-click `index.html` → **Open with Live Server**. The raw dataset is printed at the bottom of
the page, so every result can be checked by hand.

## Choosing the right method

| You want | Use | Returns |
|----------|-----|---------|
| same count, different shape | `map` | new array, same length |
| fewer items, same shape | `filter` | new array, shorter |
| one specific item | `find` | the item, or `undefined` |
| "is there at least one?" | `some` | boolean |
| "do they all pass?" | `every` | boolean |
| a total, a group, an object | `reduce` | anything |
| a different order | `sort` | the **same** array, reordered |

## Four traps demonstrated in the code

**`sort` mutates.** It reorders the original and returns the same reference. Always
`[...tasks].sort(...)` unless you actually want the source changed.

**Default sort is alphabetical.** `[10, 9, 1].sort()` gives `[1, 10, 9]` because it compares
stringified values. Numbers always need `(a, b) => a - b`.

**`reduce` without an initial value throws on an empty array.** Pass the seed every time —
`reduce((acc, t) => ..., 0)` or `..., {})`.

**`every` on an empty array is `true`.** Vacuous truth. `some` on an empty array is `false`.
Both are correct and both surprise people.

## Patterns worth stealing

```js
// group into an object
tasks.reduce((acc, t) => {
  (acc[t.assignee ?? "unassigned"] ||= []).push(t.id);
  return acc;
}, {});

// unique values across nested arrays
[...new Set(tasks.flatMap(t => t.tags))];

// sort by two keys — || falls through when the first comparison ties
[...tasks].sort((a, b) => RANK[a.priority] - RANK[b.priority] || a.due.localeCompare(b.due));
```

The **chained** button shows the shape you'll write most often in real code:
`filter → filter → sort → map`. Each step does one thing, and the chain reads top to bottom.
