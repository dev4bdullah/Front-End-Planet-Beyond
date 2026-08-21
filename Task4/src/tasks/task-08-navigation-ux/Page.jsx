import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { PageHeader, Section } from "@shared/Section";
import { cx } from "@shared/cx";
import Breadcrumbs from "./components/Breadcrumbs";
import { NAV } from "@layout/navigation";

export default function Page() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  // Task 8 — the tab title should say where you are
  useEffect(() => {
    const previous = document.title;
    document.title = "Navigation UX · Router Shop";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <>
      <PageHeader
        number={8}
        title="Navigation UX"
        brief="Use NavLink active states, breadcrumbs, route titles, and clean navigation hierarchy"
        lead="Four small things that separate a routed app from one that feels lost."
      />

      <Section
        title="NavLink active states"
        note="NavLink derives active from the URL. Deriving it from useState instead means it can disagree with where you actually are — after a back button, or on a page opened from a bookmark."
        code={`<NavLink
  to="/nested-routes"
  end                                       // exact match only
  className={({ isActive }) => cx("nav__link", isActive && "is-active")}
>
  Overview
</NavLink>

// className and children BOTH accept a function
<NavLink to="/x">
  {({ isActive, isPending }) => <span>{isActive ? "▸ " : ""}Label</span>}
</NavLink>`}
      >
        <nav className="subnav" aria-label="Demo">
          {["/navigation-ux", "/base-pages", "/dynamic-routes"].map(to => (
            <NavLink key={to} to={to} end className={({ isActive }) => cx(isActive && "is-active")}>
              <code>{to}</code>
            </NavLink>
          ))}
        </nav>
        <p className="tiny muted">
          The active one is the current page. Nothing tracks that in state — it&apos;s read from the
          router.
        </p>
      </Section>

      <Section
        title="The `end` prop, again"
        note="Worth repeating because it's the most common NavLink bug: without `end`, a parent link stays active on every child route, since /nested-routes is a prefix of /nested-routes/profile."
        code={`<NavLink to="/nested-routes" end>Overview</NavLink>   // active only at exactly that path
<NavLink to="/nested-routes">Overview</NavLink>       // also active on /profile, /users/3 …`}
      >
        <p className="section__note">
          The sidebar in this project deliberately omits <code>end</code> on task links, so{" "}
          <strong>Dynamic Routes</strong> stays highlighted while you&apos;re on{" "}
          <code>/dynamic-routes/7</code> — which is the behaviour you want there. Same prop,
          opposite decision, driven by whether children should count as &ldquo;still on that
          section&rdquo;.
        </p>
      </Section>

      <Section
        title="Breadcrumbs from the pathname"
        note="Built by splitting location.pathname, so they can never disagree with the URL. A hand-maintained breadcrumb array drifts the first time a route moves."
        code={`const { pathname } = useLocation();
const parts = pathname.split("/").filter(Boolean);

{parts.map((part, index) => {
  const to = "/" + parts.slice(0, index + 1).join("/");
  const isLast = index === parts.length - 1;
  return isLast
    ? <span aria-current="page">{label(part)}</span>    // last crumb isn't a link
    : <Link to={to}>{label(part)}</Link>;
})}`}
      >
        <div className="card card--flat">
          <Breadcrumbs />
        </div>
        <div className="row">
          <Link className="btn btn--sm btn--ghost" to="/nested-routes/users/3">
            Try a three-level path
          </Link>
          <Link className="btn btn--sm btn--ghost" to="/dynamic-routes/7">
            Try a dynamic one
          </Link>
        </div>
        <p className="tiny muted">
          Note <code>aria-current=&quot;page&quot;</code> on the last crumb, and that it isn&apos;t
          a link — linking to the page you&apos;re already on is a small but real usability bug.
        </p>
      </Section>

      <Section
        title="Route titles"
        note="The tab title is navigation too. In a single-page app nothing updates it for you, so every tab says the same thing — and browser history becomes useless."
        code={`useEffect(() => {
  const previous = document.title;
  document.title = "Navigation UX · Router Shop";
  return () => { document.title = previous; };   // restore on unmount
}, []);

// task 11 wraps this as useDocumentTitle("Navigation UX")`}
      >
        <p className="section__note">
          Look at the browser tab — it says <em>Navigation UX · Router Shop</em>. Navigate away and
          the cleanup restores the previous title.
        </p>
      </Section>

      <Section
        title="Programmatic navigation, and when not to"
        code={`navigate("/products")                     // push
navigate("/products", { replace: true })  // no new history entry
navigate(-1)                              // back
navigate("/login", { state: { from: pathname } })   // pass data without the URL`}
      >
        <div className="row">
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => navigate(-1)}>
            navigate(-1)
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => navigate("/deliverable")}
          >
            navigate(&quot;/deliverable&quot;)
          </button>
          <span className="tiny muted">
            arrived here via: <code>{navigationType}</code>
          </span>
        </div>
        <p className="section__note">
          Use a <code>Link</code> whenever the destination is known at render time. A link can be
          middle-clicked, opened in a new tab, copied and read by a screen reader as a link;{" "}
          <code>navigate()</code> inside an onClick gives up all of that. Reserve it for after a
          form submits or an action completes.
        </p>
      </Section>

      <Section
        title="The hierarchy this project uses"
        code={`/                          index
/<task-slug>               12 task pages, grouped in the sidebar
/nested-routes/*           a section with its own sub-nav
/dynamic-routes/:id        a detail view of a list
/shop                      → redirects to /deliverable (an old link kept alive)
*                          404`}
      >
        <div className="row">
          {NAV.slice(0, 4).map(item => (
            <Link key={item.slug} className="btn btn--sm btn--ghost" to={`/${item.slug}`}>
              /{item.slug}
            </Link>
          ))}
          <Link className="btn btn--sm btn--ghost" to="/shop">
            /shop (redirects)
          </Link>
        </div>
        <p className="tiny muted">
          Current path: <code>{pathname}</code>. The redirect uses{" "}
          <code>{'<Navigate to="/deliverable" replace />'}</code> — with <code>replace</code>, so
          Back doesn&apos;t bounce the user straight through it again.
        </p>
      </Section>
    </>
  );
}
