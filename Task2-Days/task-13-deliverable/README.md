# Task 13 — Deliverable

> Sheet description: Build an advanced vanilla JavaScript task manager with CRUD, search, filters, localStorage, API panel

## Run it

Right-click `index.html` → **Open with Live Server**. Must be Live Server — ES modules are blocked
over `file://`.

## Structure

```
task-13-deliverable/
├── index.html
├── style.css
└── js/
    ├── main.js         entry point — state and wiring only
    ├── storage.js      the only file that knows localStorage exists
    ├── api.js          the only file that knows about the network
    ├── render.js       the only file that touches the DOM
    ├── validation.js   pure validators
    ├── utils.js        pure helpers
    └── analytics.js    lazy — loaded with import() on first click
```

## Every Day 2 task, in one app

| Task | Where it lives |
|------|----------------|
| 1 · Project setup | ES modules throughout, config in task 1's folder |
| 2 · Module architecture | the six files above, each with one job |
| 3 · Modern syntax | `??=`, optional chaining, destructuring, spread, template literals |
| 4 · Data transformation | `visibleTasks()` in `main.js` — filter → filter → sort |
| 5 · Utility functions | `utils.js` — including the `debounce` on the search box |
| 6 · Dynamic rendering | `render.js` — no task markup exists in the HTML |
| 7 · Event delegation | one listener on `#taskList` handles toggle, edit and delete |
| 8 · Form validation | `validation.js` + inline errors with `aria-describedby` |
| 9 · localStorage | `storage.js` — tasks, filter, search, sort and theme in one object |
| 10 · Async & API states | the API panel: loading, success, empty, error with retry |
| 11 · Dynamic import | `analytics.js` — absent from the Network tab until you click |
| 12 · DevTools | `console.warn` on migration, named requests, real error paths |

## Features

**CRUD** — add, edit in place, toggle complete, delete
**Search** — debounced, persisted across reloads
**Filters** — all, active, done, high priority, overdue
**Sort** — newest, due date, priority, A–Z
**Theme** — light/dark, saved
**API panel** — users, posts, and a deliberate failure with a working retry
**Analytics** — lazy-loaded stats and CSV export
**Overdue detection** — anything past its due date and not done is flagged red

## Test run

1. Click **Load sample tasks** — one is already overdue and one is done
2. Tick one, edit another, search, switch filters, change sort, flip to dark mode
3. Press `F5` — every one of those comes back
4. Click **Break it** in the API panel → error state → **Try again**
5. Open Network, then click **Show analytics** — `analytics.js` appears only now
6. DevTools → Application → Local Storage → find `day2.taskManager.v1`

## Two things worth reading the code for

**`main.js` never touches localStorage, `fetch` or `innerHTML`.** It holds state and calls the
module that owns each concern. That's the whole point of task 2, made concrete.

**Every mutation ends in `persist()`.** There is no path through the app that changes state without
saving and re-rendering, so the screen and storage can't drift apart.
