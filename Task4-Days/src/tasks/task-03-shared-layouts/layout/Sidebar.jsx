import { NavLink } from "react-router-dom";
import { cx } from "@shared/cx";
import { NAV, GROUPS } from "./navigation";

export default function Sidebar() {
  return (
    <nav className="nav" aria-label="Tasks">
      <div>
        <NavLink to="/" className="nav__brand">
          Router<span>Shop</span>
        </NavLink>
        <p className="nav__sub">Day 4 · 12 tasks</p>
      </div>

      {GROUPS.map(group => (
        <div key={group}>
          <p className="nav__group">{group}</p>
          <ul className="nav__list">
            {NAV.filter(item => item.group === group).map(item => (
              <li key={item.slug}>
                {/* NavLink gives the active state for free, derived from the URL
                    rather than from state that could disagree with it. */}
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
  );
}
