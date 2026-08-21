# Task 4 — Stats & KPI Cards

> Sheet description: Build dashboard stat cards with labels, values, deltas, and loading skeleton states

## The grid

```jsx
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
```

One class list, three layouts: stacked on a phone, paired on a tablet, one row on a laptop.

## `invertDelta` — up is not the same as good

A falling refund rate is good news. The card takes an `invertDelta` prop rather than hard-coding
green for up:

```js
const isGood = invertDelta ? delta < 0 : delta > 0;
```

Both the revenue card (+12.4%) and the refund card (−0.6%) show a green arrow. `StatCard.test.jsx`
locks this in — it's the kind of decision that's easy to undo by accident during a refactor.

## The sparkline is a raw SVG, deliberately

recharts is ~420kB before gzip (see the build output in task 8). Importing it for a 60×24 decoration
inside a KPI card is the kind of choice that shows up in a Lighthouse score. Twelve lines of
`<polyline>` do the same job.

```js
const span = max - min || 1;   // || 1 guards a completely flat series
```

Without the `|| 1`, a flat series divides by zero and every point becomes `NaN`.

## Skeletons that match

`StatCardSkeleton` lives in the same file as the card it replaces, so the two can't drift apart.
Three bars at the same heights and widths as the label, value and delta — nothing shifts when the
real data lands.

Press **Simulate loading** on the page and watch the row: the cards swap in place with no layout
shift. A centred spinner cannot do that, because the spinner and the content are never the same
size.

## `memo` here is justified

`StatCard` is wrapped in `memo` because it receives primitives and sits in a grid that re-renders
whenever anything else on the dashboard changes. Task 7 covers when that's worth doing and when it
isn't.
