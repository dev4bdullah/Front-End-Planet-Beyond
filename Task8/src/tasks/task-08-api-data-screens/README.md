# Task 8 — API Data Screens

> Sheet description: Fetch list and detail data with loading, success, error, empty, and refresh states

Five states, not two. The three people skip are the three users actually hit.

## Order matters

```jsx
if (loading)       return <Skeletons />;
if (error)         return <ErrorState error={error} onRetry={retry} />;
if (!items.length) return <EmptyState … />;
return <List items={items} />;
```

Checking `!items.length` first shows an empty state during loading, because the array is empty then
too.

## Empty is not an error

Conflating them is the most common data-screen bug. A search with no matches worked perfectly; it
just found nothing. Different message, different action, different illustration.

The task screen has four buttons that force success, empty, error and timeout so all four are
reachable without waiting for a real outage.

## Skeletons, not a spinner

A skeleton shaped like the content says what's coming and how much. A centred spinner says only that
something is happening.

Match the real row height — a skeleton that's the wrong size causes a visible jump when the data
lands, which is worse than no skeleton.

## An error needs a way out

An error message with no button leaves the user's only option as force-quitting the app. Every
`ErrorState` here takes an `onRetry`.

## Detail screens have one extra state

A list can render an empty array. A detail screen with no record has nothing to show at all — hence
task 5's guard, and `enabled: false` so the hook doesn't sit in loading forever waiting for a
request that was never made.
