import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "@store/CrudContext";
import { useToast } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import { SCHEMAS, ENTITIES, titleOf, formatRelative } from "@model/model";
import Modal from "@tasks/task-03-create-flow/components/Modal";
import RecordForm from "@tasks/task-03-create-flow/components/RecordForm";
import RecordTable from "@tasks/task-02-read-views/components/RecordTable";

export default function Page() {
  const { state, actions, visible, find } = useCrud();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState(null);
  const [lastDiff, setLastDiff] = useState(null);

  const editing = editingId ? find(state.entity, editingId) : null;
  const rows = visible();

  function handleUpdate(values) {
    const before = find(state.entity, editingId);

    // Only report the fields that actually changed — "record updated" when
    // nothing moved is a lie the user can detect
    const changed = Object.entries(values).filter(
      ([key, value]) => String(before[key] ?? "") !== String(value ?? "")
    );

    actions.update(state.entity, editingId, values);
    setLastDiff({ id: editingId, title: titleOf(state.entity, before), changed });

    toast.success(
      changed.length
        ? `${changed.length} field${changed.length === 1 ? "" : "s"} updated.`
        : "Saved — nothing had changed.",
      { title: titleOf(state.entity, values) }
    );

    setEditingId(null);
  }

  return (
    <>
      <PageHeader
        number={4}
        title="Update Flow"
        brief="Pre-fill edit forms, update selected records, and preserve unchanged fields correctly"
        lead="The hard part isn't the form. It's making sure a save can't quietly blank a field nobody touched."
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
        title="Edit any row"
        note="The form is pre-filled from the record, and the modal is keyed by record id — so opening a different row rebuilds the form rather than showing the previous record's values."
      >
        {rows.length === 0 ? (
          <div className="state">
            <strong>No records</strong>
            <p>Create one in task 3.</p>
          </div>
        ) : (
          <RecordTable
            entity={state.entity}
            records={rows}
            onEdit={record => setEditingId(record.id)}
            onDelete={record =>
              toast.info("Deleting lives in task 5.", { title: titleOf(state.entity, record) })
            }
          />
        )}
      </Section>

      {lastDiff && (
        <Section title="What the last save actually changed">
          {lastDiff.changed.length === 0 ? (
            <p className="section__note">
              Nothing — the form was submitted unchanged, and <code>updatedAt</code> is the only
              field that moved.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>New value</th>
                </tr>
              </thead>
              <tbody>
                {lastDiff.changed.map(([field, value]) => (
                  <tr key={field}>
                    <td>
                      <code>{field}</code>
                    </td>
                    <td>{String(value) || <span className="muted">(empty)</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      <Section
        title="Pre-filling, and the key that matters"
        note="A modal that stays mounted keeps its form state. Without a key on the record id, opening product B after product A shows A's values in B's form — a bug that only appears on the second edit."
        code={`// ❌ the form keeps the previous record's state
<Modal open={Boolean(editing)}>
  <RecordForm entity={entity} initial={editing} />
</Modal>

// ✅ a new key means a fresh form for each record
<Modal open={Boolean(editing)}>
  <RecordForm key={editing?.id} entity={entity} initial={editing} />
</Modal>`}
      >
        <p className="section__note">
          Edit one row, cancel, then edit a different one. With the key, the second form is correct.
          Remove it and you get the first record&apos;s values under the second record&apos;s title.
        </p>
      </Section>

      <Section
        title="Preserving untouched fields"
        note="The reducer merges rather than replaces, and re-applies the system fields after the spread — so a partial payload can't blank the rest of the record."
        code={`case ACTIONS.UPDATE: {
  const { entity, id, changes } = action.payload;

  return {
    ...state,
    records: {
      ...state.records,
      [entity]: state.records[entity].map(record =>
        record.id === id
          ? updateRecord(record, pickSchemaValues(entity, { ...record, ...changes }))
          : record
      )
    }
  };
}

// pickSchemaValues drops anything the schema doesn't declare, so an edit
// form can never smuggle an extra key into a record.`}
      >
        <div className="grid">
          <div className="card card--flat">
            <p className="tiny muted">Merge</p>
            <pre className="code">{`{ ...record, ...changes }
// untouched fields survive`}</pre>
          </div>
          <div className="card card--flat">
            <p className="tiny muted">Replace</p>
            <pre className="code">{`{ id, ...changes }
// every field not in the form
// silently becomes undefined`}</pre>
          </div>
        </div>
      </Section>

      <Section
        title="Two details worth copying"
        code={`// 1. report what actually changed, not "record updated"
const changed = Object.entries(values).filter(
  ([key, value]) => String(before[key] ?? "") !== String(value ?? "")
);

// 2. updatedAt moves on every save; createdAt never does
updatedAt: new Date().toISOString(),
createdAt: record.createdAt`}
      >
        <p className="section__note">
          Edit a record and change nothing — the toast says so rather than claiming a save happened.
          The list below still reorders, because <code>updatedAt</code> did move; that&apos;s
          correct, and worth being honest about.
        </p>
        {rows[0] && (
          <p className="tiny muted">
            Most recently updated: {titleOf(state.entity, rows[0])} ·{" "}
            {formatRelative(rows[0].updatedAt)}
          </p>
        )}
      </Section>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditingId(null)}
        title={editing ? `Edit ${titleOf(state.entity, editing)}` : ""}
      >
        {editing && (
          /* The key is the point of this page — see the section above */
          <RecordForm
            key={editing.id}
            entity={state.entity}
            initial={editing}
            id="record-form"
            submitLabel="Save changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Modal>
    </>
  );
}
