import { useState } from "react";

/* `allowMultiple` switches the open state between a Set and a single id —
   one component covering both the FAQ and the exclusive-panel case. */

export default function Accordion({ items = [], allowMultiple = false, defaultOpen = [] }) {
  const [open, setOpen] = useState(new Set(defaultOpen));

  function toggle(id) {
    setOpen(previous => {
      const next = new Set(allowMultiple ? previous : []);
      if (previous.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="accordion">
      {items.map(item => {
        const isOpen = open.has(item.id);

        return (
          <div className="accordion__item" key={item.id}>
            <h3>
              <button
                type="button"
                className="accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                {item.title}
                <span
                  className={`accordion__icon ${isOpen ? "accordion__icon--open" : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
            </h3>

            {isOpen && (
              <div className="accordion__panel" id={`panel-${item.id}`} role="region">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
