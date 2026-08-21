# Task 11 — Offline & Error UX

> Sheet description: Show offline/error fallback, retry actions, and safe UI when API/network fails

A phone loses signal constantly. Offline isn't an error state on mobile — it's a normal one.

## Two different questions

```js
isConnected           the device is attached to a network
isInternetReachable   that network can actually reach the internet
```

They differ constantly: hotel wifi behind a captive portal, a train tunnel, full bars with no data
allowance. Checking only the first is why apps claim to be online while every request times out.

```js
const online = isConnected && isInternetReachable !== false;
```

`isInternetReachable` is `null` while NetInfo is still checking. Treating `null` as false flashes an
offline banner on every launch.

## Say which problem it is

```js
error.kind === "network"  → "You're offline. Check your connection."
error.kind === "timeout"  → "That took too long."
error.status === 404      → "That doesn't exist any more."      (no retry button — it'll 404 again)
error.status >= 500       → "The server had a problem. Try again shortly."
```

Each implies a different action. The `kind` field comes from the service layer, so no screen has to
parse an error string.

## Stale data beats no data

```jsx
// ❌ the error replaces everything the user had
if (error) return <ErrorState />;

// ✅ keep the content, put the problem above it
{error && <OfflineBanner onRetry={retry} />}
<List items={cachedItems} />
```

`useApi` does exactly this for a refresh: a failed pull-to-refresh keeps the old rows and reports the
error separately.

## Don't auto-retry silently

On a metered connection that's the user's money. Retry on demand, or with backoff and a visible
attempt count.

## Offline-first, briefly

1. Read from a local cache first, render immediately
2. Fetch in the background, update cache and UI
3. Queue writes made offline, replay on reconnect
4. Show what's pending

Steps 1–2 are close to free with TanStack Query. Steps 3–4 are the genuinely hard part, and where
most apps stop. This app does 1–2 partially; it has no writes to queue.
