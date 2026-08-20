# Task 11 — Framer Motion

> Sheet description: Add page transitions, modal transitions, hover animations, and subtle dashboard micro-interactions

## What's on the page

| Demo | Technique |
|------|-----------|
| KPI cards appearing | `staggerChildren`, parent orchestrates |
| Numbers counting up | `requestAnimationFrame` with easeOutCubic |
| Modal | `AnimatePresence` for the exit |
| Panel swap | `AnimatePresence mode="wait"` keyed on the panel id |
| List add/remove | `layout` prop so neighbours slide rather than snap |
| Hover and tap | `whileHover` / `whileTap` with a spring |

## `AnimatePresence` is the one to understand

React unmounts a component the instant its condition goes false, so an exit animation has nothing to
play on. `AnimatePresence` keeps it mounted long enough. Without it a modal vanishes instantly on
close — the single most common motion bug in React.

**Watch the close, not the open.** That's what it buys you.

`mode="wait"` makes the outgoing element finish before the incoming one starts. Without it they
overlap and the container height jumps.

## Animating text

CSS can't transition text content, so `CountUp` interpolates state with `requestAnimationFrame` and
cancels the frame on unmount. Without that cleanup, a component that unmounts mid-count keeps calling
`setState` on an unmounted tree.

## Three rules

**1 · Respect the OS setting.** Non-negotiable. Every component here calls `useReducedMotion()` and
passes `initial={false}` when it returns true. Turn reduced motion on in your OS and the page shows a
banner explaining that animations are disabled — that's correct behaviour, not a broken page.

**2 · Animate transform and opacity.** Both are GPU-composited. Animating `width`, `height`, `top` or
`left` forces layout on every frame.

The list removal is an honest exception — it animates `height`, because no transform collapses a row
and reflows its neighbours. Framer's `layout` prop makes that as cheap as it can be.

**3 · Keep it short.** 150–300ms for UI. Anything over 400ms feels sluggish on the fiftieth use,
however good it looked on the first.

## Where a route transition belongs

In the shell, wrapping `<Outlet />` — not in each page. One wrapper gives all thirteen routes the
same entrance without any of them importing framer-motion.
