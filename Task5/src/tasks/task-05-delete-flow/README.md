# Task 5 — Delete Flow

> Sheet description: Add confirmation modal before deletion and show safe cancel/confirm actions

## Four rules for a destructive confirmation

1. **Name the thing.** "Delete this item?" gives the user nothing to check.
2. **Cancel is first in the DOM**, so the modal's focus trap lands on it.
3. **The destructive button is never the Enter default.**
4. **For bulk or irreversible actions, require typing** — `requireTyping` on `ConfirmDialog`.

Rule 2 matters more than it looks. Escape and Enter are both muscle memory; if the destructive
action is what Enter triggers, the dialog has made things worse rather than safer.

## Confirmation or undo

| | Confirm first | Undo after |
|---|---|---|
| Interrupts | always, including the 99% of correct clicks | never |
| Best for | genuinely irreversible things | anything restorable |
| Failure mode | people click through without reading | the toast vanishes unnoticed |

This page uses both, which is belt and braces for a demo. In real use, pick one: **undo for a single
row, confirmation for a bulk delete** — an undo toast for twenty records is easy to miss.

## Restoring to the right index

```js
const index = state.records[entity].findIndex(item => item.id === record.id);   // BEFORE deleting
actions.remove(entity, record.id);

// the reducer splices it back where it was
list.splice(Math.min(index, list.length), 0, record);
```

Pushing a restored record to the front is the easy version, and it looks broken — the row reappears
somewhere the user wasn't looking. There's a test asserting the restored order matches the original
exactly.
