# Task 1 — JavaScript Project Setup

> Sheet description: Initialize package.json, add npm scripts, and configure ESLint/Prettier for browser ES modules

## Run it

Right-click `index.html` → **Open with Live Server**. The dark panel fills in if the module loaded.

To use the tooling itself:

```bash
npm install
npm run lint
npm run format
```

## Files

| File | Purpose |
|------|---------|
| `package.json` | `"type": "module"` plus the npm scripts |
| `eslint.config.js` | flat config — browser globals, ES modules, `no-var`, `prefer-const`, `eqeqeq` |
| `.prettierrc` | 100 char width, double quotes, no trailing commas |
| `.prettierignore` / `.gitignore` | keep `node_modules` out of both tools |

## The two settings that actually matter

**`"type": "module"`** — without it, ESLint reads `import` as a syntax error, because the default
is CommonJS.

**`sourceType: "module"` + `globals.browser`** — the same signal to ESLint, and it stops
`document`, `window` and `localStorage` being reported as undefined variables.

## Why `eslint-config-prettier` is last

It disables every ESLint rule about spacing, quotes and semicolons — the ones Prettier already
owns. Being last in the array means it overrides anything set before it. Skip it and the two tools
will reformat each other in a loop on every save.

## Verify

1. Delete a semicolon, press `Ctrl+S` — Prettier restores it
2. Write `var x = 1;` — ESLint underlines it (`no-var`)
3. `npm run check` should exit clean
