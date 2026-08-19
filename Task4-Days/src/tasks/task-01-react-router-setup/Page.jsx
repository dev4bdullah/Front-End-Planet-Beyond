import { Link, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { PageHeader, Section } from "@shared/Section";

export default function Page() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  return (
    <>
      <PageHeader
        number={1}
        title="React Router Setup"
        brief="Install react-router-dom, wrap the app in BrowserRouter, and define the base route structure"
        lead="The router is already running — this page is a route, and everything below reads from it live."
      />

      <Section
        title="Install and mount"
        note="One router at the root, once. Nesting a second one, or putting BrowserRouter inside a component that re-renders, is the cause of most 'my navigation doesn't work' problems."
        code={`npm install react-router-dom

// main.jsx — createBrowserRouter is the modern API.
// The older <BrowserRouter><Routes>…</Routes></BrowserRouter> still works and
// is what most tutorials show; this project uses the data router.
import { RouterProvider } from "react-router-dom";
import { router } from "./router/routes";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);`}
      >
        <div className="grid">
          <div className="card card--flat">
            <p className="tiny muted">Current pathname</p>
            <p className="small">
              <code>{location.pathname}</code>
            </p>
          </div>
          <div className="card card--flat">
            <p className="tiny muted">Search string</p>
            <p className="small">
              <code>{location.search || "(none)"}</code>
            </p>
          </div>
          <div className="card card--flat">
            <p className="tiny muted">How you got here</p>
            <p className="small">
              <code>{navigationType}</code>
            </p>
          </div>
        </div>
        <p className="tiny muted">
          <code>useNavigationType</code> returns POP for a back/forward or a fresh load, PUSH for a
          normal link, and REPLACE when history was overwritten. Try the browser back button.
        </p>
      </Section>

      <Section
        title="The route tree"
        note="Every route in this project lives in one file. Scattering route definitions across components makes the shape of the app impossible to see."
        code={`export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,          // renders once, holds sidebar + topbar
    children: [
      { index: true, element: <Home /> },
      { path: "base-pages", element: <BasePages /> },

      { path: "dynamic-routes", children: [
        { index: true,   element: <DynamicRoutes /> },
        { path: ":id",   element: <ProductDetail /> }   // task 5
      ]},

      { path: "nested-routes", element: <DashboardLayout />, children: [ … ] },  // task 4

      { path: "*", element: <NotFound /> }              // must be last
    ]
  }
]);`}
      >
        <div className="card card--flat">
          <pre className="code">{`/                          MainLayout
├── /                      Home                 (index route)
├── /router-setup          this page
├── /base-pages
├── /shared-layouts
├── /nested-routes         DashboardLayout      (nested layout)
│   ├── /                  Overview             (index route)
│   ├── /profile
│   ├── /products
│   ├── /analytics
│   ├── /settings
│   └── /users
│       ├── /              Users
│       └── /:id           UserDetail           (nested dynamic segment)
├── /dynamic-routes
│   ├── /                  DynamicRoutes
│   └── /:id               ProductDetail
├── /url-search-params
├── /outlet-context
├── /navigation-ux
├── /api-service-layer
├── /useeffect-cleanup
├── /custom-hooks
├── /deliverable
├── /shop                  → redirect to /deliverable
└── *                      NotFound`}</pre>
        </div>
      </Section>

      <Section
        title="Link vs a vs navigate"
        note="A plain anchor triggers a full page reload — the whole bundle re-downloads and every piece of state is lost. That's the single most common React Router mistake."
        code={`<Link to="/products">Products</Link>        // ✅ client-side
<a href="/products">Products</a>            // ❌ full page reload

navigate("/products")                       // from code
navigate("/products", { replace: true })    // no new history entry
navigate(-1)                                // back
navigate("/products?sort=price")            // with a query string`}
      >
        <div className="row">
          <Link className="btn btn--sm" to="/base-pages">
            Link (client-side)
          </Link>
          <button className="btn btn--sm btn--ghost" onClick={() => navigate("/base-pages")}>
            navigate()
          </button>
          <button
            className="btn btn--sm btn--ghost"
            onClick={() => navigate("/base-pages", { replace: true })}
          >
            navigate(replace)
          </button>
        </div>
        <p className="tiny muted">
          Press the third one, then the browser back button — you land two pages back, because
          <code>replace</code> overwrote the current history entry instead of adding one.
        </p>
      </Section>

      <Section
        title="One thing that only breaks in production"
        note="Client-side routing means the server must serve index.html for every path. In dev Vite does that automatically; on a static host it doesn't, so a refresh on /deliverable returns a 404."
        code={`# Netlify — public/_redirects
/*  /index.html  200

# Vercel — vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }

# GitHub Pages — set base in vite.config.js to the repo name,
# and use HashRouter, since Pages can't rewrite`}
      >
        <p className="section__note">
          Worth testing with <code>npm run build &amp;&amp; npm run preview</code> before deploying
          — it&apos;s the only way to catch this locally.
        </p>
      </Section>
    </>
  );
}
