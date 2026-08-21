# Day 4 — React Router

Twelve tasks, one routed product catalogue. Each folder under `src/tasks/` is one row from the task
sheet, named after the task.

```
day4-react-router/
├── package.json  vite.config.js  jsconfig.json  eslint.config.js  .prettierrc
├── index.html
└── src/
    ├── main.jsx  App.jsx
    ├── router/routes.jsx        the entire route tree, in one file
    ├── shared/                  Section wrapper, cx helper, sample data
    ├── styles/index.css         design tokens, plain CSS (Tailwind arrives day 6)
    ├── test/                    setup, helpers, and two suites
    └── tasks/
        ├── task-01-react-router-setup/
        ├── task-02-base-pages/            + pages/ (Home, About, Products, NotFound)
        ├── task-03-shared-layouts/        + layout/ (MainLayout, Sidebar, Topbar, nav)
        ├── task-04-nested-routes/         + dashboard/ (layout + 7 panels)
        ├── task-05-dynamic-routes/        + ProductDetail
        ├── task-06-url-search-params/
        ├── task-07-outlet-context/
        ├── task-08-navigation-ux/         + components/Breadcrumbs
        ├── task-09-api-service-layer/     + services/ (http, product, user)
        ├── task-10-useeffect-and-cleanup/
        ├── task-11-custom-hooks/          + hooks/ (6 hooks)
        └── task-12-deliverable/           + components/
```

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:3000. Pick any task from the sidebar.

React needs a build step, so this is **one project rather than twelve** — one `npm install`. Each
task still has its own folder and README, and the folders are named exactly as the sheet names the
tasks.

## Scripts

| Command | Does |
|---------|------|
| `npm run dev` | dev server on port 3000 |
| `npm run build` | production bundle into `dist/` |
| `npm run preview` | serve the built bundle — the only way to test SPA routing locally |
| `npm test` | run the suite once |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## The tasks

| # | Task title (as in the sheet) | Sheet description |
|---|------------------------------|-------------------|
| 1 | React Router Setup | Install react-router-dom, wrap the app in BrowserRouter, and define the base route structure |
| 2 | Base Pages | Create Home, About, Products, Product Details, Dashboard, Settings, and Not Found pages |
| 3 | Shared Layouts | Create MainLayout and DashboardLayout using Outlet for shared navigation and page structure |
| 4 | Nested Routes | Add nested dashboard routes for profile, settings, products, analytics, and user management |
| 5 | Dynamic Routes | Use useParams to build product/user detail pages from route IDs |
| 6 | URL Search Params | Use query params for search, category, status, page, limit, and sort order |
| 7 | Outlet Context | Pass layout-level user/settings data through useOutletContext where appropriate |
| 8 | Navigation UX | Use NavLink active states, breadcrumbs, route titles, and clean navigation hierarchy |
| 9 | API Service Layer | Create reusable fetch or axios service functions with centralized error handling |
| 10 | useEffect & Cleanup | Fetch route-based data with useEffect and AbortController cleanup to avoid stale updates |
| 11 | Custom Hooks | Implement useFetch, useDebounce, useLocalStorage, and useDocumentTitle hooks |
| 12 | Deliverable | Build a routed product listing app with detail pages, URL-based filters, pagination, loading, error, and empty states |

## Three demos worth running rather than reading

**Task 10 — the race condition.** Two panels run the same fetch, one with cleanup and one without.
Switch products quickly and watch the log: without cleanup, the last response to *arrive* wins
rather than the last you asked for, so a slow request for product 1 can overwrite a fast one for
product 4 while the URL still says 4. Invisible on localhost, constant on 3G.

**Task 6 — the URL is the state.** Filter the list, copy the address bar into a new tab, and you get
the identical view. Then press Back and watch it step through your filters instead of leaving the
app.

**Task 3 — the mount counter.** Navigate away from Shared Layouts and back. The page's mount count
climbs; nothing in the sidebar resets. That's the difference between a layout route and putting
`<Sidebar />` at the top of every page.

## What was verified

- `npm run build` — 65 modules, no warnings
- `npx eslint .` — zero errors, zero warnings
- `npm test` — **47 tests across 2 files, all passing**

The route suite mounts all twelve pages, checks the sidebar active state, the topbar title, the
theme toggle, the 404 rendering inside the layout, the `/shop` redirect, the three-level nested
route, and `end` correctly deactivating a parent link. The interaction suite covers URL param
reading and writing, default-dropping, page clamping, breadcrumbs, document title set *and*
restored, service-layer error handling with and without a status, retry, and the deliverable's four
states.

Writing those tests found a real bug: four intermediate layout routes weren't forwarding outlet
context, so every child below them crashed. Context does not pass through automatically — each
layer that renders an `Outlet` has to hand it on. That's precisely the trap task 7 documents, and I
walked into it four times before the test suite caught it.
