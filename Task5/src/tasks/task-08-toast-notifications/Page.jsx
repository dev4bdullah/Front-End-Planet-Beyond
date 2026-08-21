import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useToast } from "./lib/ToastContext";

export default function Page() {
  const { toast, clear } = useToast();
  const [undone, setUndone] = useState(0);

  return (
    <>
      <PageHeader
        number={8}
        title="Toast Notifications"
        brief="Create success, error, warning, and info notifications through a ToastContext"
        lead="Four types, one context, and a stack that caps itself. Every CRUD action in Day 5 raises one."
        actions={
          <button type="button" className="btn btn--ghost btn--sm" onClick={clear}>
            Clear all
          </button>
        }
      />

      <Section
        title="The four types"
        note="Type carries meaning, not just colour. Success confirms something happened, error says it didn't, warning says it happened and you might not have wanted it, info is context."
        code={`const { toast } = useToast();

toast.success("Product created.");
toast.error("Could not reach the server.", { sticky: true });
toast.warning("Record deleted.", { actionLabel: "Undo", onAction: restore });
toast.info("Draft saved locally.");`}
      >
        <div className="row">
          <button
            type="button"
            className="btn btn--sm"
            style={{ background: "var(--ok)" }}
            onClick={() => toast.success("Mechanical keyboard created.")}
          >
            Success
          </button>
          <button
            type="button"
            className="btn btn--sm"
            style={{ background: "var(--bad)" }}
            onClick={() => toast.error("The server returned 500.", { sticky: true })}
          >
            Error (sticky)
          </button>
          <button
            type="button"
            className="btn btn--sm"
            style={{ background: "var(--warn)" }}
            onClick={() =>
              toast.warning("Desk lamp deleted.", {
                actionLabel: "Undo",
                sticky: true,
                onAction: () => {
                  setUndone(count => count + 1);
                  toast.success("Restored.");
                }
              })
            }
          >
            Warning with Undo
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => toast.info("Draft saved locally.")}
          >
            Info
          </button>
        </div>

        <p className="tiny muted">Undo pressed {undone} times.</p>
      </Section>

      <Section
        title="Four decisions in the implementation"
        code={`// 1. errors don't auto-dismiss — the user may not have been looking
sticky: type === "error"

// 2. hover pauses the timer, so a toast can't vanish while being read
onMouseEnter={() => setPaused(true)}

// 3. the stack is capped — twenty toasts from a bulk action is unusable
setToasts(list => [...list, next].slice(-max));

// 4. each toast clears its own timer on unmount, so dismissing by hand
//    doesn't leave a timer that fires into nothing
useEffect(() => {
  const id = setTimeout(() => onDismiss(id), duration);
  return () => clearTimeout(id);
}, [...]);`}
      >
        <div className="row">
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => {
              for (let index = 1; index <= 8; index += 1) {
                toast.info(`Bulk message ${index}`);
              }
            }}
          >
            Fire 8 at once
          </button>
          <span className="tiny muted">Only the last four survive — the stack is capped.</span>
        </div>
      </Section>

      <Section
        title="Why context rather than props"
        note="A toast is raised from wherever the action happened — a modal, a table row, a hook three layers down. Threading a callback to all of those is the exact problem context exists for."
        code={`// providers/AppProviders.jsx — mounted once
<ToastProvider>
  <App />
</ToastProvider>

// anywhere below it, at any depth
const { toast } = useToast();`}
      >
        <p className="section__note">
          The provider renders the viewport itself, so no page has to remember to include a{" "}
          <code>&lt;Toaster /&gt;</code> — a step that&apos;s easy to forget and produces a silently
          broken feature.
        </p>
      </Section>

      <Section
        title="The memo that matters"
        note="The provider re-renders on every toast. Without useMemo on the context value, every consumer in the app re-renders too — for a notification that has nothing to do with them."
        code={`const value = useMemo(() => ({
  toast: { success: …, error: …, warning: …, info: … },
  dismiss,
  clear
}), [push, dismiss]);

// push and dismiss are useCallback'd, so \`value\` is stable across toast changes`}
      >
        <p className="section__note">
          Note what&apos;s <em>not</em> in the value: the toast list. Consumers only need to raise
          toasts, not read them, so the list stays local to the provider and never reaches the
          context.
        </p>
      </Section>

      <Section
        title="Accessibility"
        code={`<div role="region" aria-label="Notifications" aria-live="polite">`}
      >
        <ul className="list">
          {[
            'aria-live="polite" — announced after the current sentence, not interrupting it',
            "assertive would be wrong for a save confirmation; reserve it for genuine alerts",
            'the dismiss button has an aria-label, since × alone reads as "times"',
            "hover-to-pause matters for anyone who reads slowly, not just for aesthetics"
          ].map(item => (
            <li className="list__item" key={item}>
              <span className="list__text tiny">{item}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
