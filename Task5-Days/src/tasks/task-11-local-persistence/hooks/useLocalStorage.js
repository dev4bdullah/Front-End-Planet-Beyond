import { useCallback, useEffect, useState } from "react";

/* Same API as useState, but the value survives a refresh.
   The read is lazy, so it happens once at mount rather than every render. */

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => read(key, initialValue));

  useEffect(() => {
    write(key, value);
  }, [key, value]);

  const reset = useCallback(() => {
    remove(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, reset];
}

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.error(`Could not read "${key}":`, error);
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Throws in private mode on older Safari, and when the quota is full
    console.error(`Could not write "${key}":`, error);
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Could not remove "${key}":`, error);
  }
}

export function sizeOf(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Blob([raw]).size : 0;
  } catch {
    return 0;
  }
}
