# Task 10 — Styling Strategy

> Sheet description: Use one consistent styling approach: CSS Modules, plain CSS utilities, or Tailwind CSS

## The choice

**Plain CSS + custom properties + BEM naming**, in one file: `src/styles/index.css`.

Every option works. What doesn't work is using three of them in the same codebase — which is what
happens by accident when nobody decides up front.

| Approach | Good at | Costs |
|----------|---------|-------|
| Plain CSS + custom properties | no build step, themes for free, transferable | naming discipline is on you |
| CSS Modules | scoped by default, no collisions | a file per component, awkward for global themes |
| Tailwind | fast to write, no naming, tiny output | dense markup, build step, learning curve |
| CSS-in-JS | props drive styles directly | runtime cost, fights RSC |

## Why plain CSS was chosen here

The dark theme. It's one class overriding seven variables:

```css
.theme-dark {
  --bg: #0e1015;
  --surface: #181c25;
  --fg: #e6e8ee;
  --line: #29303e;
}
```

Flip the switch on the page and every component on every task changes at once — not one of them
contains a colour value. In CSS Modules or CSS-in-JS the same feature needs a theme provider and
prop threading.

## Design tokens

Everything is declared once on `:root`. Nothing in this project uses a raw hex value or a magic
pixel number. Larger spacing steps derive from the base with `calc()`, so the whole scale stays
proportional when you change one number.

## BEM

```
.card             block    — a standalone thing
.card__title      element  — a part of the block
.card--raised     modifier — a variation
```

The point isn't the syntax. It's that **every selector is a single class**, so specificity is
always `0,1,0` and nothing ever needs nesting or `!important` to win a fight.

## Rules this stylesheet holds to

- Every selector is one class — no ids, no element selectors, no nesting
- Not one `!important` in ~1,000 lines
- No hard-coded colours outside `:root`
- Spacing comes from the scale, never arbitrary pixels
- `prefers-reduced-motion` disables every animation at the bottom of the file

## The `className` escape hatch

Every component accepts a `className` prop and appends it last:

```jsx
className={cx("btn", variant && `btn--${variant}`, className)}
```

So a caller can add a one-off tweak without the component needing a new prop.
