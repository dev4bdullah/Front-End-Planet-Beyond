# Task 8 — Controlled Forms

> Sheet description: Build login, profile, and product forms with controlled inputs and validation feedback

## Files

```
task-08-controlled-forms/
├── Page.jsx
├── useForm.js         the shared hook
├── validators.js      pure validation rules
└── forms/
    ├── LoginForm.jsx
    ├── ProfileForm.jsx
    └── ProductForm.jsx
```

## What "controlled" means

The input's value comes from state, and every change goes back through `setState`. React is the
single source of truth — the DOM never holds a value React doesn't know about.

```jsx
<input value={name} onChange={e => setName(e.target.value)} />  // controlled
<input ref={ref} defaultValue="" />                             // uncontrolled
<input value={name} />                                          // bug: read-only forever
```

That last one is the classic mistake. `value` with no `onChange` makes the field permanently
read-only, and React warns about it in the console.

## Why the hook exists

Three forms would otherwise repeat the same forty lines. `useForm` owns:

| Concern | Handled by |
|---------|-----------|
| values | `values`, `setValue`, `handleChange` |
| errors | `errors`, `fieldError(name)` |
| touched tracking | `touched`, `handleBlur` |
| submit blocking | `handleSubmit` — validates all, focuses the first failure |
| button state | `submitting`, `isValid`, `isDirty` |
| everything at once | `field(name)` spreads five props onto an input |

```jsx
<Input label="Email" {...form.field("email")} />
```

## Validate on blur, not on the first keystroke

A `touched` map tracks which fields the user has actually left. Flagging `"a"` as too short while
someone is still typing `"abdullah"` reads as hostile. After the first blur the field validates
live, so the error clears the moment it's fixed.

On submit, everything is marked touched at once and focus jumps to the first broken field —
otherwise a keyboard user has to hunt for the problem.

## Composable validators

Each rule is a pure function returning a message or `""`:

```js
name: compose(required("Name"), minLength("Name", 3))
```

`compose` runs them in order and stops at the first failure, so one field can carry several rules
without nesting ifs.

Cross-field rules get every value as a second argument:

```js
confirmPassword: (value, allValues) =>
  value === allValues.newPassword ? "" : "Passwords do not match.";
```

## The caveat that matters

Client-side validation is a **courtesy to the user, not a security control**. Anyone can open
DevTools, delete the handler and submit whatever they like. Every rule here has to exist on the
server too.
