# Day 7 — React Native Basics

Twelve tasks, one Expo app. Each folder under `src/tasks/` is one row from the task sheet, named
after the task.

```
day7-react-native-basics/
├── package.json  app.json  babel.config.js  eslint.config.mjs  .prettierrc
├── index.js                      registerRootComponent
├── scripts/check.mjs             the static verifier
└── src/
    ├── App.jsx                   SafeAreaProvider → NavigationContainer
    ├── navigation/               RootNavigator (tabs), TasksNavigator (stack)
    ├── theme/                    colors, spacing, radius, type, shadows
    ├── data/                     sample products and profile
    ├── shared/                   ui.jsx component kit, tasks.js registry
    └── tasks/
        ├── task-01-react-native-environment-setup/
        ├── task-02-project-scaffold/
        ├── task-03-mobile-folder-structure/
        ├── task-04-core-components/
        ├── task-05-stylesheet-and-flexbox/
        ├── task-06-safe-area-and-status-bar/
        ├── task-07-platform-handling/
        ├── task-08-images/
        ├── task-09-flatlist-practice/
        ├── task-10-mobile-forms/
        ├── task-11-react-native-debugging/
        └── task-12-deliverable/     + screens/ (4) + components/
```

## Run it

```bash
npm install
npx expo start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with **Expo Go** on a physical device.

The app opens on two tabs: **Tasks** (eleven explainer screens) and **App** (the task 12
deliverable).

## Requirements

- Node 20 LTS or newer
- **JDK 17** for Android — React Native 0.87 requires it specifically, not 11 or 21
- Android Studio for an emulator, or Expo Go on a real device
- Xcode for the iOS simulator (macOS only)

Task 1's screen reads the actual runtime values, so it will tell you what your environment reports
rather than what the docs assume.

## Scripts

| Command | Does |
|---------|------|
| `npm start` | Expo dev server |
| `npm run android` / `ios` | start and open that platform |
| `npm run check` | the static verifier (see below) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## The tasks

| # | Task title (as in the sheet) | Sheet description |
|---|------------------------------|-------------------|
| 1 | React Native Environment Setup | Install Node, JDK, Android Studio, emulator/device setup, and Xcode CLI tools where applicable |
| 2 | Project Scaffold | Create a bare React Native app and verify it runs on emulator or physical device |
| 3 | Mobile Folder Structure | Create components, screens, navigation, hooks, services, utils, constants, and assets folders |
| 4 | Core Components | Build screens using View, Text, Image, ScrollView, FlatList, Pressable, TouchableOpacity, and TextInput |
| 5 | StyleSheet & Flexbox | Use StyleSheet.create, Flexbox, spacing tokens, typography, shadows, and responsive sizing |
| 6 | Safe Area & Status Bar | Handle notches, status bar colors, device padding, and platform-safe screen layout |
| 7 | Platform Handling | Use Platform.select for small iOS/Android styling or behavior differences |
| 8 | Images | Render local assets, remote images, placeholders, and fallback UI for failed image loads |
| 9 | FlatList Practice | Render large lists using keyExtractor, ListEmptyComponent, ListHeaderComponent, and ItemSeparatorComponent |
| 10 | Mobile Forms | Build login/profile forms with TextInput, validation messages, and disabled submit states |
| 11 | React Native Debugging | Use Metro logs, React DevTools, emulator logs, and basic error tracing |
| 12 | Deliverable | Build a polished 4-screen static mobile app with Home, Listing, Details, and Profile screens |

## Three things worth doing on a device rather than reading

**Task 5** — the flexbox playground. Change `flexDirection`, `justifyContent` and `alignItems` with
live buttons. `flexDirection` defaults to `column` in React Native, and half of "why is my row
stacked vertically" is that one difference.

**Task 6** — rotate the device, or run it on a phone with a notch and one without. The screen prints
your actual `useSafeAreaInsets` values, which is the fastest way to understand why `SafeAreaView`
from `react-native` isn't the right tool.

**Task 9** — scroll the 240-row list, then read the notes route. The list and its prose are
deliberately separate screens, because nesting a FlatList inside a ScrollView is one of the things
the task is about.

## What was verified — and what wasn't

**Honest limitation: this app was never run on an emulator or a device.** A container has no
Android SDK, no JDK toolchain and no device, so nothing here can claim to be visually confirmed.

What *was* checked, by `npm run check`:

- **26 files parsed** with Babel (JSX plugin) — no syntax errors
- **66 relative imports resolved** to files that exist, and every named import verified to be
  exported by its target module
- **118 StyleSheet keys** cross-checked — every `s.something` referenced is defined in a
  `StyleSheet.create` call
- **web-only APIs** scanned for: `document.`, `localStorage`, `className=`
- **HTML entities** scanned for (see below)

Plus `npx eslint .` — zero errors, zero warnings — and `prettier --check` clean.

The verifier was itself tested by deliberately breaking three things (an unresolvable import, a
non-existent named export, and a typo'd style key) and confirming it reported all three and exited
non-zero.

### The bug this found

I wrote `&apos;` in JSX text across eight files, out of web habit. **React Native has no HTML parser
— `<Text>` renders the string verbatim**, so every one of those would have displayed as the five
literal characters `&apos;` on a device. 21 entities in total.

ESLint actually flagged two of them, via `react/no-unescaped-entities` — but that rule is a web rule
and its *suggested fix is to add more entities*, which would have made it worse. The rule is now
disabled with a comment explaining why, and the verifier checks for entities directly instead.

That check exists because I made the mistake, not because I anticipated it.
