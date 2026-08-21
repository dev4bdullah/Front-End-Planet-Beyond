import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "@store/CrudContext";
import { useToast } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import { createRecord } from "@model/model";
import { fakeApi, configure, getSettings } from "./lib/fakeApi";
import RecordCard from "@tasks/task-02-read-views/components/RecordCard";

export default function Page() {
  const { state, actions, visible, find } = useCrud();
  const { toast } = useToast();

  const [settings, setSettings] = useState(getSettings());
  const [log, setLog] = useState([]);
  const [pessimisticBusy, setPessimisticBusy] = useState(false);

  const rows = visible("products").slice(0, 4);

  function note(message) {
    setLog(list => [`${new Date().toLocaleTimeString()} — ${message}`, ...list].slice(0, 10));
  }

  function apply(next) {
    const merged = { ...settings, ...next };
    setSettings(merged);
    configure(merged);
  }

  /* ---------- optimistic create ---------- */
  async function optimisticCreate() {
    // The record is built up front, so it has an id before the request is sent
    const record = createRecord("products", {
      name: `Optimistic ${Math.floor(Math.random() * 900 + 100)}`,
      sku: "OP-1000",
      category: "peripherals",
      price: 49,
      stock: 5,
      status: "draft"
    });

    actions.create("products", null, record);
    actions.markPending(record.id);
    note(`UI updated immediately — ${record.id}`);

    try {
      await fakeApi.create(record);
      actions.clearPending(record.id);
      note(`server confirmed ${record.id}`);
      toast.success(`${record.name} saved.`);
    } catch (error) {
      // Roll back: the record was never real
      actions.markFailed(record.id);
      note(`rollback — ${error.message}`);

      setTimeout(() => {
        actions.remove("products", record.id);
        actions.clearPending(record.id);
      }, 1600);

      toast.error(`${record.name} could not be saved — the row was removed.`, { sticky: true });
    }
  }

  /* ---------- optimistic update ---------- */
  async function optimisticUpdate(record) {
    const before = { ...record };
    const changes = { stock: Number(record.stock) + 1 };

    actions.update("products", record.id, changes);
    actions.markPending(record.id);
    note(`stock +1 shown immediately for ${record.id}`);

    try {
      await fakeApi.update(record.id, changes);
      actions.clearPending(record.id);
      note(`server confirmed the update`);
    } catch (error) {
      // Roll back to the snapshot taken before the change
      actions.update("products", record.id, before);
      actions.markFailed(record.id);
      note(`rollback — restored stock ${before.stock}`);
      toast.error(error.message, {
        sticky: true,
        actionLabel: "Retry",
        onAction: () => optimisticUpdate(find("products", record.id) ?? before)
      });
    }
  }

  /* ---------- the pessimistic comparison ---------- */
  async function pessimisticUpdate(record) {
    setPessimisticBusy(true);
    note(`waiting for the server before showing anything…`);

    try {
      await fakeApi.update(record.id, { stock: Number(record.stock) + 1 });
      actions.update("products", record.id, { stock: Number(record.stock) + 1 });
      note(`server confirmed, THEN the UI updated`);
      toast.success("Saved.");
    } catch (error) {
      note(`failed — nothing ever changed on screen`);
      toast.error(error.message);
    } finally {
      setPessimisticBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        number={12}
        title="Optimistic UI"
        brief="Update UI immediately for create/update/delete and rollback state if the simulated API call fails"
        lead="Show the result first, reconcile after. The interesting half is what happens when the request fails."
      />

      <Section
        title="Control the simulated API"
        note="Set the failure rate to 100% and every operation below rolls back. That path is the one worth watching — the happy path looks the same either way."
      >
        <div className="toolbar">
          <div>
            <label htmlFor="latency">Latency: {settings.latency}ms</label>
            <input
              id="latency"
              type="range"
              min="0"
              max="3000"
              step="100"
              value={settings.latency}
              onChange={event => apply({ latency: Number(event.target.value) })}
            />
          </div>
          <div>
            <label htmlFor="failure">Failure rate: {Math.round(settings.failureRate * 100)}%</label>
            <input
              id="failure"
              type="range"
              min="0"
              max="1"
              step="0.25"
              value={settings.failureRate}
              onChange={event => apply({ failureRate: Number(event.target.value) })}
            />
          </div>
        </div>

        <div className="row">
          <button type="button" className="btn btn--sm" onClick={optimisticCreate}>
            Optimistic create
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            disabled={!rows[0]}
            onClick={() => optimisticUpdate(rows[0])}
          >
            Optimistic update (stock +1)
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            disabled={!rows[0] || pessimisticBusy}
            onClick={() => pessimisticUpdate(rows[0])}
          >
            {pessimisticBusy ? "Waiting for the server…" : "Pessimistic update (compare)"}
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => apply({ failureRate: 1 })}
          >
            Force failure
          </button>
        </div>

        <div className="cards">
          {rows.map(record => (
            <RecordCard
              key={record.id}
              entity="products"
              record={record}
              pending={state.pending.includes(record.id)}
              failed={state.failed.includes(record.id)}
              actions={false}
            />
          ))}
        </div>

        <div className="log">
          {log.length ? (
            log.map((line, index) => <div key={index}>&gt; {line}</div>)
          ) : (
            <div>&gt; nothing yet</div>
          )}
        </div>
      </Section>

      <Section
        title="The shape"
        note="Three steps, and the third is the one people skip."
        code={`async function optimisticUpdate(record) {
  const before = { ...record };                    // 1. snapshot

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
}`}
      >
        <p className="section__note">
          The snapshot has to be taken <em>before</em> the update. Reading the record afterwards
          gives you the optimistic value, and the rollback restores the thing you were trying to
          undo.
        </p>
      </Section>

      <Section
        title="Optimistic or pessimistic"
        note="Press both buttons above with latency at 2000ms and the difference is obvious. Which is correct depends entirely on the cost of being wrong."
      >
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Optimistic</th>
              <th>Pessimistic</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Feels", "instant", "as slow as the network"],
              ["On success", "nothing visibly happens — it already did", "the change appears"],
              [
                "On failure",
                "the UI has to undo something the user saw",
                "nothing changed; just show the error"
              ],
              [
                "Good for",
                "likely-to-succeed, low-stakes writes",
                "payments, deletions, anything irreversible"
              ],
              ["Risk", "the user acts on a state that turns out false", "none, beyond the wait"]
            ].map(([aspect, optimistic, pessimistic]) => (
              <tr key={aspect}>
                <td className="muted">{aspect}</td>
                <td>{optimistic}</td>
                <td>{pessimistic}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="section__note">
          A like button is optimistic. A bank transfer is not. Most CRUD sits in between, and the
          usual answer is optimistic for updates, pessimistic for deletes.
        </p>
      </Section>

      <Section
        title="Signalling the in-between state"
        note="A row that's been updated optimistically is not yet true. Dimming it is honest without being alarming — the user can keep working, and knows this one isn't settled."
        code={`// the reducer holds the flags next to the data they mark
case ACTIONS.MARK_PENDING:
  return { ...state, pending: [...state.pending, id],
                     failed: state.failed.filter(x => x !== id) };

// the card reads them
<RecordCard pending={state.pending.includes(record.id)}
            failed={state.failed.includes(record.id)} />`}
      >
        <p className="section__note">
          Set latency to 3000ms and press optimistic create — the card appears dimmed, with
          &ldquo;Saving…&rdquo;, and settles when the server confirms.
        </p>
      </Section>

      <Section
        title="Four things that go wrong"
        code={`// 1. no snapshot — you roll back to the optimistic value
const before = { ...record };            // BEFORE the update

// 2. ids from the server — an optimistic create invents an id locally, and
//    the server may return a different one. Reconcile, or the next update
//    targets a record that doesn't exist server-side.

// 3. no pending flag — a user edits a row twice while the first save is in
//    flight, and the responses land out of order

// 4. silent rollback — the row snaps back with no explanation, which reads
//    as a bug. Always pair a rollback with a toast, ideally with Retry.`}
      >
        <p className="section__note">
          Point 2 is the one that bites in real apps and is invisible in a demo like this: the
          locally-generated <code>prd_…</code> id is never replaced, because there&apos;s no real
          server to disagree with it.
        </p>
      </Section>

      <Section
        title="React has a hook for this"
        code={`// React 19's useOptimistic, for the common case
const [optimisticItems, addOptimistic] = useOptimistic(items, (state, next) => [...state, next]);

// It reverts automatically when the transition completes.
// The manual version here is what it does underneath — and is still what
// you need when the rollback isn't a simple revert, or the pending state
// has to survive longer than a transition.`}
      >
        <p className="section__note">
          Worth knowing it exists. It handles the revert for you, but it&apos;s tied to transitions
          and doesn&apos;t give you the per-record pending and failed flags this page uses.
        </p>
      </Section>
    </>
  );
}
