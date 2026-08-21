# Task 10 — useEffect & Cleanup

> Sheet description: Fetch route-based data with useEffect and AbortController cleanup to avoid stale updates

## The page runs the same fetch twice, side by side

One panel with cleanup, one without. Switch products quickly and watch the log: the cleanup panel
aborts each superseded request, the other lets every response land — so the last to **arrive** wins,
not the last you asked for.

## The pattern

```jsx
useEffect(() => {
  const controller = new AbortController();
  let active = true;

  getProduct(id, { signal: controller.signal })
    .then(data => { if (active) setProduct(data); })
    .catch(error => {
      if (error.name === "AbortError") return;   // not a failure
      if (active) setError(error.message);
    });

  return () => {
    active = false;          // stop a late .then from writing
    controller.abort();      // stop the request itself
  };
}, [id]);
```

**Two guards, not one.** `AbortController` stops the request; the `active` flag stops a response
that already resolved from writing state afterwards.

## The dependency array is doing routing work

Task 5 showed that changing `:id` re-renders rather than remounts. So `[id]` is what makes a detail
page refetch at all — an empty `[]` gives you a page permanently stuck on the first record while
the URL changes underneath it.

## Why the race is worse than a flicker

```
t=0    click product 1  → request A sent
t=50   click product 4  → request B sent
t=200  response B arrives → shows product 4  ✅
t=900  response A arrives → shows product 1  ❌ URL still says /products/4
```

Now everything downstream reads the wrong record. You will almost never see this on localhost, and
constantly on 3G — which is why testing with throttling on is worth the habit.

## Everything that needs cleanup

| Effect | Cleanup |
|--------|---------|
| `setInterval` / `setTimeout` | `clearInterval` / `clearTimeout` |
| `addEventListener` | `removeEventListener` |
| subscriptions | `unsubscribe()` |
| `ResizeObserver` | `disconnect()` |
| `URL.createObjectURL` | `revokeObjectURL` |
| `fetch` | `controller.abort()` |

The page has a mountable/unmountable ticker so you can watch an interval being cleared.

## StrictMode fires every effect twice

Deliberately, in development, so a missing cleanup surfaces immediately. It does not happen in a
production build. **If double-firing breaks your component, the cleanup is genuinely wrong** —
deleting StrictMode to "fix" it hides a real bug.
