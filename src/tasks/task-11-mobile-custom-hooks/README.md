# Task 11 — Mobile Custom Hooks

> Sheet description: Create useApi, useAsyncStorage, useTheme, and useDebounce hooks

| Hook | Owns |
|------|------|
| `useApi` | loading, refreshing, error, data, retry, refresh, abort |
| `useAsyncStorage` | async read, `hydrated` flag, guarded write, reset |
| `useTheme` | three modes, system preference, persisted, context |
| `useDebounce` | one timer, cleared on every change |

## useApi — loading is derived, not stored

```js
const currentKey = `${keyOf(deps)}#${reloadKey}`;
const loading = enabled && result.forKey !== currentKey;
```

The settled result carries the dependency key it belongs to. If that key doesn't match the current
one, we're loading. One less piece of state, and no `setState` in the effect body.

That change was forced by ESLint's `react-hooks/set-state-in-effect` rule and made the hook better —
the previous version stored `loading` and flipped it in the effect, which is a cascading render.

The fetcher lives in a ref, written from a **layout** effect:

```js
const fetcherRef = useRef(fetcher);
useLayoutEffect(() => { fetcherRef.current = fetcher; });
```

Assigning a ref during render isn't allowed. Layout effects run before passive ones, so it's always
set before the fetching effect reads it.

## useDebounce — the cleanup IS the mechanism

```js
useEffect(() => {
  const timer = setTimeout(() => setDebounced(value), delay);
  return () => clearTimeout(timer);   // delete this and it stops working
}, [value, delay]);
```

It matters more on a phone than the web: every skipped request is battery and mobile data the user
is paying for.

## useTheme — three modes, not two

```js
const system = useColorScheme();                        // "light" | "dark" | null
const resolved = mode === "system" ? (system ?? "dark") : mode;
```

A phone already has a global light/dark preference, and ignoring it is a small rudeness. `system` is
the honest default.

Because colours come from context, switching the theme reaches every screen without a single one
importing a palette.

## The rules

1. The name starts with `use`
2. A hook returns values, never JSX
3. Extract when you've written the same effect twice, not in anticipation
4. **Mobile-specific:** guard every `setState` behind a mounted check. A screen can be unmounted by
   a back gesture mid-request far more easily than a web page navigates away mid-fetch.
