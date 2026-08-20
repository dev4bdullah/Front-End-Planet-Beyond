import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { NAV } from "./navigation";

/* Task 2 — the shell every page renders inside.

   Layout approach: a CSS grid with a fixed first column above lg, and a single
   column below it where the sidebar becomes an overlay drawer. The scroll
   container is the <main>, not the body, so the sidebar and topbar never move. */

export default function DashboardShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("day6.theme") ?? "light");
  const { pathname } = useLocation();

  // Task 1 — dark mode is a class on <html>, which is what @custom-variant reads
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("day6.theme", theme);
  }, [theme]);

  // Close the drawer on navigation, and scroll the new page to the top
  useEffect(() => {
    setMenuOpen(false);
    // ?.scrollTo? — the element may exist without the method (jsdom, older browsers)
    document.getElementById("main-scroll")?.scrollTo?.({ top: 0 });
  }, [pathname]);

  // Escape closes the drawer, and body scroll locks while it's open
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = event => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const current = NAV.find(item => pathname.startsWith(`/${item.slug}`));

  return (
    <div className="grid h-dvh grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Desktop rail — permanent, its own scroll region */}
      <aside className="hidden border-r lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="shadow-pop absolute inset-y-0 left-0 w-[min(80vw,280px)] border-r">
            <Sidebar onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Content column — min-w-0 stops a wide table blowing out the grid */}
      <div className="flex min-w-0 flex-col">
        <Topbar
          onMenu={() => setMenuOpen(true)}
          theme={theme}
          onThemeToggle={() => setTheme(value => (value === "dark" ? "light" : "dark"))}
          title={
            current ? `${String(current.num).padStart(2, "0")} · ${current.title}` : "Dashboard"
          }
        />

        <main
          id="main-scroll"
          className="scrollbar-slim flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6"
        >
          <div className="mx-auto w-full max-w-6xl space-y-5">
            <Outlet context={{ theme }} />
          </div>
        </main>
      </div>
    </div>
  );
}
