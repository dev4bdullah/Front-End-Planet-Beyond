import { useEffect, useState } from "react";

/* The cleanup IS the mechanism: every keystroke clears the previous timer, so
   only the last one survives. Remove the return and you get one delayed
   update per keystroke instead of one per pause.

   It matters more on mobile than the web — every skipped request is battery
   and mobile data the user is paying for. */

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
