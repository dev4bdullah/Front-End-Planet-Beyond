# Task 8 — Form Handling & Validation

> Sheet description: Validate required fields, priority, due date, and show accessible inline error messages

## Run it

Right-click `index.html` → **Open with Live Server**. Two buttons at the top fill the form with
valid or deliberately invalid data so you can see every message at once.

## Six decisions in this code

**`novalidate` on the form.** Turns off the browser's own popups so ours are the only messages.
The `type="email"` and `min` attributes stay — they still give phones the right keyboard.

**`preventDefault()` first.** Without it the page reloads and the URL grows a `?`. That trailing
question mark is the classic sign the submit handler never ran.

**Validate on blur, not on the first keystroke.** Flagging "ab" as too short while someone is still
typing "abdullah" reads as hostile. A `touched` Set tracks which fields the user has finished with;
after that they validate live, so the error clears the moment it's fixed.

**Validators return a string, not a boolean.** `validateTitle(value)` returns `""` or the message.
The caller gets the text for free and the rule stays in one place.

**Focus moves to the first invalid field.** Otherwise a keyboard user has to tab through the whole
form hunting for the problem.

**`aria-describedby` + `role="alert"`.** Each input points at both its error span and its hint, so
a screen reader announces the message as part of the field. The summary box carries `role="alert"`
and is read the moment it appears.

## Rules enforced

| Field | Checks |
|-------|--------|
| Title | required, 3–80 characters, trimmed first |
| Priority | required, must be one of three |
| Due date | required, real date, not past, under two years out |
| Hours | required, numeric, > 0, ≤ 100 |
| Email | optional — but if present needs `@`, a domain and a dot |

## The one thing to remember

Client-side validation is a **courtesy to the user, not a security control**. Anyone can open
DevTools, delete the handler and submit whatever they like. Every rule here has to exist on the
server too. What this code buys you is a fast, clear correction loop — not safety.
