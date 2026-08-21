import { useEffect, useState } from "react";
import Modal from "@tasks/task-03-create-flow/components/Modal";

/* Task 5 — a confirmation that's hard to dismiss by accident.

   Cancel is the default focus and the safe path; the destructive button is
   never the one you hit by pressing Enter out of habit. */

export default function ConfirmDialog({
  open,
  title = "Delete this record?",
  message,
  confirmLabel = "Delete",
  requireTyping,
  onConfirm,
  onCancel,
  busy = false
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const blocked = Boolean(requireTyping) && typed.trim() !== requireTyping;

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      danger
      footer={
        <>
          {/* Cancel is first, so it takes initial focus from the modal's
              focus trap — the safe action is the default one */}
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: "var(--bad)" }}
            onClick={onConfirm}
            disabled={busy || blocked}
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className="small">{message}</p>
      <p className="tiny muted">This cannot be undone from here.</p>

      {requireTyping && (
        <div className="field" style={{ marginTop: "0.5rem" }}>
          <label htmlFor="confirm-typing">
            Type <code>{requireTyping}</code> to confirm
          </label>
          <input
            id="confirm-typing"
            value={typed}
            onChange={event => setTyped(event.target.value)}
            autoComplete="off"
          />
        </div>
      )}
    </Modal>
  );
}
