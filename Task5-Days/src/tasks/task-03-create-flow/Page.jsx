import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "@store/CrudContext";
import { useToast } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import { SCHEMAS, ENTITIES, titleOf } from "@model/model";
import Modal from "./components/Modal";
import RecordForm from "./components/RecordForm";
import RecordCard from "@tasks/task-02-read-views/components/RecordCard";

export default function Page() {
  const { state, actions, visible } = useCrud();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [inline, setInline] = useState(false);

  const rows = visible().slice(0, 4);

  function handleCreate(values) {
    actions.create(state.entity, values);
    toast.success(`${titleOf(state.entity, values)} created.`, {
      title: `${SCHEMAS[state.entity].label} added`
    });
    setModalOpen(false);
    setInline(false);
  }

  return (
    <>
      <PageHeader
        number={3}
        title="Create Flow"
        brief="Build an add-record modal or page form with reusable input components"
        lead="One form component, two containers. The form doesn't know whether it's in a modal or on a page."
        actions={
          <>
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
            <button type="button" className="btn" onClick={() => setModalOpen(true)}>
              New {SCHEMAS[state.entity].label.toLowerCase()}
            </button>
          </>
        }
      />

      <Section
        title="Modal or inline — same component"
        note="RecordForm takes the entity, initial values and a submit callback. Where it renders is the caller's problem, which is why it works in both."
        code={`// in a modal
<Modal open={open} onClose={close} title="New product"
       footer={<button form="record-form" type="submit">Create</button>}>
  <RecordForm entity={entity} onSubmit={handleCreate} />
</Modal>

// on a page — identical component
<RecordForm entity={entity} onSubmit={handleCreate} onCancel={close} />`}
      >
        <div className="row">
          <button type="button" className="btn btn--sm" onClick={() => setModalOpen(true)}>
            Open the modal
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => setInline(value => !value)}
          >
            {inline ? "Hide the inline form" : "Show the inline form"}
          </button>
        </div>

        {inline && (
          <div className="card">
            <RecordForm
              entity={state.entity}
              id="inline-form"
              submitLabel={`Create ${SCHEMAS[state.entity].label.toLowerCase()}`}
              onSubmit={handleCreate}
              onCancel={() => setInline(false)}
            />
          </div>
        )}
      </Section>

      <Section title="Most recent records">
        {rows.length === 0 ? (
          <div className="state">
            <strong>Nothing here yet</strong>
            <p>Create the first one with the button above.</p>
          </div>
        ) : (
          <div className="cards">
            {rows.map(record => (
              <RecordCard key={record.id} entity={state.entity} record={record} actions={false} />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="A modal that behaves"
        note="Five things a hand-rolled modal usually misses. All five are in components/Modal.jsx."
        code={`useEffect(() => {
  if (!open) return undefined;

  lastFocused.current = document.activeElement;      // 1. remember the trigger
  const previous = document.body.style.overflow;
  document.body.style.overflow = "hidden";           // 2. lock scroll

  focusables()[0]?.focus();                          // 3. focus moves inside

  function onKeyDown(event) {
    if (event.key === "Escape") onClose?.();         // 4. escape closes
    if (event.key === "Tab") { /* wrap focus */ }    // 5. focus trap
  }

  return () => {
    document.body.style.overflow = previous;         // restore, don't assume ""
    lastFocused.current?.focus?.();                  // focus returns
  };
}, [open, onClose]);`}
      >
        <ul className="list">
          {[
            'role="dialog" and aria-modal="true", so a screen reader treats it as a layer',
            "createPortal, so no ancestor's overflow:hidden can clip it",
            "the backdrop closes it on mousedown, but only when the backdrop itself is the target",
            "focus returns to the button that opened it — otherwise a keyboard user is dropped at the top of the page",
            'the scroll lock restores the previous value rather than setting ""'
          ].map(item => (
            <li className="list__item" key={item}>
              <span className="list__text tiny">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Fields generated from the schema"
        note="RecordForm maps over SCHEMAS[entity].fields. Adding a field to the model puts an input on every create and edit form automatically."
        code={`{SCHEMAS[entity].fields.map(field => (
  <Field
    key={field.name}
    field={field}
    value={form.values[field.name]}
    error={form.errorFor(field.name)}
    onChange={form.setValue}
    onBlur={form.handleBlur}
  />
))}`}
      >
        <p className="section__note">
          Switch the entity in the header and reopen the modal — the same component renders a
          different form, because the schema changed and nothing else did.
        </p>
      </Section>

      <Section
        title="The submit button lives in the modal footer"
        note="A button outside a form can still submit it, using the form attribute. Without that, the footer button would need a click handler that reaches into the form — or the form's own buttons end up above the footer, which looks wrong."
        code={`<form id="record-form">…</form>

<button type="submit" form="record-form">Create</button>   // outside the form, still submits it`}
      >
        <p className="section__note">
          It also means <kbd>Enter</kbd> in a text field submits, which people expect and
          hand-rolled dialogs frequently break.
        </p>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`New ${SCHEMAS[state.entity].label.toLowerCase()}`}
      >
        <RecordForm
          entity={state.entity}
          id="record-form"
          submitLabel="Create"
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  );
}
