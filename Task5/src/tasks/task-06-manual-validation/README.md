# Task 6 — Manual Validation

> Sheet description: Validate required fields, email format, min/max length, numeric fields, and select fields

## Files

- `lib/validation.js` — pure rules, derived from the schema in task 1
- `lib/useRecordForm.js` — the hand-rolled form hook task 7 replaces

## Rules return a message, not a boolean

```js
if (field.required && !text) return `${field.label} is required.`;
if (!text) return "";                    // an empty optional field is valid
```

The caller gets the text for free and the rule lives in one place. Returning `false` means writing
the message again wherever the check is used.

## Validate on blur, not on the first keystroke

A `touched` map tracks which fields the user has actually left. Flagging `"ab"` as too short while
someone is still typing `"abdullah"` reads as hostile. After the first blur the field validates
live, so the error clears the instant it's fixed.

Late to complain, quick to forgive.

On submit, everything is marked touched at once and focus jumps to the first failing field.

## The email regex you shouldn't write

There is no regex that correctly validates an email address. The only reliable test is sending mail
to it. Four readable checks — `@`, text either side, a dot in the domain, no spaces — catch typos,
which is all they claim to do.

The famous RFC 5322 pattern is several hundred characters, still rejects valid addresses, and
nobody can maintain it.

## Cross-field rules

```js
if (field.name === "stock" && allValues.status === "active" && Number(text) === 0) {
  return "An active product can't have zero stock — set it to draft or archived.";
}
```

`validateField` takes `allValues` as a second argument for exactly this. It's also why validation
belongs beside the model rather than inside a component.

## The caveat

Client-side validation is a **courtesy to the user, never a security control**. Anyone can open
DevTools, delete the handler and submit whatever they like. Every rule here has to exist on the
server too. What it buys you is a fast correction loop, not safety.
