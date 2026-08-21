# Task 12 — Deliverable

> Sheet description: Build a React UI playground that documents reusable components, variants, states, and usage examples

## What the deliverable is

Two things:

1. **The playground** — the eleven pages in the sidebar. Every component, every variant, every
   state, each with a live example and a "Show code" toggle.
2. **This page** — a working task manager that uses all of them together.

## Structure

```
task-12-deliverable/
├── Page.jsx
├── components/
│   ├── TaskForm.jsx     imports task 8's useForm directly
│   ├── TaskList.jsx     pure presentation — takes callbacks, owns nothing
│   └── TaskStats.jsx
└── hooks/
    ├── useTasks.js         CRUD, derived stats, filter/sort pipeline
    ├── useLocalStorage.js  same API as useState, survives a refresh
    └── useDebounce.js
```

## Logic in hooks, markup in components

`TaskList` has no idea where its data comes from. It receives an array and four callbacks. That's
what makes it readable — and testable, since you can render it with any array you like.

`useTasks` owns every rule about tasks. Its actions are wrapped in `useCallback` so passing them
down doesn't break memoisation, and `stats` is a `useMemo` over the list.

## Where each earlier task shows up

| Task | Used here as |
|------|--------------|
| 1 · Vite setup | every import uses an alias |
| 2 · Folder structure | this folder has its own `components/` and `hooks/` |
| 3 · JSX fundamentals | conditional rendering throughout |
| 4 · Base components | Button, Input, Select, Badge, EmptyState |
| 5 · Interactive | Modal confirms deletes, Switch, Toast on every action |
| 6 · Props & composition | TaskList takes callbacks, never touches data |
| 7 · State basics | search, filter, sort, editing id, confirming record |
| 8 · Controlled forms | TaskForm imports task 8's `useForm` and validators |
| 9 · List rendering | stable keys, two empty states, conditional Edit |
| 10 · Styling | no colour or spacing value anywhere in this file |
| 11 · DevTools | `useCallback` in useTasks, `useMemo` for stats |

## Try this

1. Add a task, refresh — it persists
2. Type a 2-character title and submit — validation blocks it
3. Edit a task, press Cancel — no changes kept
4. Delete one — a modal confirms, Escape cancels
5. Search for nonsense — "nothing matches" with a clear-filters action
6. Clear all — the *other* empty state, with different wording
7. Flip the theme in task 10 — every component here follows, with no code in this file

Tasks are stored under `day3.tasks` in localStorage.
