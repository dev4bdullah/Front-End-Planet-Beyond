import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

/* Task 8 — toasts through context, so any component can notify without a prop
   being threaded down to it. */

const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children, duration = 4000, max = 4 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => {
    setToasts(list => list.filter(toast => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, options = {}) => {
      const id = ++nextId;

      setToasts(list => {
        const next = [...list, { id, type, message, ...options }];
        // Cap the stack — twenty toasts from a bulk action is unusable
        return next.slice(-max);
      });

      return id;
    },
    [max]
  );

  /* Memoised, or every consumer re-renders whenever the provider does —
     and the provider re-renders on every toast. */
  const value = useMemo(
    () => ({
      toast: {
        success: (message, options) => push("success", message, options),
        error: (message, options) => push("error", message, options),
        warning: (message, options) => push("warning", message, options),
        info: (message, options) => push("info", message, options)
      },
      dismiss,
      clear: () => setToasts([])
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} duration={duration} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss, duration }) {
  if (!toasts.length) return null;

  return (
    /* aria-live so a screen reader announces a toast; polite, not assertive,
       because interrupting mid-sentence for a save confirmation is hostile. */
    <div className="toasts" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} duration={duration} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  type,
  message,
  title,
  actionLabel,
  onAction,
  duration,
  sticky,
  onDismiss
}) {
  const timerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // An error, or a toast with an undo action, waits for the user
    if (sticky || paused) return undefined;

    timerRef.current = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timerRef.current);
  }, [id, duration, sticky, paused, onDismiss]);

  return (
    <div
      className={`toast toast--${type}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="toast__body">
        <p className="toast__title">{title ?? defaultTitle(type)}</p>
        <p className="toast__message">{message}</p>
        {onAction && (
          <button
            type="button"
            className="toast__action"
            onClick={() => {
              onAction();
              onDismiss(id);
            }}
          >
            {actionLabel ?? "Undo"}
          </button>
        )}
      </div>

      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

function defaultTitle(type) {
  return { success: "Saved", error: "Something went wrong", warning: "Careful", info: "Heads up" }[
    type
  ];
}

export function useToast() {
  const context = useContext(ToastContext);

  // Returning undefined here would surface later as "cannot read property
  // 'success' of undefined", far from the actual cause.
  if (!context) throw new Error("useToast must be used inside a <ToastProvider>");

  return context;
}
