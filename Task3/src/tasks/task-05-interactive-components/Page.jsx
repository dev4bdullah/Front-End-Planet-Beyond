import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Button, Badge, Input } from "@ui";
import { Modal, Tabs, Accordion, Dropdown, Switch, useToast } from "@interactive";

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notify, setNotify] = useState(true);
  const [compact, setCompact] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <PageHeader
        number={5}
        title="Interactive Components"
        brief="Build Modal, Tabs, Accordion, Dropdown, and Toast components with reusable props"
        lead="Six components where the hard part isn't the visuals — it's the keyboard, the focus and the cleanup."
      />

      <Section
        title="Modal"
        note="Escape closes it, focus moves inside on open and returns to the trigger on close, Tab wraps instead of escaping to the page behind, body scroll locks, and it renders through a portal so no ancestor's overflow:hidden can clip it."
        code={`<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Delete this task?"
  footer={
    <>
      <Button variant="ghost" onClick={close}>Cancel</Button>
      <Button variant="danger" onClick={remove}>Delete</Button>
    </>
  }
>
  This cannot be undone.
</Modal>`}
      >
        <div className="demo row">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Open confirm dialog
          </Button>
          <span className="tiny muted">Try Escape, then Tab repeatedly — focus stays inside.</span>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit profile">
          <div className="stack">
            <Input label="Display name" defaultValue="Syed Abdullah Ayaz" />
            <Input label="Email" type="email" defaultValue="abdullah@example.com" />
            <p className="tiny muted">
              Focus jumped to the first input when this opened, and returns to the button when it
              closes.
            </p>
          </div>
        </Modal>

        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Delete this task?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setConfirmOpen(false);
                  toast("Task deleted", "bad");
                }}
              >
                Delete
              </Button>
            </>
          }
        >
          This cannot be undone. The same Modal component — only the footer prop differs.
        </Modal>
      </Section>

      <Section
        title="Tabs"
        note="Uncontrolled by default, controlled if you pass a value. Arrow keys move between tabs and only the active one is tabbable, which is what the ARIA tabs pattern expects."
        code={`<Tabs
  items={[
    { id: "overview", label: "Overview", content: <p>...</p> },
    { id: "activity", label: "Activity", content: <p>...</p> },
    { id: "billing",  label: "Billing",  content: <p>...</p>, disabled: true }
  ]}
/>`}
      >
        <div className="demo">
          <Tabs
            items={[
              {
                id: "overview",
                label: "Overview",
                content: (
                  <p>
                    Focus a tab and press <kbd>←</kbd> / <kbd>→</kbd>. Only the selected tab is in
                    the tab order, so Tab jumps straight past the group to the panel.
                  </p>
                )
              },
              {
                id: "activity",
                label: "Activity",
                content: <p>Panel content is only mounted while its tab is active.</p>
              },
              {
                id: "settings",
                label: "Settings",
                content: (
                  <p>Each panel is linked to its tab with aria-controls and aria-labelledby.</p>
                )
              },
              {
                id: "billing",
                label: "Billing (disabled)",
                content: <p>Never shown.</p>,
                disabled: true
              }
            ]}
          />
        </div>
      </Section>

      <Section
        title="Accordion"
        note="One prop, allowMultiple, switches the open state between a Set and a single id — so the same component covers both an FAQ and an exclusive-panel sidebar."
        code={`<Accordion items={faq} defaultOpen={["a"]} />
<Accordion items={faq} allowMultiple />`}
      >
        <div className="grid">
          <div>
            <p className="tiny muted" style={{ marginBottom: "0.4rem" }}>
              Exclusive — opening one closes the other
            </p>
            <Accordion
              defaultOpen={["a"]}
              items={[
                {
                  id: "a",
                  title: "What is a controlled component?",
                  content: "One whose value comes from state and whose changes go through onChange."
                },
                {
                  id: "b",
                  title: "When should I use useReducer?",
                  content:
                    "When several pieces of state change together, or the next state depends on the previous one."
                },
                {
                  id: "c",
                  title: "Why do keys matter?",
                  content:
                    "They tell React which item is which across renders. Task 9 shows what breaks without stable ones."
                }
              ]}
            />
          </div>

          <div>
            <p className="tiny muted" style={{ marginBottom: "0.4rem" }}>
              allowMultiple — any number open at once
            </p>
            <Accordion
              allowMultiple
              items={[
                { id: "x", title: "First", content: "Open me and the others stay open." },
                { id: "y", title: "Second", content: "Same component, one different prop." },
                {
                  id: "z",
                  title: "Third",
                  content: "The open state is a Set instead of a single id."
                }
              ]}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Dropdown"
        note="Closes on outside click, on Escape, and after choosing. Arrow keys move through the options. The outside-click listener is added on open and removed in the effect cleanup — leave that out and every dropdown you ever open keeps a listener on the document forever."
        code={`<Dropdown
  label="Actions"
  items={[
    { label: "Edit",      onSelect: edit },
    { label: "Duplicate", onSelect: copy },
    { separator: true },
    { label: "Delete",    onSelect: remove }
  ]}
/>`}
      >
        <div className="demo row">
          <Dropdown
            label="Actions"
            items={[
              { label: "Edit task", onSelect: () => toast("Edit selected") },
              { label: "Duplicate", onSelect: () => toast("Duplicated", "ok") },
              { label: "Archive (disabled)", disabled: true },
              { separator: true },
              { label: "Delete", onSelect: () => toast("Deleted", "bad") }
            ]}
          />
          <Dropdown
            label="Sort"
            align="right"
            items={[
              { label: "Newest first", onSelect: () => toast("Sorted by date") },
              { label: "Priority", onSelect: () => toast("Sorted by priority") },
              { label: "A–Z", onSelect: () => toast("Sorted alphabetically") }
            ]}
          />
          <span className="tiny muted">Open one, then click anywhere outside it.</span>
        </div>
      </Section>

      <Section
        title="Toast"
        note="Context, so any component can call toast() without prop drilling through five layers. Each toast clears its own timer on unmount — dismiss one by hand and the timer must not fire afterwards."
        code={`// wrap the app once
<ToastProvider>
  <App />
</ToastProvider>

// then anywhere below it
const { toast } = useToast();
toast("Saved", "ok");`}
      >
        <div className="demo row">
          <Button onClick={() => toast("Changes saved", "ok")}>Success</Button>
          <Button variant="secondary" onClick={() => toast("Draft not yet published", "warn")}>
            Warning
          </Button>
          <Button variant="danger" onClick={() => toast("Could not reach the server", "bad")}>
            Error
          </Button>
          <Button variant="ghost" onClick={() => toast("Just some information")}>
            Neutral
          </Button>
        </div>
      </Section>

      <Section
        title="Switch"
        note="Wraps a real checkbox instead of styling a div. Keyboard support, form participation and screen-reader semantics all come free that way — a styled div needs role, tabIndex, aria-checked and a keydown handler to get halfway there."
        code={`<Switch checked={on} onChange={setOn} label="Email notifications" />`}
      >
        <div className="demo stack">
          <Switch checked={notify} onChange={setNotify} label="Email notifications" />
          <Switch checked={compact} onChange={setCompact} label="Compact layout" />
          <Switch checked={false} onChange={() => {}} label="Disabled" disabled />
          <p className="tiny muted">
            Notifications: <Badge tone={notify ? "ok" : "neutral"}>{notify ? "on" : "off"}</Badge>{" "}
            Layout:{" "}
            <Badge tone={compact ? "ok" : "neutral"}>{compact ? "compact" : "normal"}</Badge>
          </p>
          <p className="tiny muted">Tab to one and press Space — it toggles, with no extra code.</p>
        </div>
      </Section>
    </>
  );
}
