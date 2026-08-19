# Task 2 — React Folder Structure

> Sheet description: Create components, pages, layouts, hooks, services, utils, constants, and assets folders

## The structure

```
src/
├── main.jsx          entry point
├── App.jsx           sidebar nav + renders the selected task
├── shared/           used by more than one task
├── styles/           one stylesheet, tokens at the top
└── tasks/
    ├── task-01-react-vite-setup/
    ├── ...
    └── task-12-deliverable/
        ├── Page.jsx
        ├── components/
        └── hooks/
```

## Feature-first, not type-first

The common alternative groups by file type — all components in `components/`, all hooks in
`hooks/`, all styles in `styles/`. That reads well on day one and badly by month three: a single
feature ends up smeared across four folders, and deleting it means hunting through all of them.

Grouping by feature means **deleting a feature is deleting a folder**. Each task folder here holds
its own page, its own components and its own hooks.

## Barrel files

Each `ui/` folder has an `index.js` re-exporting everything:

```js
export { default as Button } from "./Button";
export { default as Input } from "./Input";
```

So a page writes `import { Button, Input, Card } from "@ui"` instead of three separate lines.

The trade-off worth knowing: importing one component through a barrel pulls the whole file into
the module graph. Vite tree-shakes it in production, but in a very large app barrels can slow the
dev server. At this size they're clearly worth it.

## Aliases

| Alias | Points at |
|-------|-----------|
| `@` | `src/` |
| `@shared` | `src/shared/` |
| `@styles` | `src/styles/` |
| `@tasks` | `src/tasks/` |
| `@ui` | task 4's `ui/` folder |
| `@interactive` | task 5's `ui/` folder |

`@ui` and `@interactive` point into task folders on purpose — the components live with the task
that built them, and the alias keeps the import short.
