# Task 2 — Project Scaffold

> Sheet description: Create index.html & style.css and enable Live Server for hot reload

## Run it

Right-click `index.html` → **Open with Live Server**.

## What it demonstrates

| Piece | Why it matters |
|-------|----------------|
| `index.html` + `style.css` + `assets/` | the minimum structure that still scales |
| `<link rel="stylesheet" href="style.css">` in the head | styles load before paint, so no flash of unstyled content |
| `viewport` meta tag | without it, task 4's media queries are ignored on real phones |
| `charset` first in the head | prevents mojibake on accented characters |
| `lang="en"` | screen readers pick the right pronunciation |
| favicon as SVG | one file, sharp at every size |

## Proving hot reload works

Open `style.css`, change `--accent` to `hotpink`, save. The green edge on the callout turns
pink without you touching the browser. If it doesn't, you opened the file directly —
check the URL says `127.0.0.1:5500` rather than `file:///`.
