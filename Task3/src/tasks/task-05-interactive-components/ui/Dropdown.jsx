import { useState, useRef, useEffect } from "react";
import { Button } from "@ui";

/* Closes on outside click, on Escape, and after choosing an item.
   Arrow keys move through the options. */

export default function Dropdown({ label = "Actions", items = [], align = "left" }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    }

    function onKeyDown(event) {
      const enabled = items.filter(item => !item.separator && !item.disabled);
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocused(index => (index + 1) % enabled.length);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocused(index => (index - 1 + enabled.length) % enabled.length);
      }
      if (event.key === "Enter" && focused >= 0) {
        enabled[focused]?.onSelect?.();
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, items, focused]);

  let enabledIndex = -1;

  return (
    <div className="dropdown" ref={wrapRef}>
      <Button
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(value => !value);
          setFocused(-1);
        }}
      >
        {label} ▾
      </Button>

      {open && (
        <ul
          className={`dropdown__menu ${align === "right" ? "dropdown__menu--right" : ""}`}
          role="menu"
        >
          {items.map((item, index) => {
            if (item.separator)
              return <li key={`sep-${index}`} className="dropdown__sep" role="separator" />;

            if (!item.disabled) enabledIndex += 1;
            const isFocused = !item.disabled && enabledIndex === focused;

            return (
              <li key={item.label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={`dropdown__item ${isFocused ? "dropdown__item--focused" : ""}`}
                  onClick={() => {
                    item.onSelect?.();
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
