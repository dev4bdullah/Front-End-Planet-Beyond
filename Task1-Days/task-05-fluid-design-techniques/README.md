# Task 5 — Fluid Design Techniques

> Sheet description: Use CSS variables and calc()/min()/max()/clamp() for fluid spacing & typography

## Run it

Right-click `index.html` → **Open with Live Server**, then resize the window slowly.
Nothing jumps — everything moves continuously.

## The one thing to notice

`style.css` contains **zero media queries** apart from `prefers-reduced-motion`. Task 4 needed
three breakpoints to change type and spacing. This page does the same job with none.

## What each function is for

| Function | Reads as | Used here for |
|----------|----------|---------------|
| `clamp(min, preferred, max)` | "this size, but never outside these bounds" | every font size and every spacing step |
| `min(a, b)` | picks the smaller → sets a **maximum** | `width: min(100%, 60ch)` for readable line length |
| `max(a, b)` | picks the larger → sets a **minimum** | `padding-inline: max(1rem, 4vw)` so phones keep breathing room |
| `calc()` | mixes units that can't otherwise meet | `calc(50% - var(--space-sm) / 2)`, deriving one variable from another |

## Two rules worth memorising

**Always keep a `rem` term in the middle of `clamp()`.** `clamp(1rem, 2vw, 2rem)` looks fine but
ignores browser zoom — a user who zooms to 200% gets no change in font size. `clamp(1rem, 0.9rem + 0.6vw, 2rem)`
scales with both the viewport *and* the user's setting.

**Spaces around `calc()` operators are mandatory.** `calc(100%-2rem)` is invalid and the browser
silently drops the entire declaration. `calc(100% - 2rem)` works.

## Why custom properties, not Sass variables

Sass variables are compiled away before the browser sees them. CSS custom properties are live —
they can be read inside `calc()` at runtime, overridden per-component, changed by a media query,
or swapped for a dark theme with a single class. That's why `--space-md` here is
`calc(var(--space-sm) * 1.5)`: change one value and the whole scale stays proportional.

## Where breakpoints still belong

Fluid values handle **size**. Media queries handle **structure** — a sidebar moving beside the
content, a nav collapsing into a menu. Task 4 does the structural half; this task does the sizing
half. The portfolio page in task 6 uses both together.
