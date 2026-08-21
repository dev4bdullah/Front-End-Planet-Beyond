# Task 13 — Deliverable

> Sheet description: Build a profile management app with image picker, permissions, validation, storage, modal, and offline/error UX

Open the **Profile** tab.

## What it does

- Tap the avatar → a bottom sheet offering library, camera or remove
- Removing asks for confirmation, then offers an undo before the file is deleted
- The form validates on blur, with react-hook-form through `ControlledInput`
- "Use my location" fills the location field, and typing it works just as well
- The save bar sits **above the keyboard**, so it's reachable while typing
- Everything persists to AsyncStorage; the photo goes to the filesystem
- Saving while offline keeps every value and says so

## Where each task shows up

| Task | Used here as |
|------|--------------|
| 1 Permissions | rationale, `canAskAgain`, Settings fallback |
| 2 Image picker | library and camera, each with its own permission |
| 3 Profile image | copied to `documentDirectory`, timestamped, `onError` guarded |
| 4 Location | optional — the field is typeable without it |
| 5 Keyboard | `KeyboardAvoidingView`, ref chaining, save bar above the keyboard |
| 6 React Hook Form | every field through `ControlledInput` |
| 7 Validation UX | inline errors, focus on first error, failed-save keeps data |
| 8 Toast | every action confirms, deletion offers undo |
| 9 Modal / sheet | the photo sheet and the removal confirmation |
| 10 App lifecycle | returning with unsaved changes says so |
| 11 Offline | a banner, and saving is blocked with the data intact |

## One bug worth recording

The keyboard listeners were first written inside `useState(() => {...})` instead of `useEffect`.
That **looks** like it works — the initialiser runs once — but its return value becomes the state
rather than a cleanup, so the listeners are never removed. ESLint didn't catch it; reading the diff
did.

## The undo window

Removing the photo clears it from state immediately and offers an undo, but only deletes the file
after eight seconds. Deleting first would make the undo a lie.
