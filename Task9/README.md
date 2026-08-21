# Day 9 — Native Features & UX

Thirteen tasks, one Expo app. Each folder under `src/tasks/` is one row from the task sheet, named
after the task.

```
day9-native-features-ux/
├── package.json  app.json  babel.config.js  eslint.config.mjs  .prettierrc
├── index.js                      gesture-handler import, then registerRootComponent
├── scripts/check.mjs             the static verifier
└── src/
    ├── App.jsx                   the provider stack, in the order that matters
    ├── navigation/               RootNavigator (tabs), TasksNavigator
    ├── hooks/                    useApi, useAsyncStorage, useDebounce, useTheme,
    │                             useNetwork, useAppState
    ├── services/                 http wrapper + productService (from day 8)
    ├── theme/                    palettes, spacing, radius, type, shadows
    ├── shared/                   ui.jsx component kit, tasks.js registry
    └── tasks/
        ├── task-01-permissions-overview/          + lib/permissions.js
        ├── task-02-image-picker-camera/
        ├── task-03-profile-image-flow/
        ├── task-04-location-permission-optional/
        ├── task-05-keyboard-handling/
        ├── task-06-react-hook-form-in-rn/         + lib/ControlledInput.jsx
        ├── task-07-mobile-validation-ux/
        ├── task-08-toast-alert-feedback/          + lib/ToastContext.jsx
        ├── task-09-modal-bottom-sheet/            + lib/BottomSheet.jsx
        ├── task-10-app-lifecycle-basics/
        ├── task-11-offline-and-error-ux/
        ├── task-12-flatlist-performance/
        └── task-13-deliverable/                   + screens/ProfileScreen.jsx
```

## Run it

```bash
npm install --legacy-peer-deps
npx expo start
```

Then `a` for Android, `i` for iOS, or scan the QR with **Expo Go**.

Same peer-dependency situation as Day 8: reanimated 4.5.x declares a peer range stopping at RN 0.86
while Expo SDK 57 ships RN 0.87 and pairs them itself. `npx expo install` also works.

**A note on Expo Go:** the camera, photo library and location all work there, but the permission
prompt comes from the Expo Go app rather than yours, so the usage strings in `app.json` aren't the
ones shown. A development build is needed to see your own wording.

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
| 1 | Permissions Overview | Understand Android/iOS permission flow and implement clear permission request handling |
| 2 | Image Picker / Camera | Use an image picker or camera module to select a profile image from device media |
| 3 | Profile Image Flow | Preview selected image, allow replace/remove, and persist selected profile data locally |
| 4 | Location Permission Optional | Request location permission and show coordinates only if permission is granted |
| 5 | Keyboard Handling | Use KeyboardAvoidingView, ScrollView, input focus handling, and safe submit button placement |
| 6 | React Hook Form in RN | Build a profile form using react-hook-form with validation and controlled RN inputs |
| 7 | Mobile Validation UX | Show inline errors, disabled submit state, success message, and failed-save message |
| 8 | Toast / Alert Feedback | Use Alert or a toast pattern for success, warning, and error feedback |
| 9 | Modal / Bottom Sheet | Build a reusable modal or bottom-sheet style component for actions and confirmations |
| 10 | App Lifecycle Basics | Use AppState to understand foreground/background behavior for the screen |
| 11 | Offline & Error UX | Show offline/error fallback, retry actions, and safe UI when API/network fails |
| 12 | FlatList Performance | Optimize FlatList with initialNumToRender, windowSize, getItemLayout where appropriate, and memoized rows |
| 13 | Deliverable | Build a profile management app with image picker, permissions, validation, storage, modal, and offline/error UX |

## Three things worth doing on a device rather than reading

**Task 1** — deny the camera permission, then press Request again. On iOS nothing happens, because
the system will not ask twice. The screen detects that via `canAskAgain` and switches the button to
"Open Settings". That silent second refusal is the most common permissions bug there is.

**Task 10** — open the app switcher and watch the account balance blank out before the screenshot is
taken. Then come back and see `inactive` flash between `background` and `active` on iOS.

**Task 12** — toggle "Tuned" off and scroll fast. The untuned list sets `initialNumToRender` to 500,
so it mounts every row before the first paint.

## What was verified — and what wasn't

**Honest limitation: this app was never run on an emulator or a device.** A container has no Android
SDK, no JDK toolchain, no camera and no GPS. Nothing here is visually confirmed, and the native
features in tasks 1–4 in particular are the kind that can only really be tested on hardware.

What *was* checked, by `npm run check`:

- **36 files parsed** with Babel — no syntax errors
- **97 relative imports resolved**, with every named import verified to exist in its target
- **31 StyleSheet keys** cross-checked against their definitions
- **web-only APIs** scanned for: `document.`, `localStorage`, `className=`
- **HTML entities** scanned for — they render literally in React Native
- **3 permission requests cross-referenced against `app.json`** — new for Day 9

Plus `npx eslint .` clean and `prettier --check` clean.

### The permissions check

iOS **crashes** on a permission request with no usage description, and the crash names neither the
permission nor the missing key. So the verifier finds every `request*PermissionsAsync()` call in the
source and checks that `app.json` declares the matching `NSxxxUsageDescription` and Android
permission — and flags a usage string under 25 characters, since App Review rejects generic ones.

Tested by deleting `NSCameraUsageDescription`, shortening the location string to "Need location", and
removing `ACCESS_FINE_LOCATION`. It caught all three.

### The bug the verifier didn't catch

The deliverable's keyboard listeners were first written as:

```js
useState(() => {
  const showSub = Keyboard.addListener(...);
  return () => { showSub.remove(); };   // ← becomes the STATE, not a cleanup
});
```

It looks like it works, because `useState`'s initialiser does run once. But the returned function
becomes the state value rather than a cleanup, so the listeners are never removed — a leak on every
mount. ESLint passed it; reading the diff caught it. It's now `useEffect` with a proper dependency
array, and the comment in the file says why.

### Lint errors that were real

`react-hooks` rejected four ref-during-render patterns — `useRef(new Animated.Value(1)).current`,
callback refs assigned in a component body, and a `noteRef.current = fn` idiom. Each was rewritten
rather than suppressed: `useState`'s lazy initialiser for the Animated.Value, `useLayoutEffect` for
the callback refs, and `useCallback` for the logger.
