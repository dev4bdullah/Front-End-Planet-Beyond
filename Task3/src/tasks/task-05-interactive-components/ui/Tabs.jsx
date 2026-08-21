import { useState, useId } from "react";

/* Uncontrolled by default (own state), controlled if a `value` prop is passed.
   Arrow keys move between tabs, which is what the ARIA tabs pattern expects. */

export default function Tabs({ items = [], value, onChange, defaultValue }) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const baseId = useId();

  const active = value ?? internal;

  function select(id) {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  }

  function onKeyDown(event) {
    const enabled = items.filter(item => !item.disabled);
    const index = enabled.findIndex(item => item.id === active);
    if (index === -1) return;

    let next = null;
    if (event.key === "ArrowRight") next = enabled[(index + 1) % enabled.length];
    if (event.key === "ArrowLeft") next = enabled[(index - 1 + enabled.length) % enabled.length];
    if (event.key === "Home") next = enabled[0];
    if (event.key === "End") next = enabled[enabled.length - 1];

    if (next) {
      event.preventDefault();
      select(next.id);
      document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
    }
  }

  const current = items.find(item => item.id === active);

  return (
    <div>
      <div className="tabs__list" role="tablist" onKeyDown={onKeyDown}>
        {items.map(item => (
          <button
            key={item.id}
            id={`${baseId}-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={item.id === active}
            aria-controls={`${baseId}-panel-${item.id}`}
            tabIndex={item.id === active ? 0 : -1}
            disabled={item.disabled}
            className={`tabs__tab ${item.id === active ? "tabs__tab--active" : ""}`}
            onClick={() => select(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        className="tabs__panel"
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
      >
        {current?.content}
      </div>
    </div>
  );
}
