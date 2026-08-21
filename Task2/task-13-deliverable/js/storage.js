/* Task 9 — the only file that knows localStorage exists. */

const KEY = "day2.taskManager.v1";
const VERSION = 1;

const defaults = {
  version: VERSION,
  tasks: [],
  filter: "all",
  search: "",
  sort: "created",
  theme: "light"
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };

    const parsed = JSON.parse(raw);
    if (parsed.version !== VERSION) {
      console.warn(`Migrating saved data from v${parsed.version ?? 0} to v${VERSION}`);
    }
    return { ...defaults, ...parsed, version: VERSION };
  } catch (err) {
    console.error("Saved data was unreadable, starting fresh:", err);
    return { ...defaults };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error("Could not save:", err);
    return false;
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}
