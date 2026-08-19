import { useState, useEffect } from "react";

/* Same API as useState, but the value survives a refresh.
   The initial read is lazy so it happens once, not on every render. */

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (err) {
      console.error("Could not read from storage:", err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Could not write to storage:", err);
    }
  }, [key, value]);

  return [value, setValue];
}
