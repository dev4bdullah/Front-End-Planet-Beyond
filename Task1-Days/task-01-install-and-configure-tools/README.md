# Task 1 — Install & Configure Tools

> Sheet description: Setup VS Code (Prettier, ESLint, Live Server), Node.js LTS, npm/yarn, and DevTools extensions

Nothing to run here. This folder holds the config files that make the other five tasks
format and lint themselves, plus the exact steps to reproduce the setup.

## 1. Node.js LTS

Windows / macOS — download the LTS installer from nodejs.org.

Linux — use nvm instead of `apt`, which ships an outdated Node:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

Check both:

```bash
node -v    # v22.x or newer
npm -v     # 10.x or newer
```

## 2. VS Code extensions

Open Extensions with `Ctrl+Shift+X` and install:

| Extension | Publisher | What it gives you |
|-----------|-----------|-------------------|
| Prettier – Code formatter | Prettier | formats HTML and CSS on save |
| ESLint | Microsoft | flags mistakes as you type |
| Live Server | Ritwick Dey | reloads the browser on save |
| HTML CSS Support | ecmel | class name autocomplete from your CSS |

## 3. Project tooling

```bash
npm init -y
npm install --save-dev prettier eslint @eslint/js globals
```

Then copy `.prettierrc`, `.prettierignore`, `eslint.config.js` and `.vscode/settings.json`
from this folder into your project root.

## 4. Scripts

Add these to `package.json`:

```json
"scripts": {
  "format": "prettier --write \"**/*.{html,css,js}\"",
  "format:check": "prettier --check \"**/*.{html,css,js}\"",
  "lint": "eslint ."
}
```

## 5. Live Server

Right-click any `index.html` in the Explorer → **Open with Live Server**.
The URL should read `127.0.0.1:5500`, not `file:///`.

## 6. Chrome DevTools

Press `F12` and get familiar with four tabs:

- **Elements** — inspect the DOM, edit CSS live in the Styles panel
- **Console** — errors and warnings
- **Network** — see which files loaded and which 404'd
- **Device toolbar** (`Ctrl+Shift+M`) — test the breakpoints from task 4

## Verifying the setup

1. Open any `.css` file, break the indentation, press `Ctrl+S` — Prettier should fix it.
2. Run `npm run format:check` — should report all files formatted.
3. Open a page with Live Server, change a colour, save — the browser refreshes on its own.
