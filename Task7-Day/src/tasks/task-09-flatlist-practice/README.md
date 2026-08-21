# Task 9 — FlatList Practice

> Sheet description: Render large lists using keyExtractor, ListEmptyComponent, ListHeaderComponent, and ItemSeparatorComponent

240 rows, rendering about twelve of them. That's the entire reason FlatList exists.

## Why not `.map()`

A ScrollView with 240 mapped rows mounts all 240 before the first paint. FlatList mounts what fits
and recycles as you scroll. On ten items it makes no difference; on a few hundred with images the
ScrollView version takes seconds to appear and then stutters.

## The four props the task names

```jsx
keyExtractor={item => item.id}                 // stable identity, not the index
ItemSeparatorComponent={Separator}             // between rows only, never top or bottom
ListEmptyComponent={<Empty query={query} />}   // shown INSTEAD of the list
ListHeaderComponent={Header}                   // scrolls with the list
```

`ItemSeparatorComponent` renders n−1 times. Hand-rolling it as a border on every row leaves a stray
line under the last item.

## keyExtractor and the index trap

Using the array index means every row's identity changes when the list is filtered — so React Native
unmounts and remounts rows that didn't change. Any row holding local state shows the wrong row's
state afterwards.

## Everything gets memoised

```jsx
const renderItem = useCallback(({ item }) => <Row item={item} />, []);
const Header = useCallback(() => <SearchBox />, [query]);
```

FlatList compares these by identity. An inline arrow is a new function every render, which defeats
the memoisation FlatList does internally.

The header especially: passing an inline arrow remounts it every render, which unmounts the
TextInput inside it and **drops the keyboard mid-typing**.

## getItemLayout

```jsx
(_data, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })
```

Lets FlatList compute scroll offsets without measuring — `scrollToIndex` becomes instant and the
scrollbar accurate. Only valid when rows are genuinely a fixed height; a wrong value scrolls to the
wrong place, which is why it's opt-in.

## Never nest a FlatList in a ScrollView

This screen is deliberately split — the list is one route, the prose another — for exactly this
reason. A vertical FlatList inside a vertical ScrollView gets unbounded height, loses all windowing
and renders every row.

The fix is to put the surrounding content into the list itself, via `ListHeaderComponent` and
`ListFooterComponent`.

## Performance props

```jsx
initialNumToRender={12}   maxToRenderPerBatch={12}   windowSize={9}   removeClippedSubviews
```

Measure before tuning these. A slow list is usually a heavy row component or an unmemoised
`renderItem`, not a windowing setting.
