# Task 1 — Tailwind Dashboard Setup

> Sheet description: Install and configure Tailwind CSS in the React project with clean design tokens

## The v4 difference

Tailwind v4 ships as a Vite plugin and is configured **in CSS**. There is no `tailwind.config.js`
and no `postcss.config.js` — the first thing that trips people following older tutorials.

```bash
npm install -D tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
plugins: [react(), tailwindcss()]
```

```css
/* src/styles/index.css */
@import "tailwindcss";
```

## Tokens generate utilities

Every custom property in `@theme` becomes a utility class. `--color-brand-600` generates
`bg-brand-600`, `text-brand-600`, `border-brand-600`, `ring-brand-600` and the rest — you don't
list them.

## Surfaces named by role, not shade

```css
--color-surface: #ffffff;    /* cards, modals, the topbar */
--color-sunk: #f1f3f9;       /* wells, table headers, inputs */
--color-hairline: #e3e7ef;   /* every border */
```

`bg-surface` reads better than `bg-white dark:bg-slate-900` repeated in forty components, and
changing the value is one edit rather than forty.

## Dark mode as a class

```css
@custom-variant dark (&:where(.dark, .dark *));
```

This redefines what `dark:` means. Pointing it at a class rather than `prefers-color-scheme` is what
lets the topbar toggle override the operating system. The shell writes the class onto `<html>` and
persists the choice to localStorage.

## Two custom utilities

`@utility` earns its place when a pattern would otherwise be a long arbitrary-value class repeated
in ten files. Two qualify here — `scrollbar-slim` and `shimmer` (used by every skeleton in tasks 4,
5 and 10). Everything else stays as plain utilities.

## Keeping class lists readable

`prettier-plugin-tailwindcss` sorts every class list on save, which keeps diffs small. And variants
live in lookup objects rather than ternaries inside `className` — see task 3.
