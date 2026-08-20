# Task 10 — useReducer CRUD Logic

> Sheet description: Manage add/update/delete/filter actions through useReducer instead of scattered setState calls

## Files

- `lib/crudReducer.js` — the reducer, action types and selectors. **Pure — no React.**
- `lib/CrudContext.jsx` — the wiring: context, persistence, action creators

That separation is the point. `crudReducer.js` is tested by calling it with a state and an action —
no DOM, no rendering, which is why those 22 tests run in milliseconds.

## What it replaces

Seven `useState` calls that have to be updated in the right order:

```js
records, entity, search, filter, sort, selected, pending
```

Deleting a record has to remove it, drop it from the selection *and* clear its pending flag. Three
setters, and forgetting one is a bug you find later. As a reducer it's one transition:

```js
case ACTIONS.DELETE:
  return {
    ...state,
    records: { ...state.records, [entity]: state.records[entity].filter(r => r.id !== id) },
    selected: state.selected.filter(selectedId => selectedId !== id)
  };
```

## Unknown actions throw

```js
default:
  throw new Error(`crudReducer: unknown action "${action.type}"`);
```

Returning state silently means a typo in an action type looks like "my dispatch does nothing" —
genuinely hard to find. The page has a button that fires a bad action so you can see it fail loudly.

## Action creators

```js
actions.create("products", values);        // not dispatch({ type: "record/create", … })
```

A typo in `actions.craete` is an immediate TypeError. A typo in an inline action string reaches the
reducer.

## Selectors, not stored derivations

`selectVisible()` computes the filtered, searched, sorted list from state during render. The reducer
answers *what changed*; selectors answer *what should be on screen*. Mixing those is how a reducer
ends up 400 lines long.

Note `[...filtered].sort(...)` — sorting a copy. `sort` mutates, and mutating state inside a
selector is a bug that only shows up later. There's a test for it.

## useState or useReducer

| useState | useReducer |
|----------|-----------|
| one independent value | several values that change together |
| a toggle, an input, an open flag | one action touching three or four fields |
| the next value doesn't depend on the last | transitions are the interesting part |
| no need to test the logic alone | you want the logic testable without React |
