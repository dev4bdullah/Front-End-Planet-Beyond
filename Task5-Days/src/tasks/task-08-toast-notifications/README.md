# Task 8 — Toast Notifications

> Sheet description: Create success, error, warning, and info notifications through a ToastContext

```jsx
const { toast } = useToast();

toast.success("Product created.");
toast.error("Could not reach the server.", { sticky: true });
toast.warning("Record deleted.", { actionLabel: "Undo", onAction: restore });
toast.info("Draft saved locally.");
```

## Four decisions in the implementation

**Errors don't auto-dismiss.** The user may not have been looking. Successes do.

**Hover pauses the timer**, so a toast can't vanish mid-read.

**The stack is capped at four.** Twenty toasts from a bulk action is unusable — the page has a
button that fires eight and keeps the last four.

**Each toast clears its own timer on unmount**, so dismissing by hand doesn't leave a timer firing
into nothing.

## The memo that matters

The provider re-renders on every toast. Without `useMemo` on the context value, every consumer in
the app re-renders too — for a notification that has nothing to do with them.

Note what's **not** in the value: the toast list. Consumers only raise toasts, never read them, so
the list stays local to the provider.

## Why context rather than props

A toast is raised from wherever the action happened — a modal, a table row, a hook three layers
down. Threading a callback to all of those is the exact problem context exists for.

The provider renders the viewport itself, so no page has to remember a `<Toaster />` — a step
that's easy to forget and produces a silently broken feature.

## Accessibility

`aria-live="polite"` — announced after the current sentence, not interrupting it. `assertive` would
be wrong for a save confirmation. The dismiss button has an `aria-label`, since `×` alone reads as
"times".
