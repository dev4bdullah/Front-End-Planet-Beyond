import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cx } from "./cx";
import { NAV, GROUPS } from "./navigation";
import { useTheme } from "@tasks/task-09-context-api/contexts/ThemeContext";
import { useAuth } from "@tasks/task-09-context-api/contexts/AuthContext";
import { useCrud } from "@store/CrudContext";

export default function AppShell() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const { user, role } = useAuth();
  const { stats } = useCrud();

  useEffect(() => {
    window.scrollTo?.({ top: 0 });
  }, [pathname]);

  const current = NAV.find(item => pathname.startsWith(`/${item.slug}`));

  return (
    <div className="app">
      <nav className="nav" aria-label="Tasks">
        <div>
          <NavLink to="/" className="nav__brand">
            Admin<span>CRUD</span>
          </NavLink>
          <p className="nav__sub">Day 5 · 13 tasks</p>
        </div>

        {GROUPS.map(group => (
          <div key={group}>
            <p className="nav__group">{group}</p>
            <ul className="nav__list">
              {NAV.filter(item => item.group === group).map(item => (
                <li key={item.slug}>
                  <NavLink
                    to={`/${item.slug}`}
                    className={({ isActive }) => cx("nav__link", isActive && "is-active")}
                  >
                    <span className="nav__num">{String(item.num).padStart(2, "0")}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div style={{ minWidth: 0 }}>
        <header className="topbar">
          <p className="topbar__title">
            {current ? `${String(current.num).padStart(2, "0")} · ${current.title}` : "Admin CRUD"}
          </p>

          <div className="topbar__right">
            <span className="chip">{stats().total} records</span>
            <span className="chip">
              {user ? `${user.name.split(" ")[0]} · ${role}` : "signed out"}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <main className="app__main">
          <div className="app__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
