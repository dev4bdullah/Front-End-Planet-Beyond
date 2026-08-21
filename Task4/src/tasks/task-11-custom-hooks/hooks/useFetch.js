import { useCallback, useEffect, useRef, useState } from "react";

/* Task 11 — the hook every data page in this project uses.

   Task 10's cleanup rules are baked in: an AbortController cancels the request
   on unmount or when the dependencies change, and an `active` flag stops a
   late response writing to an unmounted component. */

export function useFetch(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // The fetcher is usually an inline arrow, so it has a new identity every
  // render. Holding it in a ref keeps it out of the dependency array.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const retry = useCallback(() => setReloadKey(key => key + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetcherRef
      .current({ signal: controller.signal })
      .then(result => {
        if (active) setData(result);
      })
      .catch(err => {
        // A cancelled request is not a failure — never show it to the user
        if (active && err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // The deps come from the caller's array, which a static analyser can't
    // verify — the trade-off every hook of this shape makes.
  }, [...deps, reloadKey, enabled]);

  return { data, loading, error, retry };
}
