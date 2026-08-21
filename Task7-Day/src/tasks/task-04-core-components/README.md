# Task 4 — Core Components

> Sheet description: Build screens using View, Text, Image, ScrollView, FlatList, Pressable, TouchableOpacity, and TextInput

## The web-to-native map

| Web | React Native |
|-----|--------------|
| `<div>` | `<View>` |
| `<p>`, `<span>`, `<h1>` | `<Text>` |
| `<img>` | `<Image>` |
| `<input>` | `<TextInput>` |
| `<button>`, `<a>` | `<Pressable>` |
| scrolling `<div>` | `<ScrollView>` or `<FlatList>` |

## Text has no implicit node

```jsx
<View>Hello</View>            {/* ❌ crashes */}
<View><Text>Hello</Text></View>  {/* ✅ */}
```

"Text strings must be rendered within a `<Text>` component" is the error, and it catches everyone
once. On the web a bare string in a div just works; React Native has no text node.

`<Text>` also nests, and nested text **inherits** style — which is the only place inheritance
happens in React Native. A `<View>` never passes style to its children.

## Pressable or TouchableOpacity

`Pressable` is the current one and handles more: hover, long press, and a `style` function that
receives the press state.

```jsx
<Pressable style={({ pressed }) => [s.card, pressed && s.pressed]} android_ripple={{ color }}>
```

`TouchableOpacity` still works and reads more simply when all you want is a fade. `android_ripple`
is worth adding either way — a ripple is what Android users expect, and its absence reads as a
cheap port.

## ScrollView or FlatList

**ScrollView mounts everything.** Fine for a settings page, wrong for a list of two hundred.

**FlatList mounts a window.** Task 9 covers it properly.

The rule: if the number of children is bounded and small, ScrollView. If it comes from data of
unknown length, FlatList.

## Accessibility isn't optional here

A `<Pressable>` is not announced as a button unless you say so:

```jsx
<Pressable accessibilityRole="button" accessibilityLabel="Add to cart">
```

On the web a `<button>` carries that for free. In React Native every interactive element needs it
stated.
