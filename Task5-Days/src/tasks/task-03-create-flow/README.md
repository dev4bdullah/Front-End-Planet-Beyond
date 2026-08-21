# Task 3 — Create Flow

> Sheet description: Build an add-record modal or page form with reusable input components

## One form, two containers

`RecordForm` takes an entity, initial values and a submit callback. Where it renders is the
caller's problem — which is why the same component works inside a modal and inline on a page.

## Fields generated from the schema

```jsx
{SCHEMAS[entity].fields.map(field => (
  <Field key={field.name} field={field} value={...} error={...} />
))}
```

Switch entity and the same component renders a different form, because the schema changed and
nothing else did.

## A modal that behaves

Five things a hand-rolled modal usually misses, all in `components/Modal.jsx`:

1. **Focus moves inside on open**, and returns to the trigger on close
2. **Escape closes it**
3. **Tab wraps** instead of escaping to the page behind
4. **Body scroll locks** — restoring the *previous* value, not `""`
5. **`createPortal`**, so no ancestor's `overflow: hidden` can clip it

Plus `role="dialog"` and `aria-modal="true"`, and a backdrop that only closes when the backdrop
itself is the mousedown target.

## The submit button in the footer

```jsx
<form id="record-form">…</form>
<button type="submit" form="record-form">Create</button>
```

The `form` attribute lets a button outside the form submit it. Without it the footer button needs a
handler reaching into the form — and <kbd>Enter</kbd> in a text field stops submitting, which
people notice.
