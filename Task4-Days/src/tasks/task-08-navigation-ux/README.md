# Task 8 — Navigation UX

> Sheet description: Use NavLink active states, breadcrumbs, route titles, and clean navigation hierarchy

## NavLink active state comes from the URL

```jsx
<NavLink to="/x" end className={({ isActive }) => cx("nav__link", isActive && "is-active")} />
```

Deriving active from `useState` means it can disagree with where you actually are — after a back
button, or on a page opened from a bookmark.

Both `className` and `children` accept a function receiving `isActive`.

## `end`, and when *not* to use it

The dashboard sub-nav uses `end` on Overview, so it deactivates on child routes. The main sidebar
deliberately omits it, so **Dynamic Routes** stays highlighted while you're on
`/dynamic-routes/7`.

Same prop, opposite decision, driven by whether children should count as "still in that section".

## Breadcrumbs from the pathname

```js
const parts = pathname.split("/").filter(Boolean);
```

Built from the URL, so they can never disagree with it. A hand-maintained breadcrumb array drifts
the first time a route moves.

Two details: the last crumb carries `aria-current="page"`, and it **isn't a link** — linking to the
page you're already on is a small but real usability bug.

## Route titles

Nothing updates the tab title in an SPA, so every tab says the same thing and browser history
becomes useless.

```jsx
useEffect(() => {
  const previous = document.title;
  document.title = "Navigation UX · Router Shop";
  return () => { document.title = previous; };   // restore, don't assume a default
}, []);
```

Task 11 wraps this as `useDocumentTitle`. There's a test asserting the title is both set *and*
restored on unmount.

## Programmatic navigation, and when not to

Use a `Link` whenever the destination is known at render time — it can be middle-clicked, opened in
a new tab, copied, and read as a link by a screen reader. `navigate()` inside an `onClick` gives up
all of that. Reserve it for after a form submits or an action completes.
