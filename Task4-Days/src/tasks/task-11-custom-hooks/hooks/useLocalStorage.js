import { useEffect, useState } from "react";

/* Same API as useState, but the value survives a refresh.
   The initial read is lazy, so it happens once rather than on every render. */

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.error("Could not read from storage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Throws in private mode on older Safari, and when the quota is full
      console.error("Could not write to storage:", error);
    }
  }, [key, value]);

  return [value, setValue];
}
