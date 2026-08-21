# Day 3 — React

Twelve tasks, one Vite project. Each folder under `src/tasks/` is one row from the task sheet.

```
day3-react/
├── package.json  vite.config.js  jsconfig.json  eslint.config.js  .prettierrc
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx                 sidebar nav + theme
    ├── shared/                 Section wrapper, cx helper, sample data
    ├── styles/index.css        design tokens + every BEM block
    └── tasks/
        ├── task-01-react-vite-setup/
        ├── task-02-react-folder-structure/
        ├── task-03-jsx-fundamentals/
        ├── task-04-reusable-base-components/     + ui/ (11 components)
        ├── task-05-interactive-components/       + ui/ (6 components)
        ├── task-06-props-and-composition/
        ├── task-07-state-management-basics/
        ├── task-08-controlled-forms/             + useForm.js, forms/
        ├── task-09-list-rendering/
        ├── task-10-styling-strategy/
        ├── task-11-react-devtools-practice/
        └── task-12-deliverable/                  + components/, hooks/
```

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:3000. Pick any task from the sidebar.

Unlike Day 1 and Day 2, React needs a build step, so this is **one project rather than twelve
separate ones** — one `npm install` instead of twelve. Each task still lives in its own folder with
its own README, and the folders are named exactly as the sheet names the tasks.

## The tasks

| # | Task title (as in the sheet) | Sheet description |
|---|------------------------------|-------------------|
| 1 | React Vite Setup | Create a Vite React app and configure ESLint, Prettier, absolute imports, and clean npm scripts |
| 2 | React Folder Structure | Create components, pages, layouts, hooks, services, utils, constants, and assets folders |
| 3 | JSX Fundamentals | Practice fragments, expressions, conditional rendering, dynamic class names, and reusable markup patterns |
| 4 | Reusable Base Components | Build Button, Input, Card, Badge, Avatar, Loader, EmptyState, and ErrorState components |
| 5 | Interactive Components | Build Modal, Tabs, Accordion, Dropdown, and Toast components with reusable props |
| 6 | Props & Composition | Pass primitives, objects, arrays, callbacks, children, and component variants through props |
| 7 | State Management Basics | Use useState for counters, toggles, tabs, forms, modals, and selected records |
| 8 | Controlled Forms | Build login, profile, and product forms with controlled inputs and validation feedback |
| 9 | List Rendering | Render dynamic arrays with proper keys, empty states, status badges, and conditional actions |
| 10 | Styling Strategy | Use one consistent styling approach: CSS Modules, plain CSS utilities, or Tailwind CSS |
| 11 | React DevTools Practice | Inspect component tree, props, state changes, and re-render behavior in React DevTools |
| 12 | Deliverable | Build a React UI playground that documents reusable components, variants, states, and usage examples |

Every task folder has its own README explaining what to look at and how to verify it.

## npm scripts

| Command | Does |
|---------|------|
| `npm run dev` | dev server on port 3000 with fast refresh |
| `npm run build` | production bundle into `dist/` |
| `npm run preview` | serve the built bundle |
| `npm run lint` | ESLint across every js and jsx file |
| `npm run format` | Prettier rewrites everything under `src/` |

## Three demos worth running rather than reading

**Task 9 — the key demo.** Two buttons switch between `key={row.id}` and `key={index}`. Type
different text into all three inputs, then press Reverse. With id keys the text follows its row;
with index keys it stays behind. That's the bug, and it's invisible until a list has state in it.

**Task 7 — the stale closure.** Two buttons sit side by side: `+3 (updater)` and `+3 (stale)`. One
adds three, the other adds one. Same code apart from `setCount(c => c + 1)` versus
`setCount(count + 1)`.

**Task 11 — memo.** Four cards each counting their own renders. Type in the input and watch: the
memoised card receiving a plain string stays at 1, and the memoised card receiving
`{{ mode: "compact" }}` climbs anyway — because a new object literal is a new reference every
render.

**Install React Developer Tools before task 11.** Most of that page is about panels you won't have
otherwise.

## What was verified

- `npx vite build` — 77 modules transformed, production bundle clean
- `npx eslint .` — zero errors, zero warnings
- All twelve pages server-rendered without throwing
- **33 behavioural checks in a real DOM**, all passing: nav switches pages, the modal opens through
  a portal with `aria-modal` and closes on Escape, arrow keys move tabs, toasts appear, the counter
  demo reproduces the stale-closure bug, form errors appear on blur and clear when fixed, submit is
  blocked while invalid, filters narrow the list, the empty state appears on no match, the
  deliverable rejects a 2-character title, adds a valid one, persists to localStorage, and the
  delete modal cancels without deleting
- Everything passes Prettier
