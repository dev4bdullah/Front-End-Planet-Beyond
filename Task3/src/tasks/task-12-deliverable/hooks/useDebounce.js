import { useState, useEffect } from "react";

/* Delays a fast-changing value. The cleanup is the whole mechanism:
   every keystroke clears the previous timer, so only the last one survives. */

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
