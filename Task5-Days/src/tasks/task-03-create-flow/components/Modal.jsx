import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/* A modal that behaves: Escape closes it, focus moves in on open and returns
   to the trigger on close, Tab wraps instead of escaping to the page behind,
   body scroll locks, and it renders through a portal so no ancestor's
   overflow can clip it. */

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  danger = false,
  labelledBy
}) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    lastFocused.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () => panelRef.current?.querySelectorAll(FOCUSABLE) ?? [];

    // Focus the first control, or the panel itself if there isn't one
    const first = focusables()[0];
    if (first) first.focus();
    else panelRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const items = [...focusables()];
      if (!items.length) return;

      const start = items[0];
      const end = items[items.length - 1];

      if (event.shiftKey && document.activeElement === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && document.activeElement === end) {
        event.preventDefault();
        start.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore the previous value rather than assuming ""
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
        ref={panelRef}
        className={`modal ${danger ? "modal--danger" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        aria-labelledby={labelledBy}
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

        {children}

        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
