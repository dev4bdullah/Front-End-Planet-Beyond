/* Task 3 — the dynamic-className helper used across every page.
   Falsy values drop out, so `cx("btn", isActive && "btn--active")` is safe. */

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
