# Task 8 — Toast / Alert Feedback

> Sheet description: Use Alert or a toast pattern for success, warning, and error feedback

## What the platform gives you

```
Alert.alert(...)       ✅ both platforms, looks native on each
ToastAndroid.show(...) ⚠️  Android ONLY. No action button, no styling.
ActionSheetIOS         ⚠️  iOS only.
```

**There is no cross-platform toast in React Native.** It has to be built — which is what
`lib/ToastContext.jsx` is.

## Toast or Alert

| Alert | Toast |
|-------|-------|
| modal, blocking, needs a tap | passing, non-blocking, self-dismissing |
| destructive confirmations, anything irreversible | confirmations of things that already happened |

The test: if the user could reasonably keep working without reading it, it's a toast. If they must
decide something first, it's an Alert.

```js
Alert.alert("Delete?", "…", [
  { text: "Cancel", style: "cancel" },
  { text: "Delete", style: "destructive", onPress: remove }
]);
```

iOS renders `destructive` red and gives `cancel` the bold/Escape position. **Android ignores both**,
so button order has to carry the meaning too.

## Four decisions in this implementation

1. **Errors and anything with an action don't auto-dismiss** — no timer at all.
2. **The stack is capped** — a bulk action shouldn't produce twelve toasts.
3. **`pointerEvents="box-none"`** on the container, so the area around a toast stays tappable. A
   full-width overlay that eats touches is a real bug.
4. **`announceForAccessibility` + `accessibilityLiveRegion`** — a visual toast is completely
   invisible to a screen reader.

## Haptics carry the same signal

```js
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
```

A tap pattern reaches someone who isn't looking at the screen, and costs one line. The `.catch` is
needed because a device with no haptic engine rejects, and a failed vibration should never surface
as an error.

## Placement

Bottom, above the safe area. Top collides with the notch, and bottom is nearer the thumb — which
matters when the toast has an Undo button the user has a few seconds to reach.
