import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "@hooks";

/* A pretend auth context — no server, no token. Its job here is to show the
   shape: a user, a permission check, and login/logout. */

const AuthContext = createContext(null);

const PERMISSIONS = {
  admin: ["read", "create", "update", "delete"],
  editor: ["read", "create", "update"],
  viewer: ["read"]
};

const DEFAULT_USER = {
  id: "usr_seed3",
  name: "Syed Abdullah Ayaz",
  email: "abdullah@example.com",
  role: "admin"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage("day5.auth", DEFAULT_USER);

  const login = useCallback(role => setUser({ ...DEFAULT_USER, role }), [setUser]);
  const logout = useCallback(() => setUser(null), [setUser]);

  const can = useCallback(
    action => Boolean(user && PERMISSIONS[user.role]?.includes(action)),
    [user]
  );

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, can, login, logout, PERMISSIONS }),
    [user, can, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an <AuthProvider>");
  return context;
}
