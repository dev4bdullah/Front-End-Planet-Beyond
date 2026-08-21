# Task 12 — Search & Favorites

> Sheet description: Add debounced search, favorite/unfavorite actions, and persistent favorites list

## Why debounce matters more here

"keyboard" typed at normal speed is eight requests without a debounce. Seven are thrown away before
the eighth returns — but every one still opened a radio connection.

```js
const debounced = useDebounce(term, 450);
const query = useApi(fn, [debounced], { enabled: debounced.trim().length > 0 });
```

The `enabled` flag is the other half: with an empty box, no request should be made at all — not a
request for everything.

## An array in storage, a Set in memory

```js
const [ids, setIds] = useAsyncStorage("day8.favorites", []);  // array — JSON-safe
const lookup = useMemo(() => new Set(ids), [ids]);            // Set — O(1) lookup
```

AsyncStorage holds JSON and a `Set` doesn't serialise. Deriving the Set on read keeps membership
checks fast without a second source of truth to keep in sync.

## Store ids, not records

```js
setFavorites([...favorites, product]);   // ❌ the copy goes stale
setIds([...ids, product.id]);            // ✅
```

Same argument as route params in task 5, for the same reason.

The Saved tab fetches the catalogue once and filters locally rather than requesting each id
separately — twenty parallel requests for twenty favourites is worse for a phone than one request
that was probably cached anyway.

## Don't flash an empty state before storage answers

```jsx
if (!hydrated) return <Skeletons />;
if (count === 0) return <EmptyState title="No favourites yet" />;
```

AsyncStorage is async, so `count === 0` is true for the first frame even when the user has fifty
favourites. Without the guard, the Saved tab shows "No favourites yet" for a moment on every launch,
which reads as data loss.
