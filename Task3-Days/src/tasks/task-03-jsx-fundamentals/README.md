# Task 3 — JSX Fundamentals

> Sheet description: Practice fragments, expressions, conditional rendering, dynamic class names, and reusable markup patterns

## What's on the page

| Section | Covers |
|---------|--------|
| Expressions | anything in `{}` that evaluates to a value |
| Fragments | `<>` and `<React.Fragment key>` |
| Conditional rendering | ternary, `&&`, early return |
| Dynamic class names | the `cx()` helper |
| Reusable markup | extracting a component, and why it goes outside the parent |
| Attribute gotchas | `className`, `htmlFor`, `onClick`, `style` |

## Three things worth remembering

**The `0` trap.** `{items.length && <List />}` renders a literal `0` on the page when the array is
empty. React skips `false`, `null` and `undefined` but happily prints `0`. Write
`{items.length > 0 && <List />}`.

**Never define a component inside another component.** A function declared inside the render body
has a new identity every render, so React sees a brand-new component type, unmounts the old one and
mounts a fresh one — losing all its state, its focus and its scroll position. Define it at module
level.

**Braces hold expressions, not statements.** `if`, `for` and `switch` don't work inside JSX. That's
the entire reason conditionals use ternaries and `&&` instead.

## Why `cx()` instead of a template string

```js
export const cx = (...classes) => classes.filter(Boolean).join(" ");
```

Falsy values drop out. Without it, `` `btn ${isActive ? "btn--active" : ""}` `` leaves a trailing
space, and `` `btn ${isActive && "btn--active"}` `` puts the literal word `false` in your class
attribute when the condition fails.
