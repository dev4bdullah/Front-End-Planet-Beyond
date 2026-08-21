# Task 10 — App Lifecycle Basics

> Sheet description: Use AppState to understand foreground/background behavior for the screen

## Four states, three that matter

```
active       on screen, receiving input
inactive     iOS ONLY — a call arriving, the app switcher, a notification banner
background   not visible
unknown      initial value on some platforms
```

Treating `inactive` as `background` makes an app pause every time a notification slides down. Users
notice.

## The transition, not the state

Almost nothing cares what the state **is**. Things care that it **changed**, and in which direction.

```js
const previous = useRef(AppState.currentState);

AppState.addEventListener("change", next => {
  const wasBackground = previous.current.match(/inactive|background/);
  if (wasBackground && next === "active") onForeground();
  previous.current = next;
});
```

Without the ref you can't tell background→active from inactive→active, and you'll refetch twice on
iOS every time.

## `subscription.remove()`, not `removeEventListener`

The old API was removed in RN 0.65. A lot of tutorials still show it, and it throws.

## What to do on each transition

| Transition | Do |
|------------|-----|
| → background | save drafts, pause timers and video, stop polling |
| → foreground | refetch time-sensitive data, **re-check permissions** |
| → background (sensitive) | blur the screen, so the app-switcher thumbnail doesn't leak it |
| → foreground (auth) | re-lock behind biometrics after a long absence |

The permissions one is easy to miss: a user can leave, revoke camera access in Settings, and come
back. Your cached "granted" is now a lie.

## AppState is not screen focus

```
AppState         the APP went to the background
useFocusEffect   this SCREEN was navigated away from (React Navigation)
```

A screen can be unfocused while the app is fully active.
