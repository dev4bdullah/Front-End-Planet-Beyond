import { useState } from "react";

export function PageHeader({ number, title, brief, lead, actions }) {
  return (
    <header className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <div className="stack" style={{ gap: "0.25rem", minWidth: 0 }}>
        <p className="page__eyebrow">Day 5 · Task {number}</p>
        <h1 className="page__title">{title}</h1>
        {lead && <p className="page__lead">{lead}</p>}
        {brief && <p className="page__brief">Sheet description: {brief}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  );
}

export function Section({ title, note, code, children }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">{title}</h2>
        {code && (
          <button type="button" className="btn btn--link btn--sm" onClick={() => setOpen(v => !v)}>
            {open ? "Hide code" : "Show code"}
          </button>
        )}
      </div>

      <div className="section__body">
        {note && <p className="section__note">{note}</p>}
        {children}
        {open && <pre className="code">{code.trim()}</pre>}
      </div>
    </section>
  );
}
