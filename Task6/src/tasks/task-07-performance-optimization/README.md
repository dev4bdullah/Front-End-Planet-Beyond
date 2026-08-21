# Task 7 — Performance Optimization

> Sheet description: Use React.memo, useMemo, and useCallback only where they reduce measurable re-renders

Take the sheet wording literally — **only where they reduce measurable re-renders**. This page is
built to show when that's true and when it isn't.

## The four cards

Type in the input and watch the render counters:

| Card | Renders | Why |
|------|---------|-----|
| No memo | climbs | re-renders with the parent, as expected |
| memo + string prop | stays at 1 | the prop is compared by value |
| **memo + inline object** | **climbs** | `{{ mode: "compact" }}` is a new reference every render |
| memo + `useCallback` | stays at 1 | the function identity is stable |

The third card is the whole point. `memo` compares props by reference, so wrapping a component in it
without stabilising its props adds a comparison and buys nothing. `interactions.test.jsx` asserts
that card 3's render count equals card 1's — the demo is locked in.

## Which tool for what

```
React.memo      skip re-rendering a child whose props haven't changed
useMemo         cache an expensive VALUE between renders
useCallback     keep a FUNCTION identity stable across renders
useRef          hold a value that survives renders without causing one
```

## When to skip it

- You haven't measured — you're guessing
- The child isn't memoised, so the reference doesn't matter
- The calculation is a single arithmetic expression
- The component renders in under a millisecond anyway

Every `memo` adds a prop comparison, every `useMemo` adds a dependency array to keep correct, and
both make the genuinely slow component harder to find in the Profiler.

## Cheaper wins than memoisation

1. **Move state down.** If only `<Search />` uses the query, the query doesn't belong in the page
   component. A memoised child is usually a workaround for state living too high up.
2. **Pass `children`.** `<Layout>{children}</Layout>` doesn't re-render children when Layout's own
   state changes.
3. **Render less.** Task 5 paginates to 8 rows — that beats memoising 47.
4. **Split the bundle.** Task 8 removes 420kB of recharts from first paint, which no amount of `memo`
   can do.
