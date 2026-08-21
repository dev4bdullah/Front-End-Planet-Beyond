# Task 6 — Dynamic DOM Rendering

> Sheet description: Render task cards/table rows from JavaScript data instead of hardcoded HTML

## Run it

Right-click `index.html` → **Open with Live Server**.

Open `index.html` and search for a task title — you won't find one. There is no task markup in the
HTML at all.

## The pattern

```js
// 1. data is the single source of truth
let tasks = [ ... ];

// 2. one function turns one item into markup
function taskCard(task) { return `<li>...</li>`; }

// 3. one function writes the whole list
function render() { list.innerHTML = tasks.map(taskCard).join(""); }

// 4. every action changes data, then re-renders
tasks.push(newTask); render();
```

No handler anywhere says "find the third card and tick its checkbox". They change the array and
redraw. One code path builds the page, so there's exactly one place a rendering bug can live.

## Three deliberate choices

**`escapeHtml` on every interpolated value.** Building markup from user input with `innerHTML` is
an XSS hole without it. Add a task titled `<img onerror=alert(1)>` — it renders as text.

**The empty state lives inside `render()`.** It's another branch of the same function, not a
special case handled elsewhere that can drift out of sync with the list.

**Actions never touch the DOM.** Look at the button handlers — every one mutates `tasks` and calls
`render()`. Nothing else.

## innerHTML vs createElement

| | `innerHTML` + template strings | `createElement` |
|---|---|---|
| Readability | looks like the output | verbose for nested markup |
| Safety | needs escaping, always | `textContent` escapes for you |
| Listeners | lost on redraw → use delegation | can attach per element |
| Focus & scroll | reset on redraw | preserved if patched in place |

This page uses `innerHTML` + escaping + delegation, which stays readable at this size. React exists
because full redraws stop scaling once the app gets large — the diffing is the part you'd otherwise
have to write yourself.

## Worth noticing

The render counter at the bottom climbs on every action. That's the whole model: **N actions, N
renders, zero manual DOM edits.**
