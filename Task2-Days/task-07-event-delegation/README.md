# Task 7 — Event Delegation

> Sheet description: Build add/edit/delete/complete task actions using one parent event listener and dataset attributes

## Run it

Right-click `index.html` → **Open with Live Server**.

Search `main.js` for `addEventListener` on the list — there's exactly one for clicks (plus one for
`Enter` while editing). Seven actions route through it.

## The routing

```js
list.addEventListener("click", event => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger || !list.contains(trigger)) return;

  const { action } = trigger.dataset;
  const id = trigger.closest("li").dataset.id;

  switch (action) { ... }
  render();
});
```

## Three details that matter

**Use `closest("[data-action]")`, not `event.target`.** The moment a button contains an icon or a
`<span>`, the click target is that child. Reading `event.target.dataset.action` returns `undefined`
and the handler silently does nothing — a bug that's genuinely hard to spot.

**`data-action` says *what*, `data-id` says *which*.** The action sits on the button, the id on the
row. `closest("li")` connects them. Don't put both on the button; you'll end up duplicating the id
into four places per row.

**Early return beats an if-chain.** Clicks landing on padding or text exit on line two.

## Why it matters, concretely

| | Listener per button | One delegated listener |
|---|---|---|
| 100 rows × 4 buttons | 400 listeners | 1 |
| After a re-render | all 400 need re-binding | nothing to do |
| Forget to re-bind | buttons silently die | can't happen |
| Removing a row | listener leaks | nothing to clean up |

Task 6 rebuilds `innerHTML` on every change, which destroys every element in the list. Per-button
listeners would die with them. **Delegation is what makes the render-everything approach viable** —
the two tasks are really one idea.

## Events that don't bubble

Delegation depends on bubbling. These don't bubble:

| Doesn't bubble | Use instead |
|----------------|-------------|
| `focus` | `focusin` |
| `blur` | `focusout` |
| `mouseenter` | `mouseover` |
| `mouseleave` | `mouseout` |

`click`, `input`, `change`, `keydown` and `submit` all bubble — which is why the checkbox and the
Enter-to-save both work through the same delegated handler.
