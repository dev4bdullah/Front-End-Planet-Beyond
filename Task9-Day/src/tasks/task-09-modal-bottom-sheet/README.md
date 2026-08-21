# Task 9 — Modal / Bottom Sheet

> Sheet description: Build a reusable modal or bottom-sheet style component for actions and confirmations

Two shapes, one `Modal` underneath. `lib/BottomSheet.jsx` exports both.

## Why RN's Modal, not an absolute View

1. It renders in a **separate native window**, so it sits above everything — including a navigation
   header, which an absolutely positioned View inside a screen cannot do.
2. `onRequestClose` wires up Android's hardware back button.
3. `statusBarTranslucent` lets it cover the status bar on Android.

## The backdrop must not wrap the sheet

```jsx
// ❌ every tap on the sheet closes it, because the tap bubbles
<Pressable onPress={onClose}><View style={sheet}>{children}</View></Pressable>

// ✅ siblings
<Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
<Animated.View style={sheet}>{children}</Animated.View>
```

## useNativeDriver, and what it costs

```js
Animated.timing(translate, { toValue: 0, duration: 220, useNativeDriver: true })
```

It moves the animation to the UI thread, so it stays smooth while JS is busy — but **only for
`transform` and `opacity`**. Animating height, width or backgroundColor with `useNativeDriver`
throws.

Which is why the sheet animates `translateY` rather than its height.

Note also: the `Animated.Value` is created with `useState`'s lazy initialiser, not
`useRef(...).current`. Reading `.current` during render is what the React compiler rules reject, and
the value must be created exactly once.

## Android's back button

```js
BackHandler.addEventListener("hardwareBackPress", () => {
  onClose();
  return true;    // "handled" — return false would close the sheet AND navigate back
});
```

## Sheet or dialog

| Bottom sheet | Centre dialog |
|--------------|---------------|
| a list of **actions** | a **decision** with consequences |
| dismissible by tapping away | deliberately interrupting |
| near the thumb | deliberately central |

A destructive confirmation in a bottom sheet is too easy to dismiss by accident — the opposite of
what it's for.

## When to reach for a library

`@gorhom/bottom-sheet` adds snap points, drag-to-dismiss with velocity, a scrollable body that hands
scroll back to the sheet, and keyboard-aware resizing. Build it yourself for a simple action sheet;
take the dependency the moment you want a draggable one.
