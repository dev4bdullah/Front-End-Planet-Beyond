import { useEffect, useReducer, useRef } from "react";
import { read, write } from "./useLocalStorage";

/* Task 11 — useReducer, with the state written to localStorage on change.

   Two things this handles that a naive version doesn't:

   1. A version number. When the shape changes, old saved data is discarded
      rather than crashing the app with a half-migrated object.
   2. A `persist` function, so transient state (pending flags, selection) is
      stripped before saving. Persisting an in-flight operation means the app
      reloads believing a request is still running. */

export function usePersistedReducer(
  reducer,
  defaultState,
  { key, version = 1, persist = state => state, hydrate = saved => saved } = {}
) {
  const [state, dispatch] = useReducer(reducer, defaultState, initial => {
    const saved = read(key, null);

    if (!saved || saved.__v !== version) {
      if (saved)
        console.warn(`Discarding saved state for "${key}" — version ${saved.__v} ≠ ${version}`);
      return initial;
    }

    // Spread over the default, so a key added later is never undefined
    return { ...initial, ...hydrate(saved.data) };
  });

  // Skip the very first write, or mounting immediately overwrites saved data
  // with the default state on any run where hydration was rejected.
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    write(key, { __v: version, savedAt: new Date().toISOString(), data: persist(state) });
    // `persist` is usually an inline arrow; including it would write on every render
  }, [state, key, version]);

  return [state, dispatch];
}
