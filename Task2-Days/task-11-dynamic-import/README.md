# Task 11 — Dynamic Import

> Sheet description: Lazy-load an export/analytics utility using import() only when the user clicks the related action

## Run it

Right-click `index.html` → **Open with Live Server**.

## Prove it in 30 seconds

1. `F12` → **Network** tab, filter to **JS**
2. Refresh — you'll see `main.js` and **no** `analytics.js`
3. Click **Show analytics** — `analytics.js` appears in the list
4. Click **Export CSV** — nothing new downloads, the log says it was cached
5. Click **Show chart** — only `charts.js` is fetched

## Static vs dynamic

| | `import x from "./x.js"` | `await import("./x.js")` |
|---|---|---|
| When it runs | before any of your code | the moment you call it |
| Where it can appear | top level only | anywhere — inside an `if`, a handler, a loop |
| Path | must be a literal string | can be a variable |
| Returns | the bindings | a **Promise** of the module object |
| Effect on first load | adds to it | none |

## Four details in this code

**Modules are cached after the first import.** Click *Show analytics* then *Export CSV* — the
second reuses it. A module is evaluated exactly once no matter how many times it's imported. The
`loadedAt` timestamp in `analytics.js` proves it: it never changes.

**The result is a namespace object, so destructure it.** `const { getStats } = await import(...)`.
A default export arrives as `.default`.

**It can fail.** A network drop mid-session means the import rejects. Wrapped in `try/catch` with
the button restored in `finally`.

**Load two in parallel with `Promise.all`.** The chart button needs both modules; awaiting them one
after the other would double the wait.

## When it's worth it

**Yes:** export and PDF tools, chart libraries, rich text editors, admin panels, anything behind a
rarely-clicked button, route-level code in a SPA.

**No:** small modules needed on first paint. An extra round trip costs more than the bytes saved.

## What this looks like in a real build

Vite and webpack turn every `import()` into a separate chunk automatically — you don't configure
anything. This folder has no bundler, which is why the two lazy modules are plain `.js` files. The
mechanism is identical either way.
