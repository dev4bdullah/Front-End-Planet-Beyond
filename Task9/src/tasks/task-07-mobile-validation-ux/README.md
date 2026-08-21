# Task 7 — Mobile Validation UX

> Sheet description: Show inline errors, disabled submit state, success message, and failed-save message

Four feedback states. The one people skip is the failed save — and it's the one where the user's
work is at risk.

## Don't disable the submit button

```jsx
<Button disabled={!isValid} />   // ❌
```

The user sees a dead button and no explanation. On a phone the invalid field is often **scrolled off
screen**, so there is nothing visible to explain why nothing happens. A disabled button is also
skipped by some screen readers entirely.

```jsx
<Button onPress={handleSubmit(onValid, focusFirstError)} />   // ✅
```

Submitting reveals every error at once and moves focus to the first one.

Disabling while a request is **in flight** is different — there the reason is visible, because the
label says "Saving…".

## Inline, not a summary at the top

A web form can show a list of errors at the top and let the user scan it. On a phone that list is
off screen by the time they reach the field.

```jsx
<Text style={{ minHeight: 15 }}>{error?.message ?? hint ?? " "}</Text>
```

The row reserves its height whether or not there's a message — otherwise the form jumps as errors
appear, and a jump can move the button out from under a descending thumb.

## A failed save must not lose the data

```js
// ❌ the user's typing is gone
catch { reset(); showError(); }

// ✅ keep every value, say what happened, offer a retry
catch { setResult({ kind: "error", message: "Couldn't reach the server. Your changes are still here." }); }
```

On a phone, retyping a form is a real cost.

## Server errors belong on the field

```js
if (error.field) setError(error.field, { message: error.message });
```

`setError` puts it in the same place as a client-side error, so the user doesn't have to work out
which of two error systems is talking.

## Success needs to be visible

A save with no confirmation leaves the user pressing the button again. Use
`accessibilityLiveRegion="polite"` — a green box is invisible to anyone not looking at it.
