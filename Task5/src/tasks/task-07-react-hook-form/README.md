# Task 7 — React Hook Form

> Sheet description: Rebuild one major form using react-hook-form with Controller components where needed

The product form from task 6, rebuilt. Same rules, roughly a third of the plumbing.

## What moved where

| Concern | By hand (task 6) | react-hook-form |
|---------|------------------|-----------------|
| Values | `useState` + `setValue` per field | `register()`, uncontrolled |
| Errors | `useState` object + `validateAll()` | `formState.errors` |
| Touched | a map maintained on blur | `formState.touchedFields` |
| Validate on blur | hand-rolled in the hook | `mode: "onTouched"` |
| Focus first error | `querySelector` after submit | automatic |
| `isDirty` | `JSON.stringify` comparison | `formState.isDirty` |
| Re-renders | one per keystroke | none, until an error changes |

The rules didn't get simpler — they moved into the `register` call. What disappeared is the state
management around them.

## `valueAsNumber`, and the bug without it

```jsx
{...register("price", { valueAsNumber: true, min: { value: 0.01, message: "…" } })}
```

Every input reads as a string. Without `valueAsNumber`, `min` still works by coercion but
`Number.isInteger(value)` never does — and the value saved into the record is a string.

## Controller — and when you actually need it

`register` works by attaching a ref to a native input. Use `Controller` when that isn't possible:

- a component library's Select, DatePicker or Autocomplete
- a rich text editor
- anything storing a non-string value — a Date, an array of tags

**Not** for a plain `<input>` or `<select>`. The Category field here uses `Controller` around a
plain select purely to show the shape; in production it would use `register`, since `Controller`
makes the field controlled again and gives up the re-render saving.

## Which to use

**By hand** when the form has two or three fields, the rules are unusual, or a dependency has to be
justified.

**react-hook-form** past about four fields, when re-render cost is measurable, for schema validation
via zod, or for field arrays.
