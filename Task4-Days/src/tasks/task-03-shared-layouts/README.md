# Task 3 — Shared Layouts

> Sheet description: Create MainLayout and DashboardLayout using Outlet for shared navigation and page structure

## Files

```
layout/
├── MainLayout.jsx     the grid, theme state, outlet context, scroll reset
├── Sidebar.jsx        grouped task nav with NavLink active states
├── Topbar.jsx         page title, breadcrumbs, theme toggle
└── navigation.js      one list driving sidebar, topbar and router
```

## How a layout route works

A route with `children` and an `<Outlet />` is a layout. The parent renders once; the Outlet is the
hole the matched child drops into.

```jsx
{ path: "/", element: <MainLayout />, children: [ … ] }
```

## Why not just put `<Sidebar />` in every page

Because it would remount on every navigation.

| | Sidebar in each page | Layout route |
|---|---|---|
| Sidebar scroll position | resets | kept |
| Open menu / expanded group | closes | stays open |
| Effects inside the sidebar | re-run every navigation | run once |
| Duplication | one import per page | one line total |

The page has a mount counter demonstrating this: navigate away and back and the *page* count
climbs, while nothing in the sidebar resets.

## Two layouts, three levels

```
MainLayout                  sidebar, topbar, theme, outlet context
└── DashboardLayout         the sub-nav (task 4)
    └── UserDetail          /nested-routes/users/3
```

## What MainLayout owns

- theme and density state, persisted to localStorage
- the effect that applies `theme-dark` to `<html>`
- a scroll reset on every navigation — a browser restores scroll on a real page load, but in an SPA
  nothing does it for you
- the outlet context every route below can read (task 7)
