# Task 1 — React Navigation Setup

> Sheet description: Install React Navigation and configure navigation container dependencies correctly

## Install

```bash
npx expo install \
  @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs @react-navigation/drawer \
  react-native-screens react-native-safe-area-context \
  react-native-gesture-handler react-native-reanimated
```

Use `npx expo install`, not `npm install`. It picks the version matching your Expo SDK; npm picks
the newest, which is frequently one the SDK doesn't support yet.

## The two lines people forget

Neither produces an error. The app builds, runs, and misbehaves in a way that points nowhere.

```js
// index.js — FIRST import, before anything touches React Native
import "react-native-gesture-handler";

// App.jsx
<SafeAreaProvider>
  <NavigationContainer>…</NavigationContainer>
</SafeAreaProvider>
```

Without the gesture-handler import the drawer ignores every swipe. Without `SafeAreaProvider`,
insets read as zero and headers sit under the notch.

## Reanimated v4 changed the setup

```js
// v2/v3 tutorials still say to add this:
plugins: ["react-native-reanimated/plugin"]   // ❌ now a duplicate-plugin error

// v4: babel-preset-expo already includes the worklets transform
presets: ["babel-preset-expo"]
```

v4 also splits the worklets runtime into `react-native-worklets`, which is why it appears in this
project's dependencies without being imported anywhere.

## The peer dependency conflict — honestly

`npm install` **fails** on this project without a flag:

```
peer react-native@"0.83 - 0.86" from react-native-reanimated@4.5.3
Found: react-native@0.87.0
```

Reanimated 4.5.x declares a peer range that stops at RN 0.86. Expo SDK 57 ships RN 0.87 and pairs it
with reanimated 4.5.1 in its own `bundledNativeModules.json` — so the declared range is narrower
than reality rather than a genuine incompatibility.

```bash
npm install --legacy-peer-deps    # or:
npx expo install                  # which resolves from Expo's list instead
```

This project pins the versions Expo lists. If the install fails on peer dependencies, that's why.
