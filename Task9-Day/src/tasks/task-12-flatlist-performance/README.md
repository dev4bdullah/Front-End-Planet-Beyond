# Task 12 — FlatList Performance

> Sheet description: Optimize FlatList with initialNumToRender, windowSize, getItemLayout where appropriate, and memoized rows

500 rows, with a toggle between tuned and untuned settings.

## Measure first

Dev menu → Toggle performance monitor. Two FPS counters, and which one drops tells you the kind of
problem:

```
JS low, UI fine  → slow JavaScript (an unmemoised row, an expensive render)
UI low           → the native side (too many views, big images, Android shadows)
Both low         → a huge list rendered without windowing
```

## memo + useCallback, together or not at all

```jsx
const Row = memo(function Row({ item, onPress }) { … });

// ❌ a NEW function every render — memo compares unequal, so every row
//    re-renders anyway and the memo does literally nothing
renderItem={({ item }) => <Row item={item} onPress={id => select(id)} />}

// ✅
const onPress = useCallback(id => setSelected(id), []);
const renderItem = useCallback(({ item }) => <Row item={item} onPress={onPress} />, [onPress]);
```

This is the biggest win and the easiest one to accidentally undo.

## The four props

| Prop | Does |
|------|------|
| `initialNumToRender` | rows in the **first paint** — one screenful, not more |
| `maxToRenderPerBatch` | rows per scroll batch; higher = fewer gaps, longer JS blocks |
| `windowSize` | screens' worth kept mounted either side; the default 21 is usually too many |
| `removeClippedSubviews` | detaches off-screen views; big win on Android |

## getItemLayout — only for genuinely fixed heights

```js
(_data, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })
```

Lets FlatList skip measurement, which makes `scrollToIndex` instant. Give it a wrong height and the
list scrolls to the wrong place with no error — which is why it's opt-in.

## Cheaper rows beat cleverer props

1. Nested Views — flatten the row's tree
2. Inline style objects — a new object every render, which breaks `memo`
3. Large images without resizing — decode cost per row
4. Shadows on Android — `elevation` forces a separate layer per row

## When FlatList isn't enough

FlatList mounts and unmounts rows; `@shopify/flash-list` recycles them. Noticeably smoother past a
few hundred rows with images, and the swap is easy enough that it isn't worth adding pre-emptively.
