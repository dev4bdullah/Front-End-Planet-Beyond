import { useEffect, useState } from "react";

/* The cleanup IS the mechanism: every keystroke clears the previous timer,
   so only the last one survives. Remove the return and you get one delayed
   update per keystroke instead of one per pause. */

export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
