# Task 11 — React Native Debugging

> Sheet description: Use Metro logs, React DevTools, emulator logs, and basic error tracing

## Decide which layer is broken first

```
Your JS          → Metro terminal, console.log, React DevTools
React tree       → React DevTools (props, state, re-renders)
The bridge       → red screen, or a native module that's undefined
Native (Android) → adb logcat
Native (iOS)     → Xcode console
```

Rule of thumb: **renders then behaves wrongly → JS. Never renders, or dies on launch → native.**

## The dev menu

Shake the device, `Cmd+D` on the iOS simulator, `Cmd+M`/`Ctrl+M` on Android.

- **Toggle element inspector** — tap any view for its box model, styles and position in the tree.
  The closest thing to browser DevTools you get.
- **Performance monitor** — two FPS counters, and which one drops tells you the kind of problem:

```
JS low, UI fine  → slow JavaScript (expensive render, unmemoised list row)
UI low           → the native side (too many views, big images, Android shadows)
Both low         → usually a huge list rendered without windowing
```

## Metro

```js
console.log(JSON.stringify(obj, null, 2));   // plain log prints [Object]
console.table(products);
```

## React DevTools

```bash
npx react-devtools
```

"Highlight updates when components render" is the fastest way to find a missing `memo`. If a whole
list flashes when one row changes, the row isn't memoised.

## Native logs

```bash
adb logcat *:S ReactNative:V ReactNativeJS:V     # filtered — the useful form
npx react-native log-ios
```

Unfiltered `adb logcat` is a firehose from the entire device.

## Four errors worth recognising

| Message | Usual cause |
|---------|-------------|
| `Unable to resolve module ./Foo` | wrong path, or a stale Metro cache |
| `undefined is not an object (evaluating 'x.y')` | something async hasn't arrived — guard it |
| `Objects are not valid as a React child` | rendered `{item}` instead of `{item.name}` |
| `Text strings must be rendered within a <Text>` | a bare string inside a `<View>` |

## LogBox

Red is a thrown error, yellow is a warning, and both are **development only** — in production the
app just closes, which is what error boundaries and a crash reporter are for.

`LogBox.ignoreAllLogs()` exists. Using it means you stop seeing the warning that would have
explained your next bug.

## Clear the cache before believing anything

```bash
npx expo start -c
```
