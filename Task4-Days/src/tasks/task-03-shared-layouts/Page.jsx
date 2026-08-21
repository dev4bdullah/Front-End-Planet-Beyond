import { useRef } from "react";
import { PageHeader, Section } from "@shared/Section";

/* A ref that survives re-renders but not remounts — so if this number keeps
   climbing as you navigate, the component was never unmounted. */
let mountCount = 0;

export default function Page() {
  const mountedAt = useRef(null);
  if (mountedAt.current === null) {
    mountCount += 1;
    mountedAt.current = new Date().toLocaleTimeString();
  }

  return (
    <>
      <PageHeader
        number={3}
        title="Shared Layouts"
        brief="Create MainLayout and DashboardLayout using Outlet for shared navigation and page structure"
        lead="The sidebar and topbar around this page are a layout route. They render once and never remount."
      />

      <Section
        title="How a layout route works"
        note="A route with children and an <Outlet /> is a layout. The parent element renders once; the Outlet is the hole the matched child drops into."
        code={`// routes.jsx
{
  path: "/",
  element: <MainLayout />,        // rendered once
  children: [
    { index: true,            element: <Home /> },
    { path: "base-pages",     element: <BasePages /> },
    { path: "deliverable",    element: <Deliverable /> }
  ]
}

// MainLayout.jsx
export default function MainLayout() {
  return (
    <div className="app">
      <Sidebar />                 {/* never remounts */}
      <Topbar />
      <main><Outlet /></main>     {/* only this swaps */}
    </div>
  );
}`}
      >
        <div className="grid">
          <div className="card card--flat">
            <p className="tiny muted">This page mounted at</p>
            <p className="small">
              <code>{mountedAt.current}</code>
            </p>
          </div>
          <div className="card card--flat">
            <p className="tiny muted">Times this page has mounted</p>
            <p className="small">
              <code>{mountCount}</code>
            </p>
          </div>
        </div>
        <p className="tiny muted">
          Navigate away and back — the mount count climbs, because the <em>page</em> unmounts. The
          sidebar around it does not: type into the topbar, or scroll the sidebar, and that state
          survives every navigation.
        </p>
      </Section>

      <Section
        title="Why not just put <Sidebar /> in every page"
        note="Because it would remount on every navigation. Scroll position resets, any open menu closes, and every component inside it re-runs its effects."
        code={`// ❌ the sidebar remounts on every page change
function ProductsPage() {
  return <><Sidebar /><main>…</main></>;
}

// ✅ the sidebar is outside the part that swaps
{ element: <MainLayout />, children: [ { path: "products", element: <Products /> } ] }`}
      >
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Sidebar in each page</th>
              <th>Layout route</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Sidebar scroll position", "resets", "kept"],
              ["Open menu / expanded group", "closes", "stays open"],
              ["Effects inside the sidebar", "re-run every navigation", "run once"],
              ["Duplication", "one import per page", "one line total"]
            ].map(([what, bad, good]) => (
              <tr key={what}>
                <td>{what}</td>
                <td className="muted">{bad}</td>
                <td>{good}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Two layouts in this project"
        code={`MainLayout        sidebar + topbar + breadcrumbs   → wraps everything
DashboardLayout   its own sub-nav                   → wraps /nested-routes/*

// DashboardLayout is a child of MainLayout, so /nested-routes/users/3
// renders three layers deep: MainLayout → DashboardLayout → UserDetail`}
      >
        <div className="card card--flat">
          <pre className="code">{`MainLayout                      ← sidebar, topbar, theme, outlet context
└── DashboardLayout             ← sub-nav (task 4)
    └── UserDetail              ← the page (task 5)`}</pre>
        </div>
        <p className="section__note">
          Open <code>/nested-routes/users/3</code> and look at the screen: three nested shells, each
          contributed by a different layout, and only the innermost part changes when you click
          between users.
        </p>
      </Section>

      <Section
        title="What MainLayout owns"
        code={`const [settings, setSettings] = useState(...);          // theme + density

useEffect(() => {                                        // apply the theme
  document.documentElement.classList.toggle("theme-dark", settings.theme === "dark");
  localStorage.setItem("day4.settings", JSON.stringify(settings));
}, [settings]);

useEffect(() => {                                        // scroll to top on nav
  window.scrollTo?.({ top: 0 });
}, [pathname]);

<Outlet context={{ user, settings, updateSetting }} />   // task 7`}
      >
        <p className="section__note">
          The scroll reset is worth noting — a browser restores scroll position on a real page load,
          but in a single-page app nothing does it for you, so a long page followed by a short one
          leaves you halfway down an empty screen.
        </p>
      </Section>
    </>
  );
}
