# Task 10 — UX States

> Sheet description: Implement skeletons, empty states, no-results states, unauthorized states, and retry states

## The seven states

Switch between them on the page — each is a real component from `components/states.jsx`.

| State | Means | The action |
|-------|-------|-----------|
| Loading | request in flight | skeleton matching the layout |
| Success | data arrived | the data |
| Empty | worked, genuinely no data | create the first one |
| No results | data exists, filter excluded it | clear the filters |
| Unauthorized | exists, you can't see it | request access |
| Error | broke, unknown if data exists | retry, with the reason |
| Offline | never left the browser | retry on reconnect |

## The three that get collapsed into one

Empty, no-results and error are different situations with different next steps. The one that causes
real support tickets is showing "no data" for a no-results case — the user believes their records
are gone.

`interactions.test.jsx` asserts the empty and no-results messages are genuinely different text, so a
future refactor can't quietly merge them.

## Skeletons, not spinners

A skeleton shaped like the content it replaces means nothing moves when the data lands. A centred
spinner guarantees a layout shift, because the spinner and the content are never the same size.

```jsx
<div aria-busy="true" aria-live="polite">
  <span className="sr-only">Loading dashboard data</span>
  {/* every skeleton box is aria-hidden */}
```

One announcement for the whole region. Otherwise a screen reader reads out fourteen meaningless
placeholders.

## Retry needs to say what it tried

A bare "Something went wrong" tells the user nothing about whether retrying is worth it. Include the
status, show the attempt count, and disable the button while in flight. The attempt counter is what
tells someone to stop pressing and report it instead.

## The eighth state

Partial failure — some widgets loaded, one crashed. That one belongs to task 9's per-widget
boundaries, and the deliverable uses both together.

## Where these get reused

`LoadingState` is the Suspense fallback for every lazy route in task 8. `UnauthorizedState` and
`ErrorRetryState` are wired into the deliverable's scenario switcher.
