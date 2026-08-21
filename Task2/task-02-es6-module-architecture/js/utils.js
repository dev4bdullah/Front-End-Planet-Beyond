// Pure helpers. No DOM, no storage, no fetch — so anything can import this safely.

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
