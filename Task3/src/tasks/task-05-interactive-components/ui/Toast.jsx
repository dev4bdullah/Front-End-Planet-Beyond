import { createContext, useContext, useState, useCallback, useEffect } from "react";

/* Context so any component can call toast() without prop drilling —
   the pattern every toast library uses under the hood. */

const ToastContext = createContext(null);

export function ToastProvider({ children, duration = 3200 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => {
    setToasts(list => list.filter(item => item.id !== id));
  }, []);

  const toast = useCallback((message, tone = "brand") => {
    const id = Date.now() + Math.random();
    setToasts(list => [...list, { id, message, tone }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {toasts.map(item => (
          <ToastItem key={item.id} {...item} duration={duration} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ id, message, tone, duration, onDismiss }) {
  // The cleanup matters: dismiss it by hand and the timer must not fire later
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div className={`toast ${tone !== "brand" ? `toast--${tone}` : ""}`} role="status">
      <span className="toast__body">{message}</span>
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

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a <ToastProvider>");
  return context;
}
