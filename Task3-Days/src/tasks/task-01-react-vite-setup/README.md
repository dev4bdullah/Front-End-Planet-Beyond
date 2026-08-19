# Task 1 — React Vite Setup

> Sheet description: Create a Vite React app and configure ESLint, Prettier, absolute imports, and clean npm scripts

The configuration for this whole project lives at the root — this folder holds the page that
proves it works.

## Building it from scratch

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm install -D prettier eslint-config-prettier
```

Then copy `vite.config.js`, `jsconfig.json`, `eslint.config.js` and `.prettierrc` from this
project's root.

## The four config files

| File | Job |
|------|-----|
| `vite.config.js` | the React plugin, the aliases that actually resolve, dev server port |
| `jsconfig.json` | the same aliases again, so VS Code autocompletes and cmd-click works |
| `eslint.config.js` | flat config — browser globals, React + Hooks rules, Prettier last |
| `.prettierrc` | 100 char width, double quotes, no trailing commas |

**Both alias files are required.** `vite.config.js` makes the import resolve at build time;
`jsconfig.json` makes the editor understand it. Change one without the other and your app runs
fine while the editor shows red squiggles on every import.

## Two rules turned off, deliberately

`react/react-in-jsx-scope: "off"` — the new JSX transform means you no longer `import React` in
every file. Leave the rule on and you get a warning in every component.

`react/prop-types: "off"` — this project doesn't use PropTypes. Leave it on and every prop in every
component is flagged.

## Why `eslint-config-prettier` is last

It disables every ESLint rule about spacing, quotes and semicolons — the ones Prettier already
owns. Being last means it overrides everything before it. Skip it and the two tools will
reformat each other in a loop on every save.

## Verify

1. `npm run dev` — the page should render with three green badges
2. `npm run lint` — should exit clean
3. Break the indentation in any file and press `Ctrl+S` — Prettier fixes it
4. Cmd-click any `@ui` import — VS Code should jump to the file
