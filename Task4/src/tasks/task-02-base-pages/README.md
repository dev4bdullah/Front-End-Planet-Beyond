# Task 2 — Base Pages

> Sheet description: Create Home, About, Products, Product Details, Dashboard, Settings, and Not Found pages

## Where the seven pages live

| Page | File |
|------|------|
| Home | `pages/Home.jsx` |
| About | `pages/About.jsx` |
| Products | `pages/Products.jsx` |
| Not Found | `pages/NotFound.jsx` |
| Product Details | task 5 — it needs the `:id` param |
| Dashboard | task 4 — it needs nested routes |
| Settings | task 7 — it edits outlet context |

Each page lives with the task that motivates it, rather than all seven in one folder. Same
feature-first structure as the other days.

## A page is only a page because a route points at it

There's nothing special about these components. `Home.jsx` is a function returning JSX; it becomes
a page when `{ index: true, element: <Home /> }` appears in the route tree.

## The `end` prop

```jsx
<NavLink to="/base-pages" end>Home</NavLink>   // ✅ exact match only
<NavLink to="/base-pages">Home</NavLink>        // ❌ active on every child too
```

Without `end`, the Home tab stays highlighted on `/base-pages/about`, because `/base-pages` is a
prefix of it. This is the most common `NavLink` bug.

## The 404 route

```jsx
{ path: "*", element: <NotFound /> }
```

Last in the array. It renders **inside** the layout, so the sidebar stays usable rather than the
whole app being replaced — usually what you want.

`NotFound` reads `useLocation()` and shows the path that failed. "Page not found" without saying
which page is a wasted error message.

## This page is itself a layout route

The four tabs are real child routes. Click through them: the URL changes, the breadcrumb updates,
and the section around them never moves.

Note that it forwards outlet context — `<Outlet context={app} />`. Context does **not** pass
through automatically; each layer that renders an Outlet decides what the next one gets. Omitting
that line crashed the tests when this project was written.
