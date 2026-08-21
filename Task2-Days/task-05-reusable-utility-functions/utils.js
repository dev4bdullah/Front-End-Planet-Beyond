/* Task 5 — small, pure, reusable helpers.
   Every function here takes its input as an argument and returns a value.
   None of them touch the DOM, localStorage or the network, which is what makes
   them safe to import anywhere and trivial to test. */

/* ---------- ids ---------- */

export function makeId(prefix = "") {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return prefix ? `${prefix}_${id}` : id;
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* ---------- dates ---------- */

export function formatDate(iso, style = "medium") {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  const options = {
    short: { day: "numeric", month: "short" },
    medium: { day: "numeric", month: "short", year: "numeric" },
    long: { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  };

  return date.toLocaleDateString(undefined, options[style] ?? options.medium);
}

export function relativeTime(iso) {
  const diff = new Date(iso) - new Date();
  const days = Math.round(diff / 86_400_000);

  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

export function daysFromNow(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function isOverdue(task) {
  if (task.done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}

/* ---------- labels ---------- */

const STATUS_LABELS = {
  todo: { text: "To do", tone: "low" },
  active: { text: "In progress", tone: "medium" },
  blocked: { text: "Blocked", tone: "high" },
  done: { text: "Complete", tone: "low" }
};

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? { text: "Unknown", tone: "medium" };
}

export function titleCase(value) {
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function truncate(value, max = 40) {
  const text = String(value);
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function pluralise(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/* ---------- search ---------- */

export function normalise(value) {
  return String(value).toLowerCase().trim().replace(/\s+/g, " ");
}

export function matchesSearch(item, query, keys) {
  const needle = normalise(query);
  if (!needle) return true;
  return keys.some(key => normalise(item[key] ?? "").includes(needle));
}

/* ---------- sorting ---------- */

export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function byKey(key, direction = "asc") {
  const factor = direction === "desc" ? -1 : 1;
  return (a, b) => {
    const left = a[key];
    const right = b[key];
    if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
    return String(left).localeCompare(String(right)) * factor;
  };
}

export function byPriority(a, b) {
  return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
}

/* ---------- numbers ---------- */

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function percent(part, whole) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

/* ---------- misc ---------- */

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

export function groupBy(list, keyFn) {
  return list.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
