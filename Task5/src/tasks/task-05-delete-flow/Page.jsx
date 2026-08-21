import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "@store/CrudContext";
import { useToast } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import { SCHEMAS, ENTITIES, titleOf } from "@model/model";
import ConfirmDialog from "./components/ConfirmDialog";
import RecordTable from "@tasks/task-02-read-views/components/RecordTable";

export default function Page() {
  const { state, actions, visible } = useCrud();
  const { toast } = useToast();

  const [target, setTarget] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const rows = visible();

  function handleDelete() {
    const record = target;
    // Capture the position before removing, so an undo puts it back where it
    // was rather than at the top
    const index = state.records[state.entity].findIndex(item => item.id === record.id);

    actions.remove(state.entity, record.id);
    setTarget(null);

    toast.warning(`${titleOf(state.entity, record)} deleted.`, {
      title: "Deleted",
      actionLabel: "Undo",
      sticky: true,
      onAction: () => {
        actions.restore(state.entity, record, index);
        toast.success("Restored.", { title: titleOf(state.entity, record) });
      }
    });
  }

  function handleBulkDelete() {
    const ids = state.selected;
    const removed = state.records[state.entity].filter(record => ids.includes(record.id));

    actions.removeMany(state.entity, ids);
    setBulkOpen(false);

    toast.warning(`${ids.length} records deleted.`, {
      title: "Bulk delete",
      actionLabel: "Undo all",
      sticky: true,
      onAction: () => {
        removed.forEach(record => actions.restore(state.entity, record, 0));
        toast.success(`${removed.length} restored.`);
      }
    });
  }

  return (
    <>
      <PageHeader
        number={5}
        title="Delete Flow"
        brief="Add confirmation modal before deletion and show safe cancel/confirm actions"
        lead="A confirmation is not a speed bump — it's the last chance to notice you clicked the wrong row."
        actions={
          <select
            aria-label="Entity"
            value={state.entity}
            onChange={event => actions.setEntity(event.target.value)}
            style={{ width: "auto" }}
          >
            {ENTITIES.map(name => (
              <option key={name} value={name}>
                {SCHEMAS[name].plural}
              </option>
            ))}
          </select>
        }
      />

      <Section
        title="Delete, with a way back"
        note="Every delete raises a sticky toast with an Undo. The record is restored to its original index, so undoing doesn't reorder the list."
      >
        {state.selected.length > 0 && (
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="chip">{state.selected.length} selected</span>
            <span className="row">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={actions.clearSelection}
              >
                Clear selection
              </button>
              <button
                type="button"
                className="btn btn--sm"
                style={{ background: "var(--bad)" }}
                onClick={() => setBulkOpen(true)}
              >
                Delete {state.selected.length}
              </button>
            </span>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="state">
            <strong>Nothing left</strong>
            <p>Reset the store in task 11, or create a record in task 3.</p>
          </div>
        ) : (
          <>
            <div className="list">
              {rows.slice(0, 6).map(record => (
                <label className="list__item" key={record.id} style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={state.selected.includes(record.id)}
                    onChange={() => actions.toggleSelect(record.id)}
                    style={{ width: "auto" }}
                    aria-label={`Select ${titleOf(state.entity, record)}`}
                  />
                  <span className="list__text">{titleOf(state.entity, record)}</span>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    style={{ color: "var(--bad)" }}
                    onClick={() => setTarget(record)}
                  >
                    Delete
                  </button>
                </label>
              ))}
            </div>
            {rows.length > 6 && <p className="tiny muted">…and {rows.length - 6} more</p>}
          </>
        )}
      </Section>

      <Section
        title="Four rules for a destructive confirmation"
        code={`// 1. name the thing — "Delete this item?" gives the user nothing to check
<p>Delete "{record.name}"? This cannot be undone.</p>

// 2. Cancel is FIRST in the DOM, so the focus trap lands on it
<button onClick={onCancel}>Cancel</button>
<button onClick={onConfirm} className="danger">Delete</button>

// 3. the destructive button is never the Enter default

// 4. for a bulk or irreversible action, require typing the name
requireTyping={record.name}`}
      >
        <p className="section__note">
          Rule 2 matters more than it looks. Escape and Enter are both muscle memory; if the
          destructive action is what Enter triggers, the dialog has made things worse rather than
          safer.
        </p>
      </Section>

      <Section
        title="Confirmation or undo"
        note="They solve the same problem in opposite directions, and knowing which to use is the actual decision."
      >
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Confirm first</th>
              <th>Undo after</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Interrupts", "always, including the 99% of correct clicks", "never"],
              ["Best for", "genuinely irreversible things", "anything you can restore"],
              ["Cost of a mistake", "none — you didn't do it", "brief, if the undo is reachable"],
              [
                "Failure mode",
                "people click through it without reading",
                "the toast vanishes before it's noticed"
              ]
            ].map(([aspect, confirm, undo]) => (
              <tr key={aspect}>
                <td className="muted">{aspect}</td>
                <td>{confirm}</td>
                <td>{undo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="section__note">
          This page uses both, which is belt and braces for a demo. In real use, pick one: undo for
          a single row, confirmation for a bulk delete — the undo toast for twenty records is easy
          to miss.
        </p>
      </Section>

      <Section
        title="Restoring to the right index"
        code={`// capture the position BEFORE deleting
const index = state.records[entity].findIndex(item => item.id === record.id);
actions.remove(entity, record.id);

// the reducer splices it back where it was
case ACTIONS.RESTORE: {
  const list = [...state.records[entity]];
  list.splice(Math.min(index, list.length), 0, record);
  return { ...state, records: { ...state.records, [entity]: list } };
}`}
      >
        <p className="section__note">
          Pushing a restored record to the front is the easy version, and it looks broken — the row
          reappears somewhere the user wasn&apos;t looking.
        </p>
      </Section>

      <ConfirmDialog
        open={Boolean(target)}
        title={`Delete ${target ? titleOf(state.entity, target) : ""}?`}
        message={
          target
            ? `This removes the ${SCHEMAS[state.entity].label.toLowerCase()} from the store. You can undo it from the toast.`
            : ""
        }
        onCancel={() => setTarget(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkOpen}
        title={`Delete ${state.selected.length} records?`}
        message="Bulk deletes are harder to undo one at a time, so this one asks you to type the count."
        confirmLabel={`Delete ${state.selected.length}`}
        requireTyping={String(state.selected.length)}
        onCancel={() => setBulkOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </>
  );
}
