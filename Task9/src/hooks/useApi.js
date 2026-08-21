import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/* Task 11 — the hook every data screen uses.

   Two design decisions worth explaining, because both were forced by the
   react-hooks lint rules and both produced better code:

   1. `loading` is DERIVED, not stored. The settled result carries the
      dependency key it belongs to; if that key doesn't match the current one,
      we're loading. One less piece of state, and no setState in the effect
      body — which the compiler-aware rules flag as a cascading render.

   2. `refreshing` IS stored, and is separate from `loading`, because a
      pull-to-refresh must not blank the screen — the user is looking at the
      data they just pulled down. That one is a genuine mobile requirement,
      not a lint artefact.

   Deps are expected to be primitives (an id, a search string, a mode), which
   is what makes a string key sufficient. */

function keyOf(deps) {
  return deps.map(value => String(value)).join("\u0000");
}

export function useApi(fetcher, deps = [], { enabled = true, initialData = null } = {}) {
  const [result, setResult] = useState({ data: initialData, error: null, forKey: null });
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const currentKey = `${keyOf(deps)}#${reloadKey}`;

  /* The fetcher is usually an inline arrow with a new identity every render,
     so it lives in a ref rather than the dependency array — which would
     otherwise loop forever. A layout effect writes it, because assigning a
     ref during render isn't allowed. Layout effects run before passive ones,
     so it's always set before the fetching effect below reads it. */
  const fetcherRef = useRef(fetcher);
  useLayoutEffect(() => {
    fetcherRef.current = fetcher;
  });

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Derived: loading whenever the settled result belongs to a different
  // request than the one the current props describe.
  const loading = enabled && result.forKey !== currentKey;

  const retry = useCallback(() => setReloadKey(key => key + 1), []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const controller = new AbortController();

    try {
      const data = await fetcherRef.current({ signal: controller.signal });
      if (mounted.current) setResult({ data, error: null, forKey: currentKey });
    } catch (caught) {
      /* A failed refresh keeps the old data on screen and reports the error
         separately. Blanking a working list because a refresh failed is worse
         than showing data that's thirty seconds stale. */
      if (mounted.current && caught.name !== "AbortError") {
        setResult(previous => ({ ...previous, error: caught, forKey: currentKey }));
      }
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, [currentKey]);

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    let active = true;

    fetcherRef
      .current({ signal: controller.signal })
      .then(data => {
        if (active) setResult({ data, error: null, forKey: currentKey });
      })
      .catch(caught => {
        // A cancelled request is not a failure — never show it to the user
        if (active && caught.name !== "AbortError") {
          setResult({ data: null, error: caught, forKey: currentKey });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [currentKey, enabled]);

  const setData = useCallback(
    updater =>
      setResult(previous => ({
        ...previous,
        data: typeof updater === "function" ? updater(previous.data) : updater
      })),
    []
  );

  return {
    data: result.data,
    // Don't surface a stale error while a new request is in flight
    error: loading ? null : result.error,
    loading,
    refreshing,
    retry,
    refresh,
    setData
  };
}
