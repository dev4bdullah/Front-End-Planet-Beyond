# Task 5 — Route Params

> Sheet description: Pass item IDs/data to details screens and safely handle missing params

## Pass the id, not the object

```js
navigation.navigate("Details", { product })        // ❌
navigation.navigate("Details", { id: product.id }) // ✅
```

Three reasons:

1. Params are **serialised into navigation state**, so they must be JSON-safe — no Dates, no
   functions, no class instances.
2. They're **persisted for state restoration**, and a large object bloats that.
3. A passed-in copy **goes stale** the moment the record changes. An id refetches.

## Navigating into a nested navigator

```js
navigation.navigate("App", {           // the drawer screen
  screen: "HomeTab",                   // the tab
  params: { screen: "Details", params: { id: 4 } }
});
```

Getting the shape wrong lands you on the tab's default screen with no error.

## Guard before you use

```js
const rawId = route.params?.id;   // params itself can be undefined
const id = Number(rawId);
const valid = rawId !== undefined && !Number.isNaN(id);

if (!valid) return <ErrorState message="No usable product id was passed." />;

const query = useApi(fn, [id], { enabled: valid });   // don't fetch until it's known good
```

A param can be missing because of a bad deep link, a typo in a `navigate` call, or state restoration
after the OS killed the app. The task screen has buttons that open Details with no id and with a
word, so both paths are reachable.

**A deep link always arrives as a string.** `day8://product/4` gives `"4"`, not `4`. Comparing with
`===` against a number silently fails.

## Two smaller APIs

```jsx
<Stack.Screen name="Details" component={Details} initialParams={{ id: 1 }} />

navigation.setParams({ sort: "price" });   // merges into current params
```
