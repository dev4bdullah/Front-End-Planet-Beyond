import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "@store/CrudContext";
import { useToast } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import { useAuth } from "@tasks/task-09-context-api/contexts/AuthContext";
import { useUiPreferences } from "@hooks";
import { SCHEMAS, ENTITIES, STATUS, titleOf } from "@model/model";
import { cx } from "@shared/cx";
import Modal from "@tasks/task-03-create-flow/components/Modal";
import RecordForm from "@tasks/task-03-create-flow/components/RecordForm";
import ConfirmDialog from "@tasks/task-05-delete-flow/components/ConfirmDialog";
import RecordCard from "@tasks/task-02-read-views/components/RecordCard";
import RecordTable from "@tasks/task-02-read-views/components/RecordTable";
import { fakeApi } from "@tasks/task-12-optimistic-ui/lib/fakeApi";

export default function Page() {
  const { state, actions, visible, stats, find } = useCrud();
  const { toast } = useToast();
  const { can, role } = useAuth();
  const [prefs, setPref] = useUiPreferences();

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const schema = SCHEMAS[state.entity];
  const rows = visible();
  const counts = stats();
  const editing = editingId ? find(state.entity, editingId) : null;

  /* ---------- create ---------- */
  function handleCreate(values) {
    actions.create(state.entity, values);
    toast.success(`${titleOf(state.entity, values)} created.`, { title: `${schema.label} added` });
    setCreating(false);
  }

  /* ---------- update, optimistically ---------- */
  async function handleUpdate(values) {
    const before = find(state.entity, editingId);
    const id = editingId;

    actions.update(state.entity, id, values);
    actions.markPending(id);
    setEditingId(null);

    try {
      await fakeApi.update(id, values);
      actions.clearPending(id);
      toast.success(`${titleOf(state.entity, values)} saved.`);
    } catch (error) {
      actions.update(state.entity, id, before);
      actions.markFailed(id);
      toast.error(`${error.message} Your changes were rolled back.`, { sticky: true });
      setTimeout(() => actions.clearPending(id), 2000);
    }
  }

  /* ---------- delete, with undo ---------- */
  function handleDelete() {
    const record = deleting;
    const index = state.records[state.entity].findIndex(item => item.id === record.id);

    actions.remove(state.entity, record.id);
    setDeleting(null);

    toast.warning(`${titleOf(state.entity, record)} deleted.`, {
      title: "Deleted",
      sticky: true,
      actionLabel: "Undo",
      onAction: () => {
        actions.restore(state.entity, record, index);
        toast.success("Restored.");
      }
    });
  }

  function handleBulkDelete() {
    const ids = state.selected;
    const removed = state.records[state.entity].filter(record => ids.includes(record.id));

    actions.removeMany(state.entity, ids);
    setBulkOpen(false);

    toast.warning(`${ids.length} records deleted.`, {
      sticky: true,
      actionLabel: "Undo all",
      onAction: () => removed.forEach(record => actions.restore(state.entity, record, 0))
    });
  }

  return (
    <>
      <PageHeader
        number={13}
        title="Deliverable"
        brief="Build a complete React admin CRUD module with forms, validation, table actions, filters, confirmations, and README"
        lead={`Every task in one module. Signed in as ${role}.`}
        actions={
          can("create") && (
            <button type="button" className="btn" onClick={() => setCreating(true)}>
              New {schema.label.toLowerCase()}
            </button>
          )
        }
      />

      <Section title="Admin module">
        <div className="stack">
          {/* ---------- entity switch + stats ---------- */}
          <div className="row">
            {ENTITIES.map(name => (
              <button
                key={name}
                type="button"
                className={cx("btn", "btn--sm", state.entity === name ? "" : "btn--ghost")}
                onClick={() => actions.setEntity(name)}
              >
                {SCHEMAS[name].plural}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            <div className="viewswitch">
              {["cards", "table"].map(view => (
                <button
                  key={view}
                  type="button"
                  className={cx("btn", "btn--sm", prefs.view === view ? "" : "btn--ghost")}
                  onClick={() => setPref("view", view)}
                  aria-pressed={prefs.view === view}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="grid">
            {[
              ["Total", counts.total],
              ["Active", counts.active],
              ["Draft", counts.draft],
              ["Archived", counts.archived]
            ].map(([label, value]) => (
              <div className="stat" key={label}>
                <b>{value}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* ---------- filters ---------- */}
          <div className="toolbar">
            <div>
              <label htmlFor="d-search">Search</label>
              <input
                id="d-search"
                type="search"
                placeholder={`Search ${schema.searchFields.join(", ")}`}
                value={state.search}
                onChange={event => actions.setSearch(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="d-filter">Status</label>
              <select
                id="d-filter"
                value={state.filter}
                onChange={event => actions.setFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                {Object.entries(STATUS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="d-sort">Sort</label>
              <select
                id="d-sort"
                value={state.sort}
                onChange={event => actions.setSort(event.target.value)}
              >
                <option value="updated">Recently updated</option>
                <option value="created">Newest first</option>
                <option value="title">A–Z</option>
              </select>
            </div>
          </div>

          {/* ---------- bulk bar ---------- */}
          {state.selected.length > 0 && can("delete") && (
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="chip">{state.selected.length} selected</span>
              <span className="row">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={actions.clearSelection}
                >
                  Clear
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

          {/* ---------- the records ---------- */}
          {rows.length === 0 ? (
            <div className="state">
              <strong>
                {counts.total === 0 ? `No ${schema.plural.toLowerCase()} yet` : "Nothing matches"}
              </strong>
              <p>
                {counts.total === 0
                  ? "Create the first one, or reset the store in task 11."
                  : "Your search and filter excluded every record — the data is still there."}
              </p>
              {counts.total > 0 && (
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: "0.6rem" }}
                  onClick={() => {
                    actions.setSearch("");
                    actions.setFilter("all");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : prefs.view === "cards" ? (
            <div className="cards">
              {rows.map(record => (
                <RecordCard
                  key={record.id}
                  entity={state.entity}
                  record={record}
                  pending={state.pending.includes(record.id)}
                  failed={state.failed.includes(record.id)}
                  onEdit={r => setEditingId(r.id)}
                  onDelete={setDeleting}
                  actions={can("update") || can("delete")}
                />
              ))}
            </div>
          ) : (
            <RecordTable
              entity={state.entity}
              records={rows}
              pending={state.pending}
              failed={state.failed}
              onEdit={record => setEditingId(record.id)}
              onDelete={setDeleting}
              actions={can("update") || can("delete")}
            />
          )}

          <p className="tiny muted">
            Showing {rows.length} of {counts.total} · everything on this page survives a refresh
          </p>
        </div>
      </Section>

      <Section title="Where each task shows up">
        <table className="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Used here as</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["1 Data model", "the schema driving every form and column"],
              ["2 Read views", "the cards / table switch, with the choice remembered"],
              ["3 Create flow", "the New button opens a modal around RecordForm"],
              ["4 Update flow", "Edit pre-fills, keyed by record id, merges on save"],
              ["5 Delete flow", "a confirmation, plus an undo toast that restores the index"],
              ["6 Manual validation", "RecordForm's rules come from validation.js"],
              ["7 React Hook Form", "the alternative implementation, on its own page"],
              ["8 Toasts", "every action here raises one"],
              ["9 Context API", "theme, auth and toasts; can() gates the buttons"],
              ["10 useReducer", "every mutation is a dispatched action"],
              ["11 Local persistence", "records, filters and the view preference"],
              ["12 Optimistic UI", "editing updates instantly, and rolls back on failure"]
            ].map(([task, where]) => (
              <tr key={task}>
                <td>
                  <strong className="tiny">{task}</strong>
                </td>
                <td className="muted tiny">{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Try this">
        <ul className="list">
          {[
            "Create a record — it appears at the top and a toast confirms it",
            "Edit one and save: the change shows immediately, then settles when the fake API confirms",
            "Set the failure rate to 100% in task 12, then edit again — the change rolls back with an explanation",
            "Delete a row, then press Undo in the toast — it returns to its original position, not the top",
            "Switch to viewer in task 9, come back, and the action buttons are gone",
            "Filter to something with no matches — the empty state says why, and offers to clear",
            "Refresh the page — records, filters and the view preference are all still here"
          ].map(item => (
            <li className="list__item" key={item}>
              <span className="list__text tiny">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- dialogs ---------- */}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={`New ${schema.label.toLowerCase()}`}
      >
        <RecordForm
          entity={state.entity}
          id="record-form"
          submitLabel="Create"
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditingId(null)}
        title={editing ? `Edit ${titleOf(state.entity, editing)}` : ""}
      >
        {editing && (
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

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting ? titleOf(state.entity, deleting) : ""}?`}
        message={`This removes the ${schema.label.toLowerCase()} from the store. You can undo it from the toast.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkOpen}
        title={`Delete ${state.selected.length} records?`}
        message="Bulk deletes are harder to undo one at a time."
        confirmLabel={`Delete ${state.selected.length}`}
        requireTyping={String(state.selected.length)}
        onCancel={() => setBulkOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </>
  );
}
