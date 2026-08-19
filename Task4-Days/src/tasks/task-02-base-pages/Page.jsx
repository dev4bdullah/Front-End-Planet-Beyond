import { NavLink, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { PageHeader, Section } from "@shared/Section";
import { cx } from "@shared/cx";

/* This page is itself a layout route: the tabs below swap child routes at
   /base-pages, /base-pages/about and /base-pages/products. */

const TABS = [
  { to: "/base-pages", end: true, label: "Home" },
  { to: "/base-pages/about", label: "About" },
  { to: "/base-pages/products", label: "Products" },
  { to: "/base-pages/nowhere", label: "A missing page" }
];

export default function Page() {
  const { pathname } = useLocation();

  /* This page is a layout route, so it must forward the context it received.
     Context does NOT pass through automatically — each layer that renders an
     Outlet decides what the next layer gets. Task 7 covers why. */
  const app = useOutletContext();

  return (
    <>
      <PageHeader
        number={2}
        title="Base Pages"
        brief="Create Home, About, Products, Product Details, Dashboard, Settings, and Not Found pages"
        lead="Seven pages, each a plain component. A page is only a page because a route points at it."
      />

      <Section
        title="Live: four routes sharing this layout"
        note="The tabs are real routes. Click through them and watch the URL and the breadcrumb in the topbar change — this section stays put, only the panel below swaps."
      >
        <nav className="subnav" aria-label="Base pages">
          {TABS.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => cx(isActive && "is-active")}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ minHeight: "170px", paddingTop: "0.7rem" }}>
          <Outlet context={app} />
        </div>

        <p className="tiny muted">
          Current URL: <code>{pathname}</code>
        </p>
      </Section>

      <Section
        title="The `end` prop on the index tab"
        note="Without it, the Home tab stays highlighted on every child route — because /base-pages is a prefix of /base-pages/about. This is the most common NavLink bug."
        code={`<NavLink to="/base-pages" end>Home</NavLink>       // ✅ exact match only
<NavLink to="/base-pages">Home</NavLink>            // ❌ active on every child too

// same idea in the route tree — an index route matches the parent path exactly
{ path: "base-pages", element: <BasePages />, children: [
  { index: true,       element: <Home /> },
  { path: "about",     element: <About /> },
  { path: "products",  element: <Products /> }
]}`}
      >
        <p className="section__note">
          Remove <code>end</code> and both Home and About light up at once — worth trying in the
          code to see it.
        </p>
      </Section>

      <Section
        title="The 404 route"
        note="path='*' matches anything the earlier routes didn't. It has to be last in the array, because React Router picks the best match rather than the first — but keeping it last also makes the intent readable."
        code={`{ path: "*", element: <NotFound /> }

// inside NotFound — tell the user WHERE they were
const { pathname } = useLocation();
<p>Nothing is registered at <code>{pathname}</code></p>`}
      >
        <p className="section__note">
          Click <strong>A missing page</strong> above. The 404 renders inside this layout rather
          than replacing the whole app, because it&apos;s a child route — which is usually what you
          want, since the navigation stays usable.
        </p>
      </Section>

      <Section
        title="Which pages exist here"
        code={`pages/Home.jsx          links + useNavigate
pages/About.jsx         a static page
pages/Products.jsx      a grid linking into task 5's dynamic route
pages/NotFound.jsx      404, with the attempted path and a back button

// the rest of the sheet's list live where they're demonstrated:
// Product Details → task 5    Dashboard → task 4    Settings → task 7`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Where it lives</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Home", "task-02/pages/Home.jsx"],
              ["About", "task-02/pages/About.jsx"],
              ["Products", "task-02/pages/Products.jsx"],
              ["Product Details", "task-05 — it needs the :id param"],
              ["Dashboard", "task-04 — it needs nested routes"],
              ["Settings", "task-07 — it edits outlet context"],
              ["Not Found", "task-02/pages/NotFound.jsx"]
            ].map(([page, where]) => (
              <tr key={page}>
                <td>{page}</td>
                <td className="muted">
                  <code>{where}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tiny muted">
          Each page lives with the task that motivates it, rather than all seven in one folder — the
          same feature-first structure as the other days.
        </p>
      </Section>
    </>
  );
}
