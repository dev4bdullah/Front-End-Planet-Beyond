# Task 8 — Code Splitting

> Sheet description: Lazy-load route pages with React.lazy and Suspense fallback UI

## Every page in this dashboard is already lazy

`src/router/routes.jsx` wraps all thirteen in `React.lazy`. Vite sees the `import()` and creates a
chunk per page automatically — no configuration.

## Prove it in 30 seconds

1. `F12` → Network tab, filter to JS
2. Reload — note how few files load
3. Click **Charts & Analytics** — a new chunk appears, and it's the biggest on the site
4. Go back, then to Charts again — nothing downloads, it's cached
5. Run `npm run build` and read the chunk list

## The actual build output

```
charts-[hash].js      420 kB   only fetched by /charts and /deliverable
react-[hash].js       176 kB   shared by every page, cached once
motion-[hash].js      124 kB   only fetched by /framer-motion
router-[hash].js       92 kB
index-[hash].js        24 kB   the shell
Page-[hash].js      2–16 kB    × 13, one per lazy route
```

## Nesting order matters

```jsx
<ErrorBoundary level="page">     {/* outer */}
  <Suspense fallback={<LoadingState />}>
    <Component />
  </Suspense>
</ErrorBoundary>
```

The boundary wraps Suspense, so a chunk that **fails to download** — a deploy mid-session, a flaky
connection — renders the error fallback with a retry rather than an unhandled rejection.

## Vendor chunks

Route splitting handles your code; libraries need `manualChunks`, or every page chunk ends up with
its own copy of React.

**Vite 8 uses rolldown, which requires the function form:**

```js
manualChunks(id) {
  if (!id.includes("node_modules")) return undefined;
  if (id.includes("recharts") || id.includes("d3-")) return "charts";
  if (id.includes("framer-motion")) return "motion";
  if (id.includes("react-router")) return "router";
  if (id.includes("/react/") || id.includes("react-dom")) return "react";
  return "vendor";
}
```

The object map that older Vite accepted throws `manualChunks is not a function`.

This also improves caching across deploys: change one page and the react chunk's hash is unchanged,
so returning visitors don't re-download it.

## The fallback is not a spinner

A chunk takes 100–600ms on a real connection. This project uses task 10's `LoadingState` — four KPI
skeletons and a table, which is what most of these pages actually look like.

## What not to lazy-load

- Small components — an extra round trip costs more than 2kB saved
- Anything needed on first paint — you've added latency, not removed weight
- The page the user landed on

Rule of thumb: if the chunk is under ~20kB, the round trip probably costs more than the bytes saved.
