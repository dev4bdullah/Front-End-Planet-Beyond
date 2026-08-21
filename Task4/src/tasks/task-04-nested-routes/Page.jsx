import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import { PageHeader, Section } from "@shared/Section";

/* This page IS the nested route demo — DashboardLayout and its six children
   render in the Outlet below, which is itself inside MainLayout's Outlet. */

export default function Page() {
  const { pathname } = useLocation();

  /* Forwarded, or DashboardLayout below receives undefined and every panel
     throws. Three layers, three explicit hand-offs. */
  const app = useOutletContext();

  return (
    <>
      <PageHeader
        number={4}
        title="Nested Routes"
        brief="Add nested dashboard routes for profile, settings, products, analytics, and user management"
        lead="Six child routes under one dashboard layout, and one of them nested two levels deeper still."
      />

      <Section
        title="Live dashboard"
        note="The sub-nav on the left belongs to DashboardLayout. Click through it — the sidebar and topbar don't move, and neither does this section heading. Only the innermost panel swaps."
      >
        <Outlet context={app} />
        <p className="tiny muted">
          Current URL: <code>{pathname}</code>
        </p>
      </Section>

      <Section
        title="The route definition"
        note="A layout route with children. The index route matches the parent path exactly — /nested-routes with nothing after it."
        code={`{
  path: "nested-routes",
  element: <NestedRoutesPage />,          // this page
  children: [
    {
      element: <DashboardLayout />,        // pathless layout route
      children: [
        { index: true,        element: <Overview /> },
        { path: "profile",    element: <Profile /> },
        { path: "products",   element: <DashProducts /> },
        { path: "analytics",  element: <Analytics /> },
        { path: "settings",   element: <DashSettings /> },
        { path: "users", children: [
          { index: true, element: <Users /> },
          { path: ":id", element: <UserDetail /> }    // three levels deep
        ]}
      ]
    }
  ]
}`}
      >
        <div className="card card--flat">
          <pre className="code">{`MainLayout                       sidebar + topbar
└── NestedRoutesPage             this page's heading and prose
    └── DashboardLayout          the sub-nav on the left
        └── UserDetail           /nested-routes/users/3`}</pre>
        </div>
      </Section>

      <Section
        title="Pathless layout routes"
        note="A route with no path but with an element and children exists purely to wrap. It adds a layout without adding a URL segment — which is how the dashboard sub-nav appears without /nested-routes/dashboard/profile."
        code={`// ✅ pathless — URL stays /nested-routes/profile
{ element: <DashboardLayout />, children: [{ path: "profile", … }] }

// ❌ with a path — URL becomes /nested-routes/dashboard/profile
{ path: "dashboard", element: <DashboardLayout />, children: [{ path: "profile", … }] }`}
      >
        <p className="section__note">
          This is the feature people most often don&apos;t know exists, and it&apos;s the cleanest
          way to apply a layout to a group of routes — or to wrap a group in one error boundary —
          without changing any URL.
        </p>
      </Section>

      <Section
        title="Index routes"
        note="`index: true` is what renders at the parent's exact path. Without one, /nested-routes shows the layout with an empty Outlet — a blank panel, no error, which is a confusing bug to chase."
        code={`{ index: true, element: <Overview /> }    // renders at /nested-routes

// the matching NavLink needs \`end\`, or it stays active on every child
<NavLink to="/nested-routes" end>Overview</NavLink>`}
      >
        <p className="section__note">
          Click <strong>Profile</strong> in the sub-nav and watch <strong>Overview</strong> lose its
          highlight. Remove <code>end</code> and both stay lit.
        </p>
      </Section>

      <Section
        title="Relative vs absolute links"
        code={`// inside DashboardLayout, both of these reach the same place:
<NavLink to="/nested-routes/profile">   // absolute — explicit, survives a move
<NavLink to="profile">                  // relative to the parent route

// relative is shorter but breaks silently if the parent path changes,
// and reads ambiguously when you're deep in a tree.
// This project uses absolute paths for that reason.`}
      >
        <p className="section__note">
          Relative links resolve against the <em>route</em> hierarchy, not the URL — which surprises
          people the first time a link inside a pathless layout goes somewhere unexpected.
        </p>
      </Section>
    </>
  );
}
