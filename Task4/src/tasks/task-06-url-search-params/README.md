# Task 6 — URL Search Params

> Sheet description: Use query params for search, category, status, page, limit, and sort order

## Six controls, zero useState for their values

```jsx
const [params, setParams] = useSearchParams();
const category = params.get("category") ?? "all";
```

The query string **is** the state. There's no `useState` mirroring it, which is what makes the view
shareable.

The one exception is the search box, which keeps a local mirror so typing stays responsive while
the URL updates on a 350ms debounce.

## What you get for free

| You get | Because |
|---------|---------|
| Shareable views | the URL contains everything — paste it to a colleague |
| A working back button | each change is a history entry, so Back undoes a filter |
| Refresh-proof state | reload and the filters survive, with no localStorage |
| Deep links | `?search=monitor&sort=price-asc` works from cold |

All four disappear the moment you mirror this into component state.

## Four implementation details

```js
// 1. always update from the previous params, or you wipe every other filter
setParams(prev => { const next = new URLSearchParams(prev); … });

// 2. drop defaults, so the URL stays readable
if (!value || value === "all") next.delete(key); else next.set(key, value);

// 3. changing a filter resets the page — otherwise you land on page 4 of 2
if (resetPage) next.delete("page");

// 4. replace: true while typing, so Back doesn't step through every keystroke
setParams(next, { replace: true });
```

Skip the second and touching every control once gives you
`?search=&category=all&stock=all&sort=default&page=1` — a URL that says nothing.

## Everything arrives as a string, and it's untrusted

```js
const limit = Number(params.get("limit") ?? 6);
const page = Math.max(Number(params.get("page") ?? 1), 1);   // guard ?page=-3
const safePage = Math.min(page, pageCount);                  // guard ?page=99
```

Anyone can type anything into the address bar. Try `?page=999` — it clamps to the last page rather
than showing an empty grid. There's a test for that.
