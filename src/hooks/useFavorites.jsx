import { createContext, useCallback, useContext, useMemo } from "react";
import { useAsyncStorage } from "./useAsyncStorage";

/* Task 12 — favourites in context, persisted.

   Stored as an array because AsyncStorage holds JSON and a Set doesn't
   serialise. The lookup Set is derived on read instead, so membership checks
   stay O(1) without a second source of truth. */

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [ids, setIds, { hydrated, reset }] = useAsyncStorage("day8.favorites", []);

  const lookup = useMemo(() => new Set(ids), [ids]);

  const isFavorite = useCallback(id => lookup.has(id), [lookup]);

  const toggle = useCallback(
    id =>
      setIds(current =>
        current.includes(id) ? current.filter(item => item !== id) : [...current, id]
      ),
    [setIds]
  );

  const value = useMemo(
    () => ({ ids, count: ids.length, isFavorite, toggle, clear: reset, hydrated }),
    [ids, isFavorite, toggle, reset, hydrated]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside a <FavoritesProvider>");
  return context;
}
