# Day 2 — JavaScript

Each folder is one row from the task sheet, named after the task and runnable on its own.

```
day2-javascript/
├── task-01-javascript-project-setup/
├── task-02-es6-module-architecture/
├── task-03-modern-javascript-syntax/
├── task-04-data-transformation-practice/
├── task-05-reusable-utility-functions/
├── task-06-dynamic-dom-rendering/
├── task-07-event-delegation/
├── task-08-form-handling-and-validation/
├── task-09-localstorage-persistence/
├── task-10-async-javascript-and-api-states/
├── task-11-dynamic-import/
├── task-12-debugging-and-devtools/
└── task-13-deliverable/
```

## How to run any of them

Open the folder in VS Code, right-click `index.html` → **Open with Live Server**.

**Live Server is required, not optional.** Every page uses `<script type="module">`, and ES modules
are blocked over `file://` by CORS. Double-clicking an HTML file gives a blank page and a console
error. If the URL bar says `file:///` instead of `127.0.0.1:5500`, that's the problem.

No `npm install` needed to run anything. Task 1 has a `package.json` if you want to use the linter
and formatter themselves.

## The tasks

| # | Task title (as in the sheet) | Sheet description |
|---|------------------------------|-------------------|
| 1 | JavaScript Project Setup | Initialize package.json, add npm scripts, and configure ESLint/Prettier for browser ES modules |
| 2 | ES6 Module Architecture | Split JavaScript into main.js, storage.js, api.js, render.js, validation.js, and utils.js using type=module |
| 3 | Modern JavaScript Syntax | Implement let/const, arrow functions, template literals, destructuring, rest/spread, optional chaining, and nullish coalescing |
| 4 | Data Transformation Practice | Use map/filter/find/some/every/reduce/sort on realistic task/user datasets |
| 5 | Reusable Utility Functions | Create helpers for IDs, date formatting, status labels, search normalization, and sorting |
| 6 | Dynamic DOM Rendering | Render task cards/table rows from JavaScript data instead of hardcoded HTML |
| 7 | Event Delegation | Build add/edit/delete/complete task actions using one parent event listener and dataset attributes |
| 8 | Form Handling & Validation | Validate required fields, priority, due date, and show accessible inline error messages |
| 9 | LocalStorage Persistence | Save tasks, selected filter, search query, and theme preference to localStorage and restore on reload |
| 10 | Async JavaScript & API States | Fetch users/posts from JSONPlaceholder with async/await, loading, empty, success, and error states |
| 11 | Dynamic Import | Lazy-load an export/analytics utility using import() only when the user clicks the related action |
| 12 | Debugging & DevTools | Use Console, Sources, and Network tabs to inspect state, breakpoints, failed requests, and response payloads |
| 13 | Deliverable | Build an advanced vanilla JavaScript task manager with CRUD, search, filters, localStorage, API panel |

Every folder has its own README explaining what to look at and how to verify it.

## Which ones need DevTools open

Tasks **11** and **12** are close to pointless without it.

- **Task 11** — the whole demonstration is that `analytics.js` is missing from the Network tab until
  you click a button.
- **Task 12** — most buttons send output to the Console, and three of them break on purpose.

Press `F12` before clicking anything on those two.

## How the tasks build up

Tasks 1–5 are the foundations: tooling, file structure, syntax, array methods, helpers.
Tasks 6–9 build the app: render from data, one listener, validate the form, persist the state.
Tasks 10–12 add the harder parts: async with all four states, lazy loading, and debugging.
Task 13 is all twelve in one application.

Tasks 6 and 7 are really one idea. Task 6 rebuilds the list with `innerHTML` on every change, which
destroys every element in it. Per-button listeners would die with them — delegation is what makes
the render-everything approach work at all.

## What was verified

All 32 JavaScript files parse cleanly. Every page was bundled and executed in a headless DOM with
every button clicked and every form submitted — no uncaught errors anywhere. The deliverable was
tested behaviourally: seeding renders cards, the delegated toggle marks tasks done, filters narrow
correctly, a short title is rejected with a visible message, a valid submit adds a card, state
reaches localStorage, the lazy analytics module loads on click, and the API error state renders a
working retry button.

Two pages report console errors by design — task 1's caught `TypeError` demo and task 12's error
sandbox. Both were checked separately to confirm the errors are caught and the pages stay
responsive.

All files also pass Prettier using the config from task 1.
