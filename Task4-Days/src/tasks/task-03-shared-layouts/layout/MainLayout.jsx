import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { NAV } from "./navigation";

/* Task 3 — the shared layout.

   Sidebar and topbar render once and never remount; <Outlet /> swaps only the
   page beneath them. That's the difference between a layout route and putting
   <Sidebar /> at the top of every page component.

   Task 7 — whatever goes on <Outlet context={...}> is readable from any child
   route via useOutletContext(), at any depth, with no prop drilling. */

const DEFAULT_USER = {
  name: "Syed Abdullah Ayaz",
  role: "Frontend Intern",
  email: "abdullah@example.com"
};

export default function MainLayout() {
  const { pathname } = useLocation();

  const [user] = useState(DEFAULT_USER);
  const [settings, setSettings] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("day4.settings")) ?? { theme: "light", density: "cosy" }
      );
    } catch {
      return { theme: "light", density: "cosy" };
    }
  });

  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", settings.theme === "dark");
    localStorage.setItem("day4.settings", JSON.stringify(settings));
  }, [settings]);

  // Scroll the new page to the top on navigation — the browser doesn't do this
  // for you in a single-page app.
  useEffect(() => {
    window.scrollTo?.({ top: 0 });
  }, [pathname]);

  const current = NAV.find(item => pathname.startsWith(`/${item.slug}`));

  return (
    <div className="app">
      <Sidebar />

      <div style={{ minWidth: 0 }}>
        <Topbar
          title={
            current ? `${String(current.num).padStart(2, "0")} · ${current.title}` : "Router Shop"
          }
          theme={settings.theme}
          onThemeToggle={() => updateSetting("theme", settings.theme === "dark" ? "light" : "dark")}
        />

        <main className="app__main">
          <div className="app__inner">
            <Outlet context={{ user, settings, updateSetting }} />
          </div>
        </main>
      </div>
    </div>
  );
}
