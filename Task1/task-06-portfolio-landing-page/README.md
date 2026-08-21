# Task 6 — Portfolio Landing Page (Deliverable)

> Sheet description: Create a fully responsive portfolio landing page using only HTML and CSS while following modern web development best practices

## Run it

Right-click `index.html` → **Open with Live Server**. Two files, no build step, no JavaScript.

## What it pulls together

| From | Used here |
|------|-----------|
| Task 2 — scaffold | `index.html` + `style.css` + `assets/`, full meta head with Open Graph tags |
| Task 3 — semantic markup | `header` / `nav` / `main` / `section` / `article` / `aside` / `footer`, skip link, labelled sections |
| Task 4 — responsive layout | 12-column grid throughout, breakpoints at 576, 768 and 1024px |
| Task 5 — fluid design | every size is a custom property built from `clamp()`, `min()`, `max()` or `calc()` |

## Sections

Hero → About → Skills → Projects → Contact → Footer.

## Responsive behaviour

| Width | Skills | Projects | Hero | About |
|-------|--------|----------|------|-------|
| under 576px | 1 column | 1 column | stacked | stacked |
| 576px+ | 2 columns | 2 columns | stacked | stacked |
| 768px+ | 2 columns | 2 columns | stacked | text 7 / panel 5, panel sticky |
| 1024px+ | 4 columns | 2 columns | text 7 / visual 5 | text 8 / panel 4 |

## Accessibility

- Skip link as the first focusable element
- One `h1`, headings descend in order with nothing skipped
- Both `nav` elements carry their own `aria-label`
- Every `section` is tied to its heading with `aria-labelledby`
- Decorative visuals are `aria-hidden="true"`; nothing meaningful is announced twice
- Every form input has a real `<label for="…">`, not a placeholder standing in for one
- Visible `:focus-visible` outlines everywhere
- `scroll-padding-top` stops the sticky header hiding the section you jumped to
- `prefers-reduced-motion` disables smooth scroll and transitions
- A print stylesheet hides the nav, footer links and form

## Before you publish it

1. Replace `hello@example.com` with your real address
2. Point each project's **Source** link at the actual repo
3. Swap the form `action="#"` for a Formspree or Netlify Forms endpoint, or delete the form and
   keep the contact links
4. Update the stats in the hero to real numbers

## Push it to GitHub Pages

```bash
git init
git add .
git commit -m "Day 1 deliverable — portfolio landing page"
git branch -M main
git remote add origin https://github.com/dev4bdullah/portfolio.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: main / (root)**. Live in about a minute at
`https://dev4bdullah.github.io/portfolio/`.

## Checks worth running

- Lighthouse → Performance, Accessibility, Best Practices, SEO (aim for 95+ across the board)
- `Ctrl+Shift+M` and step through 320px, 576px, 768px, 1024px, 1440px
- Tab from the address bar to the footer without touching the mouse
