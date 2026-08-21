# Task 3 — Reusable UI System

> Sheet description: Create consistent variants for buttons, cards, badges, inputs, tables, and empty states

## The nine components

`ui/` contains **Button, Card, Badge, Input, Select, Table, Skeleton, EmptyState, Avatar**, plus an
`index.js` barrel so anywhere can write `import { Button, Card } from "@ui"`.

## Three rules

**1 · Variants and sizes are lookup objects.**

```js
const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  danger:  "bg-danger-600 text-white hover:bg-danger-700"
};

className={cx("base", VARIANTS[variant], SIZES[size])}
```

Adding a variant is one line. Chaining ternaries inside `className` is what makes a component
impossible to extend.

**2 · Spread the rest.**

```jsx
function Button({ children, variant, ...rest }) {
  return <button {...rest}>{children}</button>;
}
```

`onClick`, `aria-label`, `data-testid` all work without touching the component.

**3 · `className` is appended last.** For Tailwind this is not cosmetic — later classes win for
equal specificity, so appending the caller's class last is what makes an override actually take
effect.

## Accessibility built in

- `Input` and `Select` use `useId()`, so `htmlFor`, `aria-describedby` and the error id always match
  even with several instances on a page
- The error replaces the hint rather than stacking below it
- `Skeleton` is `aria-hidden` — a screen reader shouldn't announce placeholder boxes
- `Avatar` without an image renders initials with `role="img"` and an `aria-label`

`Input.test.jsx` uses `getByLabelText`, which only passes if the label and input are genuinely
associated — so an accessibility bug fails a test rather than shipping quietly.

## Table stays dumb

These primitives are presentation only. Sorting, filtering and pagination belong to task 5's
`DataTable`, which composes them. Keeping them logic-free is what lets any table reuse them.

## Avatar colours without storing one

```js
const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
className={PALETTE[hash % PALETTE.length]}
```

The same person is always the same colour, with nothing persisted.
