# Task 3 — Semantic Markup

> Sheet description: Build header, nav, main, aside, footer with proper ARIA roles

## Run it

Right-click `index.html` → **Open with Live Server**.

## What it demonstrates

| Element | Landmark role it carries | Used for |
|---------|--------------------------|----------|
| `header` | banner | site title and primary nav |
| `nav` | navigation | two of them, each with its own `aria-label` |
| `main` | main | the page's unique content, one per document |
| `section` | region (when labelled) | three thematic blocks, each labelled by its heading |
| `article` | article | self-contained content inside a section |
| `aside` | complementary | the quick-reference sidebar |
| `footer` | contentinfo | closing links |

Also in the page: a skip link, `figure` + `figcaption`, a `table` with `caption` and
`scope` attributes, a description list, and `details` / `summary` for native disclosure
behaviour with no JavaScript.

## ARIA used, and why

- `aria-label` on both `nav` elements — otherwise a screen reader announces two identical
  "navigation" landmarks with no way to tell them apart
- `aria-labelledby` on each `section` — reuses the visible heading rather than duplicating text
- `aria-current="page"` on the active nav link
- `aria-hidden="true"` on the decorative arrow
- `alt=""` is deliberate on decorative images; a *missing* alt is a bug, an empty one is a decision

Roles like `role="banner"` are **not** written out, because `header` already carries that role.
Adding it is redundant and marks you as pattern-matching rather than understanding.

## Checking your work

1. Tab from the address bar — the skip link appears first, focus outlines are visible throughout
2. DevTools → Elements → **Accessibility** pane — read the computed tree
3. Lighthouse → Accessibility, or the axe DevTools extension
4. Disable CSS completely — the page should still read top to bottom in a sensible order
