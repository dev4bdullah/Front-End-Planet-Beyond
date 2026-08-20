import { useLocalStorage } from "./useLocalStorage";

/* UI preferences are persisted separately from the records.
   They change far more often, and losing them is harmless — so mixing them
   into the same key means rewriting the whole dataset on every view toggle. */

const DEFAULTS = {
  view: "cards",
  density: "cosy",
  showArchived: true,
  pageSize: 8
};

export function useUiPreferences() {
  const [prefs, setPrefs] = useLocalStorage("day5.ui.v1", DEFAULTS);

  const set = (key, value) => setPrefs(previous => ({ ...previous, [key]: value }));

  return [{ ...DEFAULTS, ...prefs }, set];
}
