# Task 1 — React Router Setup

> Sheet description: Install react-router-dom, wrap the app in BrowserRouter, and define the base route structure

## Install and mount

```bash
npm install react-router-dom
```

```jsx
// main.jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

One router, at the root, once. Nesting a second one — or putting `BrowserRouter` inside a component
that re-renders — is behind most "my navigation doesn't work" problems.

This project uses `createBrowserRouter` + `RouterProvider`. The older
`<BrowserRouter><Routes>…</Routes></BrowserRouter>` form still works and is what most tutorials
show; the concepts are identical.

## The route tree lives in one file

`src/router/routes.jsx`. Scattering route definitions across components makes the shape of the app
impossible to see, and makes "where does this URL go?" an archaeology exercise.

## Link vs a vs navigate

```jsx
<Link to="/products">Products</Link>     // ✅ client-side
<a href="/products">Products</a>          // ❌ full page reload, all state lost

navigate("/products")                     // from code
navigate("/products", { replace: true })  // no new history entry
navigate(-1)                              // back
```

The plain anchor is the single most common React Router mistake — it looks like it works.

Prefer `Link` whenever the destination is known at render time: it can be middle-clicked, opened in
a new tab, and is announced as a link by a screen reader. Reserve `navigate()` for after a form
submits or an action completes.

## The one that only breaks in production

Client-side routing means the **server** must serve `index.html` for every path. Vite's dev server
does that automatically; a static host doesn't, so a refresh on `/deliverable` returns a 404.

| Host | Fix |
|------|-----|
| Netlify | `public/_redirects` → `/*  /index.html  200` |
| Vercel | `vercel.json` rewrite all paths to `/index.html` |
| GitHub Pages | set `base` in `vite.config.js`, and use `HashRouter` — Pages can't rewrite |

Test it with `npm run build && npm run preview`. It's the only way to catch this locally.
