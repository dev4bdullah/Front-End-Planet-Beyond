# Task 12 — Optimistic UI

> Sheet description: Update UI immediately for create/update/delete and rollback state if the simulated API call fails

## The shape

```js
const before = { ...record };                    // 1. snapshot — BEFORE the update

actions.update(entity, record.id, changes);      // 2. update immediately
actions.markPending(record.id);

try {
  await api.update(record.id, changes);          // 3. reconcile
  actions.clearPending(record.id);
} catch (error) {
  actions.update(entity, record.id, before);     //    …or roll back
  actions.markFailed(record.id);
  toast.error(error.message, { actionLabel: "Retry", onAction: retry });
}
```

The snapshot has to be taken **before** the update. Reading the record afterwards gives you the
optimistic value, and the rollback restores the thing you were trying to undo.

## Controlling the simulation

`lib/fakeApi.js` exposes a latency slider and a failure rate. Set failures to 100% and every
operation rolls back — that path is the one worth watching, since the happy path looks identical
either way.

## Optimistic or pessimistic

| | Optimistic | Pessimistic |
|---|-----------|-------------|
| Feels | instant | as slow as the network |
| On failure | the UI must undo something the user saw | nothing changed; just show the error |
| Good for | likely-to-succeed, low-stakes writes | payments, deletions, anything irreversible |

A like button is optimistic. A bank transfer is not. Most CRUD sits between, and the usual answer is
optimistic for updates, pessimistic for deletes.

The page has both buttons side by side — press them with latency at 2000ms.

## Four things that go wrong

1. **No snapshot** — you roll back to the optimistic value
2. **Ids from the server** — an optimistic create invents an id locally; the server may return a
   different one. Without reconciling, the next update targets a record that doesn't exist
   server-side. Invisible in this demo, because there's no real server to disagree.
3. **No pending flag** — a user edits a row twice while the first save is in flight, and the
   responses land out of order
4. **Silent rollback** — the row snaps back with no explanation, which reads as a bug. Always pair a
   rollback with a toast, ideally with Retry.

## React 19 has `useOptimistic`

It handles the revert for you, but it's tied to transitions and doesn't give you the per-record
pending and failed flags this page uses. Worth knowing it exists; the manual version is what it does
underneath.
