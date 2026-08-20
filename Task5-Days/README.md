# Day 5 — CRUD & State Management

Thirteen tasks, one React admin CRUD module. Each folder under `src/tasks/` is one row from the task
sheet, named after the task.

```
day5-crud-state-management/
├── package.json  vite.config.js  jsconfig.json  eslint.config.js  .prettierrc
├── index.html
└── src/
    ├── main.jsx  App.jsx
    ├── router/routes.jsx
    ├── providers/AppProviders.jsx    the four contexts, composed
    ├── shared/                       AppShell, Section wrapper, navigation
    ├── styles/index.css
    ├── test/                         setup, helpers, three suites
    └── tasks/
        ├── task-01-crud-data-model/          model.js, seed.js
        ├── task-02-read-views/               + components/ (card, table)
        ├── task-03-create-flow/              + components/ (Modal, Field, RecordForm)
        ├── task-04-update-flow/
        ├── task-05-delete-flow/              + components/ConfirmDialog
        ├── task-06-manual-validation/        + lib/ (validation, useRecordForm)
        ├── task-07-react-hook-form/          + forms/ProductFormRHF
        ├── task-08-toast-notifications/      + lib/ToastContext
        ├── task-09-context-api/              + contexts/ (Theme, Auth)
        ├── task-10-usereducer-crud-logic/    + lib/ (crudReducer, CrudContext)
        ├── task-11-local-persistence/        + hooks/ (3 hooks)
        ├── task-12-optimistic-ui/            + lib/fakeApi
        └── task-13-deliverable/
```

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:3000. Pick any task from the sidebar.

React needs a build step, so this is **one project rather than thirteen** — one `npm install`. Each
task still has its own folder and README, named exactly as the sheet names it.

## Scripts

| Command | Does |
|---------|------|
| `npm run dev` | dev server on port 3000 |
| `npm run build` | production bundle |
| `npm run preview` | serve the built bundle |
| `npm test` | run the suite once |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## The tasks

| # | Task title (as in the sheet) | Sheet description |
|---|------------------------------|-------------------|
| 1 | CRUD Data Model | Define a clean users/products/tasks data model with IDs, status, priority, timestamps, and validation rules |
| 2 | Read Views | Display records in both responsive card view and admin-style table view |
| 3 | Create Flow | Build an add-record modal or page form with reusable input components |
| 4 | Update Flow | Pre-fill edit forms, update selected records, and preserve unchanged fields correctly |
| 5 | Delete Flow | Add confirmation modal before deletion and show safe cancel/confirm actions |
| 6 | Manual Validation | Validate required fields, email format, min/max length, numeric fields, and select fields |
| 7 | React Hook Form | Rebuild one major form using react-hook-form with Controller where needed |
| 8 | Toast Notifications | Create success, error, warning, and info notifications through a ToastContext |
| 9 | Context API | Create ThemeContext, AuthContext, and ToastContext for app-level state |
| 10 | useReducer CRUD Logic | Manage add/update/delete/filter actions through useReducer instead of scattered setState calls |
| 11 | Local Persistence | Save CRUD records, filters, and UI preferences in localStorage through reusable hooks |
| 12 | Optimistic UI | Update UI immediately for create/update/delete and rollback state if the simulated API call fails |
| 13 | Deliverable | Build a complete React admin CRUD module with forms, validation, table actions, filters, confirmations, and README |

## Three demos worth running rather than reading

**Task 12 — the rollback.** Drag the failure rate to 100%, then edit a product. The change appears
instantly, the row dims, and a second later it reverts with an explanation. That failure path is the
whole reason optimistic UI is harder than it looks.

**Task 4 — the key bug.** Edit one record, cancel, edit a different one. It works, because
`RecordForm` is keyed on the record id. Remove that key and the second form shows the first
record's values — a bug that only appears on the *second* edit.

**Task 10 — the unknown action.** Press the button that dispatches a typo'd action type. The reducer
throws instead of silently doing nothing, which is the difference between a five-second fix and an
afternoon.

## What was verified

- `npm run build` — no warnings
- `npx eslint .` — zero errors, zero warnings
- `npm test` — **84 tests across 3 files, all passing**

The reducer suite (22 tests) runs with **no React and no DOM** — `crudReducer.js` is a pure function
in its own file, which is exactly why that's possible. It covers create, update preserving untouched
fields, an update refusing to overwrite `id` and `createdAt`, delete clearing the selection, restore
returning a record to its original index, the optimistic flag transitions, unknown actions throwing,
and the selectors sorting numerically without mutating their source.

The validation suite (28 tests) covers required, length, pattern, email, numeric, integer, date and
cross-field rules, plus the model helpers.

The app suite (34 tests) renders the real route tree with the real providers: all thirteen routes
mount, the modal traps focus and closes on Escape, an invalid submit is blocked, a delete confirms
and undoes to the right index, the toast stack caps itself, permissions change with the role, and
corrupt or version-mismatched storage recovers to seed data instead of crashing.
