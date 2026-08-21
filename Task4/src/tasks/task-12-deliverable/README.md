# Task 12 — Deliverable

> Sheet description: Build a routed product listing app with detail pages, URL-based filters, pagination, loading, error, and empty states

## What it is

A product catalogue where **every piece of view state lives in the URL**, backed by the service
layer and custom hooks from tasks 9 and 11.

## Where each task shows up

| Task | Used here as |
|------|--------------|
| 1 Router setup | this page is a route in one central tree |
| 2 Base pages | list, detail and 404 all exist as routes |
| 3 Shared layouts | the sidebar and topbar never remount |
| 4 Nested routes | `/deliverable` and `/deliverable/:id` share a parent |
| 5 Dynamic routes | `useParams` drives the detail fetch |
| 6 URL search params | search, category, sort, limit, page |
| 7 Outlet context | the signed-in user in the header |
| 8 Navigation UX | breadcrumbs in the topbar, tab title per view |
| 9 API service layer | `getProducts` and `getCategories` from `@services` |
| 10 useEffect & cleanup | every request aborts when a filter changes |
| 11 Custom hooks | `useFetch`, `useDebounce`, `useDocumentTitle`, `useApp` |

## Four states, all reachable

Loading (skeleton grid matching the real layout), success, empty, and error with a working retry.
The empty state distinguishes "the catalogue is empty" from "your filters excluded everything" —
different messages, different actions. There are tests for both.

## One deliberate structural choice

On a detail route the list is **not** rendered underneath. Keeping it mounted would refetch the
whole catalogue on every product view. The page checks `useParams().id` and renders only the child.

## Try this

1. Filter and search, copy the URL into a new tab — identical view
2. Press Back — it steps through your filters, not out of the app
3. Open a product, press Back — filters still applied
4. On a product, press Next repeatedly and watch the Network tab abort the superseded requests
5. Visit `/deliverable/999999` — route matches, data doesn't, error state with retry
6. Turn off wifi and press Try again — a network failure reads differently from a bad status

## Data source

`dummyjson.com`, no API key needed. The tests stub `fetch`, so they run offline.
