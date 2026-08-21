# Task 6 — React Hook Form in RN

> Sheet description: Build a profile form using react-hook-form with validation and controlled RN inputs

## Why `register()` doesn't work here

```jsx
<input {...register("email")} />        // ✅ web
<TextInput {...register("email")} />    // ❌ React Native
```

Two reasons: `TextInput`'s ref has no `.value` for RHF to read, and it emits `onChangeText(string)`
rather than an event with `target.value`.

So **every field** goes through `Controller` / `useController`. This project wraps that once in
`lib/ControlledInput.jsx`, so the form body stays as readable as the web version instead of being
four levels of render prop.

## onChangeText, not onChange

```jsx
onChange={onChange}       // ❌ RHF receives the RN event object
onChangeText={onChange}   // ✅ RHF receives the string
```

Wiring it to `onChange` stores an event object as the field value, and every rule then fails
confusingly.

## Focus management is manual

On the web RHF focuses the first invalid field for you. There's no DOM here, so it can't:

```js
handleSubmit(onValid, fieldErrors => {
  const first = Object.keys(fieldErrors)[0];
  if (first) setFocus(first);
});
```

Which is why `ControlledInput` is wrapped in `forwardRef` — without it, `setFocus` silently does
nothing.

## mode: onTouched

```
onSubmit   nothing until submit — feels unresponsive
onChange   errors while you're still typing — feels hostile
onTouched  validates after the first blur, then live  ✅
```

## Is the dependency worth it here

More clearly than on the web. A controlled `TextInput` re-renders the whole form on every keystroke;
on a mid-range Android phone with eight fields that's visible input lag. RHF isolates each field's
subscription.

Below about three fields, `useState` is still fine.
