// The only file in the project that knows localStorage exists.
// Swap this for an API later and nothing else changes.

const KEY = "day2.task02";

export function load(fallback = []) {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error("Could not read saved data:", err);
    return fallback;
  }
}

export function save(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch (err) {
    console.error("Could not save data:", err);
  }
}

export function clear() {
  localStorage.removeItem(KEY);
}
