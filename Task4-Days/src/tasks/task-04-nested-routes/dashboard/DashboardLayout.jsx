import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { cx } from "@shared/cx";

/* Task 4 — a second layout, nested inside MainLayout.

   It consumes the parent's outlet context and forwards it to its own children,
   so /nested-routes/users/3 still sees the same user object three levels down. */

const LINKS = [
  { to: "/nested-routes", end: true, label: "Overview" },
  { to: "/nested-routes/profile", label: "Profile" },
  { to: "/nested-routes/products", label: "Products" },
  { to: "/nested-routes/analytics", label: "Analytics" },
  { to: "/nested-routes/users", label: "Users" },
  { to: "/nested-routes/settings", label: "Settings" }
];

export default function DashboardLayout() {
  const app = useOutletContext();

  return (
    <div className="dash">
      <aside className="dash__side">
        <nav aria-label="Dashboard">
          <ul>
            {LINKS.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => cx(isActive && "is-active")}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="stack" style={{ minWidth: 0 }}>
        {/* Forwarded, so the third level still receives it */}
        <Outlet context={app} />
      </div>
    </div>
  );
}
