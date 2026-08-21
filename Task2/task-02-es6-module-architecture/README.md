# Task 2 — ES6 Module Architecture

> Sheet description: Split JavaScript into main.js, storage.js, api.js, render.js, validation.js, and utils.js using type=module

## Run it

Right-click `index.html` → **Open with Live Server**.

**Must be Live Server.** ES modules are blocked over `file://` by CORS — double-clicking the file
gives a blank page and a console error. If the URL says `file:///`, that's the problem.

## Structure

```
task-02-es6-module-architecture/
├── index.html          <script type="module" src="js/main.js">
├── style.css
└── js/
    ├── main.js         entry point — wiring and state
    ├── storage.js      the only file that knows localStorage exists
    ├── api.js          the only file that knows about the network
    ├── render.js       the only file that touches the DOM
    ├── validation.js   pure — imports nothing
    └── utils.js        pure — imports nothing
```

## The dependency direction

```
main.js
  ├── storage.js ──┐
  ├── api.js       ├── (nothing)
  ├── render.js ───┴── utils.js
  ├── validation.js
  └── utils.js
```

Arrows only point downward. The pure files sit at the bottom and import nothing, so a circular
import is impossible by construction.

## Three rules being followed

1. **One reason to change** — swap localStorage for a database and `storage.js` is the only edit
2. **Pure files at the bottom** — `utils.js` and `validation.js` have no dependencies, so they're
   trivial to test in isolation
3. **Only `main.js` holds state** — every other module receives its data as an argument, which is
   exactly what makes them reusable

## Gotchas

- The `.js` extension is **required** in browser imports. `from "./storage.js"` works,
  `from "./storage"` 404s. Node and bundlers are lenient; the browser is not.
- Modules are deferred automatically, so `<script type="module">` can sit anywhere — no need for
  `defer` or bottom-of-body placement.
- Modules run in strict mode whether you write `"use strict"` or not.
- Each module runs **once**, no matter how many files import it. That's what makes a shared config
  module a safe pattern.
