import { createContext, useCallback, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useAsyncStorage } from "./useAsyncStorage";
import { palettes } from "../theme/palettes";

/* Task 11 — theme through context, persisted with AsyncStorage.

   Three modes rather than two: "system" is the honest default, because a phone
   already has a global preference and ignoring it is a small rudeness. */

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const system = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode, { hydrated }] = useAsyncStorage("day8.theme", "system");

  const resolved = mode === "system" ? (system ?? "dark") : mode;
  const colors = palettes[resolved];

  const cycle = useCallback(() => {
    setMode(current => (current === "system" ? "light" : current === "light" ? "dark" : "system"));
  }, [setMode]);

  const value = useMemo(
    () => ({ mode, resolved, colors, setMode, cycle, hydrated, system }),
    [mode, resolved, colors, setMode, cycle, hydrated, system]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  /* Returning undefined would surface later as "cannot read property 'colors'
     of undefined", far from the actual cause. */
  if (!context) throw new Error("useTheme must be used inside a <ThemeProvider>");

  return context;
}
