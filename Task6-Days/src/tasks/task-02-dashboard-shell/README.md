# Task 2 — Dashboard Shell

> Sheet description: Build responsive sidebar, topbar, content area, mobile menu, and page container

## Files

```
layout/
├── DashboardShell.jsx   the grid, theme state, drawer state
├── Sidebar.jsx          serves both the desktop rail and the mobile drawer
├── Topbar.jsx           title, search, notifications, theme toggle, avatar
└── navigation.js        one list driving sidebar, topbar title and router
```

## The layout

```jsx
<div className="grid h-dvh grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
  <aside className="hidden border-r lg:block"><Sidebar /></aside>
  <div className="flex min-w-0 flex-col">
    <Topbar />
    <main id="main-scroll" className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
</div>
```

## Four details that matter

**`h-dvh`, not `h-screen`.** `dvh` accounts for mobile browser chrome; `h-screen` leaves the bottom
of the page hidden under the address bar on iOS.

**`minmax(0,1fr)`, not `1fr`.** A wide table inside a `1fr` grid column forces the column wider than
the viewport. `minmax(0,1fr)` lets it shrink and scroll instead.

**`min-w-0` on the content column.** Same problem one level down — without it a long unbroken string
blows out the layout.

**Scroll on `<main>`, not `<body>`.** The sidebar and topbar stay put with no `position: fixed`, so
there's no z-index stack to manage.

## The mobile drawer

Four things it needs, three of which are usually missing:

- a backdrop that closes it
- Escape to close
- a body scroll lock — restoring the *previous* value, not setting `""`
- closing itself on navigation, and resetting the scroll position

## One list, three consumers

`navigation.js` holds `num`, `slug`, `title`, `label`, `icon` and `group`. The sidebar groups by
`group`, the topbar looks up `title`, and the router maps `slug` to a lazy page. Adding a page is one
line.

`title` is the full task name from the sheet; `label` is the short form for the rail. Keeping both in
one place means they can never disagree — which is exactly the bug the route tests caught.

## Active state from the router

`NavLink` handles it. Both `className` and `children` accept a function receiving `isActive`, which
is how the icon dims on inactive rows. Deriving the active item from `useState` instead means it can
disagree with the URL after a back button or on a bookmarked page.
