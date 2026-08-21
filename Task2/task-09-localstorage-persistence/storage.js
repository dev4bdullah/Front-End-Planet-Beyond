/* The only file that knows localStorage exists.
   Everything is wrapped in try/catch because localStorage throws in three real situations:
   private browsing on older Safari, a full quota, and blocked third-party storage. */

const KEY = "day2.task09.state";
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

    // Old data from a previous shape — migrate rather than crash
    if (parsed.version !== VERSION) {
      console.warn(`Migrating saved data from v${parsed.version ?? 0} to v${VERSION}`);
      return { ...defaults, ...parsed, version: VERSION };
    }

    // Spread over defaults so a key added later is never undefined
    return { ...defaults, ...parsed };
  } catch (err) {
    console.error("Saved data was unreadable, starting fresh:", err);
    return { ...defaults };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return { ok: true };
  } catch (err) {
    const full = err.name === "QuotaExceededError";
    console.error("Could not save:", err);
    return { ok: false, message: full ? "Storage is full." : "Saving is unavailable." };
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}

export function rawState() {
  return localStorage.getItem(KEY);
}

export function storageSize() {
  const raw = localStorage.getItem(KEY);
  return raw ? new Blob([raw]).size : 0;
}

export function isAvailable() {
  try {
    const probe = "__probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
