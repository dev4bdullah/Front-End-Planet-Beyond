# Day 8 — React Navigation & APIs

Thirteen tasks, one Expo app. Each folder under `src/tasks/` is one row from the task sheet, named
after the task.

```
day8-react-navigation-apis/
├── package.json  app.json  babel.config.js  eslint.config.mjs  .prettierrc
├── index.js                      gesture-handler import, then registerRootComponent
├── scripts/check.mjs             the static verifier
└── src/
    ├── App.jsx                   the provider stack, in the order that matters
    ├── navigation/               RootNavigator (drawer), TasksNavigator, linking config
    ├── services/                 http wrapper + productService
    ├── hooks/                    useApi, useAsyncStorage, useDebounce, useTheme, useFavorites
    ├── theme/                    palettes, spacing, radius, type, shadows
    ├── data/                     local fallback data
    ├── shared/                   ui.jsx component kit, tasks.js registry
    └── tasks/
        ├── task-01-react-navigation-setup/
        ├── task-02-stack-navigation/
        ├── task-03-bottom-tabs/
        ├── task-04-drawer-navigation/
        ├── task-05-route-params/
        ├── task-06-deep-linking/
        ├── task-07-mobile-api-service/
        ├── task-08-api-data-screens/
        ├── task-09-pull-to-refresh/
        ├── task-10-asyncstorage-persistence/
        ├── task-11-mobile-custom-hooks/
        ├── task-12-search-and-favorites/
        └── task-13-deliverable/     + screens/ (5) + components/
```

## Run it

```bash
npm install --legacy-peer-deps    # see "the peer conflict" below
npx expo start
```

Then `a` for Android, `i` for iOS, or scan the QR with **Expo Go**.

Open the drawer (swipe from the left edge) to switch between **Shop** — the deliverable — and
**Task screens**.

## The peer conflict, up front

Plain `npm install` **fails** on this project:

```
peer react-native@"0.83 - 0.86" from react-native-reanimated@4.5.3
Found: react-native@0.87.0
```

Reanimated 4.5.x declares a peer range stopping at RN 0.86. Expo SDK 57 ships RN 0.87 and pairs it
with reanimated 4.5.1 in its own `bundledNativeModules.json`, so the declared range is narrower than
reality rather than a genuine incompatibility. This project pins the versions Expo lists.

Use `--legacy-peer-deps`, or `npx expo install`, which resolves from Expo's list instead.

## Scripts

| Command | Does |
|---------|------|
| `npm start` | Expo dev server |
| `npm run android` / `ios` | start and open that platform |
| `npm run check` | the static verifier |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## The tasks

| # | Task title (as in the sheet) | Sheet description |
|---|------------------------------|-------------------|
| 1 | React Navigation Setup | Install React Navigation and configure navigation container dependencies correctly |
| 2 | Stack Navigation | Create stack flow for Home, Listing, Details, Auth, and Settings screens |
| 3 | Bottom Tabs | Add tab navigation for Home, Search, Favorites, and Profile screens |
| 4 | Drawer Navigation | Add drawer navigation for Settings, Help, About, and Logout actions |
| 5 | Route Params | Pass item IDs/data to details screens and safely handle missing params |
| 6 | Deep Linking | Configure a simple deep link that opens a selected details screen |
| 7 | Mobile API Service | Create reusable API service functions with timeout, error normalization, and retry helper |
| 8 | API Data Screens | Fetch list and detail data with loading, success, error, empty, and refresh states |
| 9 | Pull To Refresh | Implement RefreshControl and reload data without breaking current screen state |
| 10 | AsyncStorage Persistence | Save theme, onboarding flag, favorites, and small profile preferences |
| 11 | Mobile Custom Hooks | Create useApi, useAsyncStorage, useTheme, and useDebounce hooks |
| 12 | Search & Favorites | Add debounced search, favorite/unfavorite actions, and persistent favorites list |
| 13 | Deliverable | Build an API-driven React Native listing app with Stack, Tabs, Drawer, details, search, favorites, and storage |

## Three things worth doing on a device rather than reading

**Task 2** — press "push a copy" three times, then walk back. Three identical screens in the
history. That's the difference between `navigate` and `push`, which no amount of prose makes as
clear.

**Task 6** — tap `day8://product/4`, then force-quit the app and open the same link again. Both
paths land on the product, but they go through completely different APIs (`addEventListener` vs
`getInitialURL`). Handling only the first is the usual bug.

**Task 9** — pull the list down. The rows never leave the screen. Then compare with what a single
`loading` flag would do: skeletons replacing the data the user is currently looking at.

## What was verified — and what wasn't

**Honest limitation: this app was never run on an emulator or a device.** A container has no Android
SDK, no JDK toolchain and no device, so nothing here is visually confirmed.

What *was* checked, by `npm run check`:

- **40 files parsed** with Babel — no syntax errors
- **117 relative imports resolved**, with every named import verified to exist in its target module
- **35 StyleSheet keys** cross-checked against their `StyleSheet.create` definitions
- **web-only APIs** scanned for: `document.`, `localStorage`, `className=`
- **HTML entities** scanned for — they render literally in React Native
- **11 deep-link routes matched against 14 registered screens** — new for Day 8

Plus `npx eslint .` clean and `prettier --check` clean.

### The deep-link check exists because that failure is silent

If `linking.js` names a route the navigator doesn't have, React Navigation doesn't error — the link
just opens the app's default screen. So the verifier collects every `<X.Screen name="…">` in the
project and every route name in the linking config, and fails if the second isn't a subset of the
first. I tested it by renaming `SearchTab` to `SearchTabb`; it caught it and exited non-zero.

### Two lint errors that changed the code for the better

ESLint's newer `react-hooks` rules rejected the first version of `useApi`:

- **"Cannot access refs during render"** — `fetcherRef.current = fetcher` was a bare assignment in
  the component body. Now written from a `useLayoutEffect`, which still runs before the fetching
  effect reads it.
- **"Calling setState synchronously within an effect"** — the hook stored `loading` and flipped it
  in the effect. `loading` is now **derived** from whether the settled result matches the current
  dependency key. One less piece of state, and the spread-element dependency warning disappeared
  with it.

Both were real problems, not lint noise, and the rewritten hook is simpler than the original.

The Day 7 entity habit resurfaced too — 31 `&apos;` and `&amp;` sequences across the new files,
caught by the same check that was added after making the mistake the first time.
