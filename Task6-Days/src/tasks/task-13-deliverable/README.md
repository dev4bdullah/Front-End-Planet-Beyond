# Task 13 — Deliverable

> Sheet description: Build and deploy or prepare a production-ready React admin dashboard capstone with Lighthouse review

## What it is

One screen using all twelve previous tasks: KPI row, revenue and category charts, an orders table,
low-stock and activity panels, and a scenario switcher that reaches the loading, error and
no-permission states.

## Where each task appears

| Task | In this page |
|------|--------------|
| 1 Tailwind setup | every colour, radius and shadow is a `@theme` token |
| 2 Dashboard shell | the sidebar, topbar and scroll container around it |
| 3 UI system | Button, Card, Badge, Select, Table, Skeleton, Avatar |
| 4 KPI cards | the four cards, with sparklines and `invertDelta` |
| 5 Data table | orders — search, filter, sort, select, paginate |
| 6 Charts | revenue area chart and the category donut |
| 7 Performance | `useMemo` on the series slice and the low-stock filter |
| 8 Code splitting | the page is lazy, and the charts inside it are lazy again |
| 9 Error boundaries | three — analytics, the table, and the app root |
| 10 UX states | the scenario switcher |
| 11 Framer Motion | the KPI row staggers in, respecting reduced motion |
| 12 Testing | StatCard, DataTable and ErrorBoundary are all under test |

## Double lazy loading

The route is lazy, and `DashboardCharts` inside it is lazy again. That second boundary is why
recharts (420kB) isn't in the deliverable's own chunk — it arrives only when the charts render.

## Before deploying

1. **Build and preview.** `npm run build && npm run preview`. Routing and lazy loading behave
   differently there than in dev.
2. **Check the chunk list.** If everything landed in one file, an import somewhere is defeating the
   split.
3. **Lighthouse on the preview build, not the dev server.** The dev server serves unminified
   modules and will score badly for reasons that don't exist in production.
4. **Configure SPA fallback.** Client-side routing means the host must serve `index.html` for
   unknown paths, or a refresh on `/charts` 404s.

| Host | Setting |
|------|---------|
| Netlify | `_redirects` → `/* /index.html 200` |
| Vercel | rewrite all routes to `/index.html` |
| GitHub Pages | set `base` in `vite.config.js` to the repo name |

## What Lighthouse will flag, and the honest answers

**Largest Contentful Paint** — the KPI row is the LCP element and it's plain HTML, so this should be
fast. The stagger animation delays perceived paint slightly; it's a deliberate trade.

**Unused JavaScript** — task 8 already addresses this. If the report still flags recharts, check the
preview build rather than dev.

**Colour contrast** — the muted text tokens are the ones to verify. `--color-muted` on
`--color-surface` should be checked in both themes.

**Accessible names** — every icon-only button in the topbar has an `aria-label`; that's the usual
source of this warning.

## Try it

- Switch scenarios to reach loading, error and no-permission
- Delete rows and watch pagination refill the page
- Filter by status, then search
- Toggle the theme — every component follows, and none of them contain a colour value
