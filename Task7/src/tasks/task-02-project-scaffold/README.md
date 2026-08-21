# Task 2 — Project Scaffold

> Sheet description: Create a bare React Native app and verify it runs on emulator or physical device

## The entry point differs from the web

```js
// web
createRoot(document.getElementById("root")).render(<App />);

// React Native — there is no DOM node to mount into
import { registerRootComponent } from "expo";
registerRootComponent(App);
```

`registerRootComponent` wraps `AppRegistry.registerComponent`, which is the actual React Native API.
The native side asks the JS side for a component by name; there's no document, no root element.

## Files that matter

| File | Job |
|------|-----|
| `index.js` | registers the root component |
| `app.json` | app name, bundle ids, icons, splash, `newArchEnabled` |
| `babel.config.js` | `babel-preset-expo` — the JSX and Flow transform |
| `package.json` | the `expo start` scripts |

## Running it

```bash
npx expo start        # then:
#   a  → Android emulator or device
#   i  → iOS simulator
#   w  → web
#   r  → reload
#   j  → open the debugger
```

## When it won't start

```bash
npx expo start -c                   # clear the Metro cache — try this first
rm -rf node_modules && npm install  # after a dependency change
```

A surprising share of impossible React Native problems are a stale Metro cache. Ruling it out costs
thirty seconds and is worth doing before reading any stack trace.

## Bundle ids

`app.json` sets `com.dev4bdullah.day7` for both platforms. These have to be globally unique and are
painful to change after a store submission, so they're worth deciding once rather than leaving as
`com.anonymous.myapp`.
