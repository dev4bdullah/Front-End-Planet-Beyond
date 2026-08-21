# Task 11 — Custom Hooks

> Sheet description: Implement useFetch, useDebounce, useLocalStorage, and useDocumentTitle hooks

## Six hooks

| Hook | Owns |
|------|------|
| `useFetch` | loading, error, data, retry, abort on unmount and on dep change |
| `useDebounce` | one timer, cleared on every change |
| `useLocalStorage` | lazy read, write on change, try/catch on both |
| `useDocumentTitle` | sets the tab title, restores the previous on unmount |
| `useApp` | outlet context, with an error that names the problem |
| `usePrevious` | the value from the last render, via a ref |

Between them they remove about forty lines from every data page in this project.

## useFetch — the ref that keeps the deps honest

```js
const fetcherRef = useRef(fetcher);
fetcherRef.current = fetcher;      // updated every render, not a dependency
```

The fetcher is almost always an inline arrow, so it has a new identity every render. Putting it in
the dependency array creates an infinite loop; the ref keeps the deps to what actually matters.

`reloadKey` is how `retry` works — bumping a number re-runs the effect without any of the caller's
dependencies changing.

## useDebounce — the cleanup IS the mechanism

```js
useEffect(() => {
  const timer = setTimeout(() => setDebounced(value), delay);
  return () => clearTimeout(timer);      // delete this and it stops working
}, [value, delay]);
```

Without the cleanup you don't get a debounce — you get one delayed update per keystroke, all firing
400ms apart.

## The rules

1. The name starts with `use`, or React can't apply the rules of hooks to it
2. A hook returns values, never JSX. If it renders, it's a component
3. Hooks compose — `useFetch` calls `useState`, `useEffect`, `useRef` and `useCallback`
4. **Extract when you've written the same effect twice**, not in anticipation

`useFetch` exists here because tasks 9, 10 and 12 all needed the same thirty lines — not because a
fetching hook seemed like a good idea in advance.

## What useFetch deliberately isn't

It has: loading, error, data, retry, abort, dependency tracking.

It lacks: caching, deduplication of identical in-flight requests, background refetch,
stale-while-revalidate, pagination helpers, optimistic updates, devtools.

Write this to understand the problem. Reach for TanStack Query when the second column starts
mattering — usually the first time two components request the same data at once.
