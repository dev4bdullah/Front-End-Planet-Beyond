# Task 13 — Deliverable

> Sheet description: Build a complete React admin CRUD module with forms, validation, table actions, filters, confirmations, and README

## What it is

One admin module using every previous task: three entities, full CRUD, search and filters, a
cards/table switch, bulk delete, permission-gated actions, optimistic updates and persistence.

## Where each task shows up

| Task | Used here as |
|------|--------------|
| 1 Data model | the schema driving every form and column |
| 2 Read views | the cards / table switch, choice remembered |
| 3 Create flow | New opens a modal around `RecordForm` |
| 4 Update flow | Edit pre-fills, keyed by record id, merges on save |
| 5 Delete flow | confirmation, plus an undo toast restoring the index |
| 6 Manual validation | `RecordForm`'s rules come from `validation.js` |
| 7 React Hook Form | the alternative implementation, on its own page |
| 8 Toasts | every action here raises one |
| 9 Context API | theme, auth and toasts; `can()` gates the buttons |
| 10 useReducer | every mutation is a dispatched action |
| 11 Local persistence | records, filters and the view preference |
| 12 Optimistic UI | editing updates instantly, rolls back on failure |

## Try this

1. Create a record — it appears at the top with a confirming toast
2. Edit one: the change shows immediately, then settles when the fake API confirms
3. Set the failure rate to 100% in task 12, edit again — it rolls back with an explanation
4. Delete a row, press Undo — it returns to its **original position**, not the top
5. Switch to viewer in task 9, come back — the action buttons are gone
6. Filter to something with no matches — the empty state says why and offers to clear
7. Refresh — records, filters and the view preference all survive

## The structure worth noticing

This page holds almost no logic. Every mutation is `actions.something()`, every rule lives in the
model or the validator, every dialog is a component from an earlier task. A page that composes
rather than implements is the actual deliverable — the CRUD module is the thirteen folders, not
this file.
