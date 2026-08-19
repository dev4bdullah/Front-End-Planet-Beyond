import { useState } from "react";

/* Every demo on every page uses this, so the layout stays consistent
   and each example can reveal its own source. */

export function Section({ title, note, code, children }) {
  const [showCode, setShowCode] = useState(false);

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">{title}</h2>
        {code && (
          <button
            type="button"
            className="btn btn--link btn--sm"
            onClick={() => setShowCode(v => !v)}
          >
            {showCode ? "Hide code" : "Show code"}
          </button>
        )}
      </div>

      {note && <p className="section__note">{note}</p>}

      {children}

      {showCode && <pre className="code">{code.trim()}</pre>}
    </section>
  );
}

export function PageHeader({ number, title, brief, lead }) {
  return (
    <header className="stack">
      <p className="page__eyebrow">Day 3 · Task {number}</p>
      <h1 className="page__title">{title}</h1>
      {lead && <p className="page__lead">{lead}</p>}
      {brief && <p className="page__brief">Sheet description: {brief}</p>}
    </header>
  );
}
