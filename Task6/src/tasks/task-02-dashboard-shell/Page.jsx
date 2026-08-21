import { PageHeader, Section } from "@shared/Section";
import { Badge, Card } from "@ui";

export default function Page() {
  return (
    <>
      <PageHeader
        number={2}
        title="Dashboard Shell"
        brief="Build responsive sidebar, topbar, content area, mobile menu, and page container"
        lead="You're looking at it. The sidebar, topbar and this scroll area are the shell every other task renders inside."
      />

      <Section
        title="The layout"
        note="A two-column CSS grid above lg, one column below it. The sidebar becomes an overlay drawer rather than collapsing to icons — at 260px there's nothing useful to collapse to."
        code={`<div className="grid h-dvh grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
  <aside className="hidden border-r lg:block"><Sidebar /></aside>

  <div className="flex min-w-0 flex-col">
    <Topbar />
    <main id="main-scroll" className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl space-y-5"><Outlet /></div>
    </main>
  </div>
</div>`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [
              "h-dvh, not h-screen",
              "dvh accounts for mobile browser chrome. h-screen leaves the bottom of the page under the address bar on iOS."
            ],
            [
              "minmax(0,1fr), not 1fr",
              "A wide table inside a 1fr grid column forces the column wider than the viewport. minmax(0,1fr) lets it shrink."
            ],
            [
              "min-w-0 on the content column",
              "Same reason, one level down — without it a long unbroken string blows out the layout."
            ],
            [
              "Scroll on <main>, not <body>",
              "The sidebar and topbar stay put with no position: fixed, so no z-index stack to manage."
            ]
          ].map(([title, body]) => (
            <Card key={title}>
              <p className="text-brand-600 dark:text-brand-400 font-mono text-xs font-bold">
                {title}
              </p>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Breakpoint behaviour"
        note="Resize the window across 1024px and watch the sidebar swap between a permanent rail and a hamburger."
      >
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-sunk dark:bg-sunk-dark">
              <tr>
                <th className="text-2xs px-3 py-2 text-left font-bold uppercase">Width</th>
                <th className="text-2xs px-3 py-2 text-left font-bold uppercase">Sidebar</th>
                <th className="text-2xs px-3 py-2 text-left font-bold uppercase">Topbar</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["under 640px", "overlay drawer", "hamburger, no search field"],
                ["640–1024px", "overlay drawer", "hamburger + search"],
                ["1024px and up", "permanent 260px rail", "no hamburger, wider search"]
              ].map(([width, sidebar, topbar]) => (
                <tr key={width} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{width}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{sidebar}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{topbar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="The mobile drawer"
        note="Four things a drawer needs, and three of them are usually missing: a backdrop that closes it, Escape to close, a body scroll lock, and closing itself on navigation."
        code={`// Escape + scroll lock, cleaned up together
useEffect(() => {
  if (!menuOpen) return undefined;

  const onKeyDown = e => e.key === "Escape" && setMenuOpen(false);
  document.addEventListener("keydown", onKeyDown);
  const previous = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.removeEventListener("keydown", onKeyDown);
    document.body.style.overflow = previous;   // restore, don't assume ""
  };
}, [menuOpen]);

// close on navigation, and reset the scroll position
useEffect(() => {
  setMenuOpen(false);
  document.getElementById("main-scroll")?.scrollTo({ top: 0 });
}, [pathname]);`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Note{" "}
          <code className="font-mono text-xs">const previous = document.body.style.overflow</code> —
          restoring the previous value rather than setting{" "}
          <code className="font-mono text-xs">&quot;&quot;</code> matters as soon as anything else
          on the page also locks scroll.
        </p>
      </Section>

      <Section
        title="One list drives three things"
        note="The sidebar, the mobile drawer and the router all read the same NAV array. Adding a page is one line."
        code={`// layout/navigation.js
export const NAV = [
  { num: 1, slug: "tailwind-setup", label: "Tailwind Setup", icon: Palette, group: "Foundation" },
  { num: 2, slug: "dashboard-shell", label: "Dashboard Shell", icon: LayoutDashboard, group: "Foundation" },
  ...
];

// Sidebar groups by item.group, router maps slug → lazy page,
// Topbar finds the current item for the page title.`}
      >
        <div className="flex flex-wrap gap-2">
          {["Foundation", "Data", "Polish", "Capstone"].map(group => (
            <Badge key={group} tone="brand">
              {group}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The four groups in the sidebar come from the <code className="font-mono">group</code>{" "}
          field — no second list to keep in sync.
        </p>
      </Section>

      <Section
        title="Active state comes from the router"
        note="NavLink handles it. Deriving the active item from useState means it can disagree with the URL — after a back button, or on a page loaded from a bookmark."
        code={`<NavLink
  to={\`/\${item.slug}\`}
  className={({ isActive }) =>
    cx("flex items-center gap-2.5 rounded-lg px-2 py-1.5",
       isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-sunk")}
>
  {({ isActive }) => (
    <>
      <item.icon className={cx("size-4", !isActive && "text-slate-400")} />
      <span className="truncate">{item.label}</span>
    </>
  )}
</NavLink>`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Both <code className="font-mono text-xs">className</code> and{" "}
          <code className="font-mono text-xs">children</code> accept a function receiving{" "}
          <code className="font-mono text-xs">isActive</code>, which is how the icon dims on
          inactive rows without a second lookup.
        </p>
      </Section>
    </>
  );
}
