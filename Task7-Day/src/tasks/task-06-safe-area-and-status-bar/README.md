# Task 6 — Safe Area & Status Bar

> Sheet description: Handle notches, status bar colors, device padding, and platform-safe screen layout

## The hook, not the component

```jsx
const insets = useSafeAreaInsets();

<ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 96 }}>
```

`SafeAreaView` from `react-native` is **iOS-only and does nothing on Android**. The one from
`react-native-safe-area-context` works on both, but applies padding to a wrapper — which clips a
ScrollView's content at the top rather than letting it scroll under the notch.

Using the hook and applying insets to `contentContainerStyle` is what gives you content that scrolls
beneath the status bar while still starting below it.

## SafeAreaProvider has to be outermost

```jsx
<SafeAreaProvider>
  <NavigationContainer>…</NavigationContainer>
</SafeAreaProvider>
```

Without it, `useSafeAreaInsets` returns zeroes. The failure is **silent** — no warning, the layout
just sits under the notch, which makes it hard to attribute.

## The `edges` prop

```jsx
<SafeAreaView edges={["top", "left", "right"]}>
```

A screen above a tab bar shouldn't pad its bottom — the tab bar is already there. Padding both gives
you a visible dead strip.

## Status bar

```jsx
<StatusBar style="light" />   // LIGHT CONTENT on a dark background
```

The naming catches everyone: `style="light"` means light-coloured icons, so it's what you want on a
*dark* app. Getting it backwards makes the clock and battery nearly invisible.

## The Android-only trap

```js
StatusBar.currentHeight     // a number on Android, undefined on iOS
```

Arithmetic on `undefined` produces `NaN`, and a `NaN` padding is a silently broken layout on half
your users' devices. Use the insets instead.

## Testing it

An iPhone SE simulator has no notch; an iPhone 15 Pro does. A Pixel has a punch-hole camera and
gesture navigation. Testing on one device shape means shipping a layout that's wrong on the others —
this is the single most common "looks fine on my phone" bug.
