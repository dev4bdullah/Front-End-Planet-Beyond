# Task 5 — Interactive Components

> Sheet description: Build Modal, Tabs, Accordion, Dropdown, and Toast components with reusable props

## The six

Modal, Tabs, Accordion, Dropdown, Toast, Switch — in `ui/`, aliased to `@interactive`.

## The hard part isn't the visuals

**Modal** — Escape closes, focus moves inside on open and returns to the trigger on close, Tab
wraps instead of escaping to the page behind, body scroll locks, and it renders through
`createPortal` so no ancestor's `overflow: hidden` can clip it. The focus trap is the part most
hand-rolled modals skip, and it's the part that makes a modal unusable with a keyboard.

**Tabs** — arrow keys move between tabs, and only the active tab is in the tab order
(`tabIndex={-1}` on the rest). That's what the ARIA tabs pattern specifies: Tab jumps past the
group to the panel, arrows move within it.

**Dropdown** — the outside-click listener is added on open and **removed in the effect cleanup**.
Leave that out and every dropdown you ever open leaves a listener on `document` forever.

**Toast** — each toast clears its own timer on unmount. Dismiss one by hand and the timer must not
fire afterwards.

**Switch** — wraps a real `<input type="checkbox">` rather than styling a div. Keyboard support,
form participation and screen-reader semantics all come free. A styled div needs `role`,
`tabIndex`, `aria-checked` and a keydown handler to get halfway there.

## Controlled or uncontrolled

`Tabs` works both ways:

```jsx
<Tabs items={items} />                          // owns its state
<Tabs items={items} value={id} onChange={set} /> // you own it
```

The pattern is `const active = value ?? internal` — use the prop if given, fall back to internal
state. Every serious component library does this.

## One prop, two behaviours

`Accordion` takes `allowMultiple`. Internally that switches the open state between a `Set` seeded
with the previous values and a `Set` seeded empty — one line, and the same component covers both an
FAQ and an exclusive-panel sidebar.
