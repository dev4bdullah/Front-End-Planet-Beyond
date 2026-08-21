# Task 5 — Reusable Utility Functions

> Sheet description: Create helpers for IDs, date formatting, status labels, search normalization, and sorting

## Run it

Right-click `index.html` → **Open with Live Server**. Every helper is called and printed, so the
page doubles as a test sheet.

## What's in `utils.js`

| Group | Functions |
|-------|-----------|
| ids | `makeId`, `slugify` |
| dates | `formatDate`, `relativeTime`, `daysFromNow`, `isOverdue` |
| labels | `statusLabel`, `titleCase`, `truncate`, `pluralise` |
| search | `normalise`, `matchesSearch` |
| sorting | `byKey`, `byPriority`, `PRIORITY_RANK` |
| numbers | `clamp`, `percent` |
| misc | `escapeHtml`, `groupBy`, `debounce` |

## What makes a helper actually reusable

**Pure.** Same input, same output. No DOM, no `localStorage`, no `fetch`. That's why these can be
imported by any file without creating a dependency tangle.

**One job.** `formatDate` formats a date. It does not also decide whether the date is overdue —
that's `isOverdue`. Helpers that do two things get rewritten the first time you need one and not
the other.

**Defensive.** Try the edge cases on the page: `formatDate("not a date")` returns `"Invalid date"`
rather than throwing, `statusLabel("nonsense")` falls back, and `percent(3, 0)` returns `0`
instead of `NaN`.

**Functions that return functions.** `byKey("hours", "desc")` builds a comparator, so one helper
sorts every field. `debounce(fn, 400)` wraps any function. This is the pattern that stops you
writing `sortByName`, `sortByHours`, `sortByDate` separately.

## The two worth knowing by heart

`escapeHtml` — the moment you build markup with `innerHTML` from user input, you need it.
Type `<img onerror=alert(1)>` into a task title without it and you have an XSS hole. Task 6 uses
this on every render.

`debounce` — type in the box on the page. The raw keystroke counter climbs on every press, but the
wrapped function only fires 400ms after you stop. That's one API request per search instead of one
per letter.
