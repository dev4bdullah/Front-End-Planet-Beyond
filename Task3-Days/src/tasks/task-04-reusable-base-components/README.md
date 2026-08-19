# Task 4 — Reusable Base Components

> Sheet description: Build Button, Input, Card, Badge, Avatar, Loader, EmptyState, and ErrorState components

## The eleven components

`ui/` contains: **Button, Input, Textarea, Select, Card, Badge, Avatar, Spinner, Skeleton,
EmptyState, ErrorState** — plus an `index.js` barrel, so anywhere in the app can write
`import { Button, Card } from "@ui"`.

## The three rules they all follow

**1 · Variant and size are props, never separate components.**

```jsx
<Button variant="danger" size="sm" />
```

Not `ButtonDanger`, `ButtonSmall`, `ButtonDangerSmall`. That path is how a codebase ends up with
thirty near-identical files that all drift apart.

**2 · Spread the rest.**

```jsx
function Button({ children, variant, ...rest }) {
  return <button {...rest}>{children}</button>;
}
```

Now `onClick`, `aria-label`, `data-testid` and `onMouseEnter` all work without touching the
component. This is the rule that saves the most time — without it, every new need means editing
the component.

**3 · Children over configuration props.**

```jsx
<Card.Footer><Button /></Card.Footer>   // ✅ card knows nothing about buttons
<Card footerButtons={[...]} />          // ❌ card now owns button layout
```

## Accessibility built in, not bolted on

- `Input`, `Select` and `Textarea` use `useId()` so `htmlFor` and `aria-describedby` always match,
  even with several instances on one page
- Errors get `role="alert"` and `aria-invalid`
- `Spinner` carries `role="status"` with a label
- `Avatar` without an image renders initials with `role="img"` and an `aria-label`
- `Skeleton` is `aria-hidden` — a screen reader shouldn't announce placeholder boxes

## Spinner vs Skeleton

Use a **spinner** when you don't know the shape of what's coming. Use a **skeleton** when you do —
one that matches the layout stops the page jumping when the real content arrives.

## EmptyState vs ErrorState

Genuinely different states, deliberately separate components. "No results found" is a normal
outcome. "Request failed" means something broke. Merging them tells the user their data is missing
when it simply isn't there.
