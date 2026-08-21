import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useLocalStorage } from "@hooks";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("day5.theme", "light");

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  const toggle = useCallback(
    () => setTheme(value => (value === "dark" ? "light" : "dark")),
    [setTheme]
  );

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside a <ThemeProvider>");
  return context;
}
