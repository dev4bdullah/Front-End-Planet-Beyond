# Task 6 — Props & Composition

> Sheet description: Pass primitives, objects, arrays, callbacks, children, and component variants through props

## What's demonstrated

| Pattern | Example on the page |
|---------|--------------------|
| Primitives with defaults | `Greeting` — `count = 0`, `isAdmin = false` |
| Objects and arrays | `PersonCard` — takes the whole `person` object plus a `tags` array |
| Callbacks | `onPing` — the child reports up, the parent decides what to do |
| `children` as a slot | `Panel` — same component holds a form or a list |
| Multiple slots | `Panel` also takes an `actions` prop |
| `children` as a function | `Toggle` — a render prop |
| Specialisation | `DangerButton` wraps `Button` |

## Default parameters, not defaultProps

```jsx
function Greeting({ name, count = 0, isAdmin = false }) { ... }
```

Plain JavaScript, works for function components, and `defaultProps` is deprecated for them anyway.

## `children` is the most useful prop

It's also the one people reach for last. A component that takes `children` never has to know what
goes inside it — which is exactly why it stays reusable. `Panel` on this page holds a form in one
instance and a list in the other, and knows about neither.

You can have more than one slot: `actions` is a second one.

## Render props vs custom hooks

`Toggle` passes a function as `children`. Custom hooks have largely replaced this pattern — task 8's
`useForm` does the same job more cleanly — but it's worth recognising in older code, and it's still
the cleanest way to share behaviour when the UI is genuinely unknown.

## Two rules

**Props are read-only.** Mutating an array or object you received changes the parent's data behind
its back. Copy first.

**A new object literal is a new reference every render.** `<Child config={{ a: 1 }} />` creates a
fresh object each time, so a `React.memo` child re-renders anyway. Task 11 profiles exactly this.

## Prop order when wrapping

```jsx
function DangerButton(props) {
  return <Button variant="danger" {...props} />;  // ✅ caller can override
}

function Broken(props) {
  return <Button {...props} variant="danger" />;  // ❌ caller never can
}
```

The spread has to come **after** the fixed prop.
