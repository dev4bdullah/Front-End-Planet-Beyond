import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* Task 10 — useState that survives an app restart.

   The critical difference from localStorage: AsyncStorage is ASYNCHRONOUS.
   There is no way to read it synchronously during the first render, so every
   consumer needs a `hydrated` flag — rendering the default and then swapping
   is what causes the visible flash of the wrong theme on launch. */

export function useAsyncStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (mounted.current && raw !== null) setValue(JSON.parse(raw));
      } catch (error) {
        // Corrupt JSON, or storage unavailable. Fall back to the default
        // rather than crashing on launch.
        console.warn(`useAsyncStorage: could not read "${key}"`, error);
      } finally {
        if (mounted.current) setHydrated(true);
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [key]);

  useEffect(() => {
    // Don't write before the read finished, or the default overwrites the
    // stored value on every launch. This is the bug that makes persistence
    // look like it "works sometimes".
    if (!hydrated) return;

    AsyncStorage.setItem(key, JSON.stringify(value)).catch(error =>
      console.warn(`useAsyncStorage: could not write "${key}"`, error)
    );
  }, [key, value, hydrated]);

  const reset = useCallback(async () => {
    setValue(initialValue);
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`useAsyncStorage: could not remove "${key}"`, error);
    }
  }, [key, initialValue]);

  return [value, setValue, { hydrated, reset }];
}
