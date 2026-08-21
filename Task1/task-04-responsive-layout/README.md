# Task 4 — Responsive Layout

> Sheet description: Implement 12-column CSS Grid with Flexbox fallback and breakpoints at 576/768/1024px

## Run it

Right-click `index.html` → **Open with Live Server**, then press `Ctrl+Shift+M` for the
device toolbar and drag the width. The purple badge at the top names the active breakpoint,
in pure CSS — no JavaScript.

## What it demonstrates

**The grid.** One track definition, `grid-template-columns: repeat(12, minmax(0, 1fr))`, with
children claiming spans through `.col-3` / `.col-4` / `.col-6` / `.col-8` / `.col-12`.
`minmax(0, 1fr)` rather than plain `1fr` — a long unbroken word can otherwise force a column
wider than its share.

**Named areas.** The page shell uses `grid-template-areas`, so re-ordering at a breakpoint is
one line of CSS and zero HTML changes.

**Flexbox where it fits.** Grid is two-dimensional; a single wrapping row is not. The header nav,
the toolbar and the card row are all Flexbox. `flex: 1 1 220px` makes the cards wrap at their own
natural point, with no media query at all.

## The breakpoints

| Query | Target | Grid columns | Page shell |
|-------|--------|--------------|------------|
| base, no query | under 576px | 1 | fully stacked |
| `min-width: 576px` | large phones | 4 | still stacked |
| `min-width: 768px` | tablets | 6 | sidebar moves beside main |
| `min-width: 1024px` | laptops+ | 12 | nav / main / aside in one row |

Mobile-first with `min-width`, so the smallest screen loads the simplest CSS and never has to
undo desktop rules. Writing it the other way round with `max-width` means every phone pays for
styles it immediately overrides.

## Worth noticing

The `--gap` custom property is redefined inside each media query, so spacing scales with the
breakpoint from a single line rather than repeated `gap` declarations. Task 5 takes that idea
further and removes most of these queries with `clamp()`.
