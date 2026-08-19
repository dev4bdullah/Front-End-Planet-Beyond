import { Link, useLocation } from "react-router-dom";
import { NAV } from "@layout/navigation";
import { titleCase } from "@shared/data";

/* Task 8 — breadcrumbs built from the pathname, so they can never disagree
   with where you actually are. /nested-routes/users/3 becomes
   Home / Nested Routes / Users / 3 */

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  if (!parts.length) return null;

  const labelFor = (segment, index) => {
    if (index === 0) {
      const match = NAV.find(item => item.slug === segment);
      if (match) return match.label;
    }
    return titleCase(segment);
  };

  return (
    <nav className="crumbs tiny" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {parts.map((part, index) => {
        const to = "/" + parts.slice(0, index + 1).join("/");
        const isLast = index === parts.length - 1;

        return (
          <span key={to}>
            <span className="crumbs__sep" aria-hidden="true">
              /
            </span>
            {isLast ? (
              <span aria-current="page">{labelFor(part, index)}</span>
            ) : (
              <Link to={to}>{labelFor(part, index)}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
