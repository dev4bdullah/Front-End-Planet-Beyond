# Task 4 — Nested Routes

> Sheet description: Add nested dashboard routes for profile, settings, products, analytics, and user management

## Six children, one of them nested again

```
/nested-routes              Overview     (index route)
/nested-routes/profile
/nested-routes/products
/nested-routes/analytics
/nested-routes/settings
/nested-routes/users        Users
/nested-routes/users/:id    UserDetail   (three levels deep)
```

## Pathless layout routes

```jsx
// ✅ pathless — URL stays /nested-routes/profile
{ element: <DashboardLayout />, children: [{ path: "profile", … }] }

// ❌ with a path — URL becomes /nested-routes/dashboard/profile
{ path: "dashboard", element: <DashboardLayout />, children: [ … ] }
```

A route with no `path` but with an `element` and `children` exists purely to wrap. It adds a layout
without adding a URL segment. This is the feature people most often don't know exists, and it's the
cleanest way to apply a layout — or an error boundary — to a group of routes.

## Index routes

`{ index: true, element: <Overview /> }` is what renders at the parent's exact path. Without one,
`/nested-routes` shows the layout with an **empty Outlet** — a blank panel, no error, which is a
genuinely confusing bug to chase.

The matching `NavLink` needs `end`, or Overview stays highlighted on every child.

## Context has to be forwarded

```jsx
const app = useOutletContext();
<Outlet context={app} />
```

Three layers here means three explicit hand-offs. `DashboardLayout` receives context from
`NestedRoutesPage`, which receives it from `MainLayout`. Miss one and every panel below throws —
the route tests in `src/test/` caught exactly that during development.

## Relative vs absolute links

Relative links resolve against the **route** hierarchy, not the URL, which surprises people the
first time a link inside a pathless layout goes somewhere unexpected. This project uses absolute
paths for that reason.
