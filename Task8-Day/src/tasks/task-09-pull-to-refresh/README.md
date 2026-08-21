# Task 9 — Pull To Refresh

> Sheet description: Implement RefreshControl and reload data without breaking current screen state

## Two flags, not one

```js
const loading    // first load — show skeletons
const refreshing // pull-to-refresh — keep the rows on screen
```

Reusing `loading` for a refresh blanks the list and replaces it with skeletons — while the user is
looking at the data they just pulled down. That's the "without breaking current screen state" half
of the task.

In `useApi`, `loading` is derived from whether the settled result matches the current request key,
while `refreshing` is real state — because a refresh doesn't change the request, only re-runs it.

## A failed refresh keeps the old data

```js
catch (error) {
  setResult(previous => ({ ...previous, error }));   // report it
  // …but never setData(null)
}
```

Blanking a working list because a refresh failed is worse than showing data that's thirty seconds
stale.

## RefreshControl is styled per platform

```jsx
<RefreshControl
  refreshing={query.refreshing}
  onRefresh={query.refresh}
  tintColor={colors.brand}                 // iOS
  colors={[colors.brand]}                  // Android
  progressBackgroundColor={colors.surface} // Android
/>
```

Setting only one leaves the other at its default, which usually clashes with a dark theme.

## It has to be on the scrollable itself

`RefreshControl` is a prop of `ScrollView`, `FlatList` or `SectionList`. It cannot go on a `View`,
and wrapping the list in a `ScrollView` to get it there breaks both the gesture and the windowing.

This screen is built the correct way round: the entire explanation you're reading is the list's
`ListHeaderComponent`.

## Refresh or infinite scroll

```jsx
refreshControl={…}           // pull DOWN at the top — replaces
onEndReached={loadMore}      // scroll to the BOTTOM — appends
onEndReachedThreshold={0.5}

const loadMore = () => { if (!loadingMore && hasMore) fetchNextPage(); };  // guard it
```
