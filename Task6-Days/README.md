# Day 6 — Tailwind Dashboard & Polish

Thirteen tasks, one React admin dashboard. Each folder under `src/tasks/` is one row from the task
sheet, named after the task.

```
day6-tailwind-dashboard/
├── package.json  vite.config.js  jsconfig.json  eslint.config.js  .prettierrc
├── index.html
└── src/
    ├── main.jsx  App.jsx
    ├── router/routes.jsx        every page lazy-loaded
    ├── shared/                  Section wrapper, cx helper, sample data
    ├── styles/index.css         Tailwind v4 @theme tokens
    ├── test/                    setup + route and interaction suites
    └── tasks/
        ├── task-01-tailwind-dashboard-setup/
        ├── task-02-dashboard-shell/          + layout/ (shell, sidebar, topbar, nav)
        ├── task-03-reusable-ui-system/       + ui/ (9 components)
        ├── task-04-stats-and-kpi-cards/      + components/StatCard
        ├── task-05-professional-data-table/  + components/DataTable
        ├── task-06-charts-and-analytics/     + components/charts
        ├── task-07-performance-optimization/
        ├── task-08-code-splitting/
        ├── task-09-error-boundaries/         + components/ErrorBoundary
        ├── task-10-ux-states/                + components/states
        ├── task-11-framer-motion/            + components/motion-parts
        ├── task-12-testing-and-build/        + tests/ (5 files)
        └── task-13-deliverable/              + components/DashboardCharts
```

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:3000. Pick any task from the sidebar.

React needs a build step, so this is **one project rather than thirteen** — one `npm install`. Each
task still lives in its own folder with its own README, and the folders are named exactly as the
sheet names the tasks.

## Scripts

| Command | Does |
|---------|------|
| `npm run dev` | dev server on port 3000 |
| `npm run build` | production bundle into `dist/` |
| `npm run preview` | serve the built bundle — use this for Lighthouse, not the dev server |
| `npm test` | run the suite once |
| `npm run test:watch` | re-run on save |
| `npm run lint` | ESLint |
| `npm run format` | Prettier, with Tailwind class sorting |

## The tasks

| # | Task title (as in the sheet) | Sheet description |
|---|------------------------------|-------------------|
| 1 | Tailwind Dashboard Setup | Install and configure Tailwind CSS in the React project with clean design tokens |
| 2 | Dashboard Shell | Build responsive sidebar, topbar, content area, mobile menu, and page container |
| 3 | Reusable UI System | Create consistent variants for buttons, cards, badges, inputs, tables, and empty states |
| 4 | Stats & KPI Cards | Build dashboard stat cards with labels, values, deltas, and loading skeleton states |
| 5 | Professional Data Table | Add search, filters, status badges, row actions, pagination, and responsive behavior |
| 6 | Charts & Analytics | Add basic charts for trends, category breakdowns, and dashboard summaries |
| 7 | Performance Optimization | Use React.memo, useMemo, and useCallback only where they reduce measurable re-renders |
| 8 | Code Splitting | Lazy-load route pages with React.lazy and Suspense fallback UI |
| 9 | Error Boundaries | Add route/page-level error boundaries to prevent full app crashes |
| 10 | UX States | Implement skeletons, empty states, no-results states, unauthorized states, and retry states |
| 11 | Framer Motion | Add page transitions, modal transitions, hover animations, and subtle dashboard micro-interactions |
| 12 | Testing & Build | Add basic Vitest/React Testing Library tests, run production build, and fix warnings |
| 13 | Deliverable | Build and deploy or prepare a production-ready React admin dashboard capstone with Lighthouse review |

## Versions used

React 19, Tailwind 4, Vite 8, react-router 7, recharts 3, framer-motion 13, Vitest 4.

Three of these differ from most tutorials you'll find:

- **Tailwind 4** is configured in CSS via `@theme`. No `tailwind.config.js`, no `postcss.config.js`.
- **Vite 8** uses rolldown, so `manualChunks` must be a **function**. The object form throws.
- **ESLint 10** is out but `eslint-plugin-react` doesn't support it yet, so this pins ESLint 9.

## Three demos worth running rather than reading

**Task 7 — the memo demo.** Four cards counting their own renders. The one wrapped in `memo` and
handed `{{ mode: "compact" }}` re-renders exactly as often as the unmemoised one, because `memo`
compares by reference. That card is the argument against reflexive memoisation.

**Task 8 — the Network tab.** Open it, reload, then click through the sidebar. Each page arrives as
its own chunk, and the 420kB charts chunk only downloads when you visit a page that needs it.

**Task 9 — break a widget.** Press "Break widget A". One card shows a fallback; the other card, the
sidebar and every other page keep working.

## What was verified

- `npm run build` — 2,817 modules, **no warnings**, 13 separate page chunks plus isolated
  `charts` / `motion` / `react` / `router` vendor chunks
- `npx eslint .` — zero errors, zero warnings
- `npm test` — **67 tests across 7 files, all passing**

The route suite mounts all thirteen lazy pages, checks the sidebar marks the current page, checks the
theme toggle writes to `<html>` and localStorage, and confirms a page that throws leaves the
navigation usable. The interaction suite covers the seven UX states, error containment and recovery,
the memo render-count demo, the modal open/close cycle, and the deliverable's table filtering and
row deletion.

Writing those tests found a real bug: `DashboardShell` called `element.scrollTo()` unguarded, which
throws in any environment where the method is absent. It's now `?.scrollTo?.()`.
