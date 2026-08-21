# Task 12 — Testing & Build

> Sheet description: Add basic Vitest/React Testing Library tests, run production build, and fix warnings

## Run them

```bash
npm test            # once, then exit — what CI runs
npm run test:watch  # re-runs on save
npm run build       # production bundle
npm run preview     # serve the built bundle before deploying
```

## 67 tests across 7 files

| File | Tests | Covers |
|------|-------|--------|
| `tests/Button.test.jsx` | 6 | click, disabled, loading, prop spread, default type |
| `tests/Input.test.jsx` | 5 | label association, unique ids, error a11y, hint behaviour |
| `tests/DataTable.test.jsx` | 11 | pagination, search, filter, numeric sort both ways, selection, both empty states |
| `tests/ErrorBoundary.test.jsx` | 5 | catching, `onError`, recovery, custom fallback |
| `tests/StatCard.test.jsx` | 6 | formatting, `invertDelta` colouring, skeleton shape |
| `../../test/routes.test.jsx` | 17 | every route mounts, sidebar active state, theme toggle, contained page crash |
| `../../test/interactions.test.jsx` | 17 | UX states, boundaries, the memo demo, motion, the deliverable |

Coverage follows complexity, not file count — `DataTable` holds the most logic, so it carries the
most tests.

## Query by role, not by class

```js
screen.getByRole("button", { name: "Save changes" })
screen.getByLabelText("Email address")     // only passes if htmlFor/id match
expect(field).toHaveAccessibleDescription("That domain looks wrong")
```

Not one assertion checks a class name — with one deliberate exception. `StatCard`'s `invertDelta`
test does check for `.text-success-600`, because the colour **is** the behaviour and there's no
accessible name for "green". Worth being honest about when a rule doesn't fit.

## jsdom needs three stubs

```js
global.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
window.matchMedia = window.matchMedia || (query => ({ matches: false, ... }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
```

Without the first, recharts renders at 0×0 and every chart assertion fails. Without `cleanup()`,
`getByRole` starts complaining about multiple matches for no apparent reason.

## Warnings actually fixed

1. **`'__dirname' is not defined`** — `vite.config.js` now uses `import.meta.dirname`, and
   `eslint.config.js` gives config and test files Node globals rather than browser ones.
2. **`manualChunks is not a function`** — Vite 8 uses rolldown, which needs the function form.
3. **Chunk size warning** — fixed by the split in task 8, *not* by raising
   `chunkSizeWarningLimit`. Raising the limit makes the warning go away and leaves the problem.
4. **`scrollTo is not a function`** — the route tests caught a genuine bug in `DashboardShell`. Now
   `?.scrollTo?.({ top: 0 })`, since an element may exist without the method.

That fourth one is the argument for writing tests at all: it was a real crash in an environment I
hadn't considered, found by a test rather than by a user.

## What isn't tested, and why

- **Charts** — asserting on a recharts SVG tests the library. Asserting the data passed in is the
  useful part.
- **Animations** — that an element ends at opacity 1 tests framer-motion. That `useReducedMotion` is
  respected would be worth testing.
- **Grid behaviour at breakpoints** — a visual concern. Playwright screenshots catch that; jsdom
  cannot.

Coverage percentage is a weak target. Seven files covering the components that hold real logic beats
fifty asserting that a div renders.
