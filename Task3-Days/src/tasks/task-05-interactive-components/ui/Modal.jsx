import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@ui";

/* A modal is where accessibility usually gets skipped. This one handles:
   Escape to close, focus moved in on open and restored on close, a focus trap
   on Tab, a locked body scroll, and a portal so it escapes any overflow:hidden. */

export default function Modal({ open, onClose, title, children, footer }) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    lastFocused.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first control inside, or the panel itself
    const focusables = () =>
      panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ?? [];

    focusables()[0]?.focus() ?? panelRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const items = [...focusables()];
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      // Wrap focus rather than letting it escape to the page behind
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal__backdrop"
      onMouseDown={event => event.target === event.currentTarget && onClose?.()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="modal__head">
          <h3 className="modal__title">{title}</h3>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="small">{children}</div>

        <div className="modal__footer">
          {footer ?? (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
