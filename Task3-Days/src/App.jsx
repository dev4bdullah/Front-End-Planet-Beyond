import { useState, useEffect } from "react";
import { ToastProvider } from "@interactive";

import Task01 from "@tasks/task-01-react-vite-setup/Page";
import Task02 from "@tasks/task-02-react-folder-structure/Page";
import Task03 from "@tasks/task-03-jsx-fundamentals/Page";
import Task04 from "@tasks/task-04-reusable-base-components/Page";
import Task05 from "@tasks/task-05-interactive-components/Page";
import Task06 from "@tasks/task-06-props-and-composition/Page";
import Task07 from "@tasks/task-07-state-management-basics/Page";
import Task08 from "@tasks/task-08-controlled-forms/Page";
import Task09 from "@tasks/task-09-list-rendering/Page";
import Task10 from "@tasks/task-10-styling-strategy/Page";
import Task11 from "@tasks/task-11-react-devtools-practice/Page";
import Task12 from "@tasks/task-12-deliverable/Page";

const PAGES = [
  { id: 1, label: "React Vite Setup", Component: Task01 },
  { id: 2, label: "React Folder Structure", Component: Task02 },
  { id: 3, label: "JSX Fundamentals", Component: Task03 },
  { id: 4, label: "Reusable Base Components", Component: Task04 },
  { id: 5, label: "Interactive Components", Component: Task05 },
  { id: 6, label: "Props & Composition", Component: Task06 },
  { id: 7, label: "State Management Basics", Component: Task07 },
  { id: 8, label: "Controlled Forms", Component: Task08 },
  { id: 9, label: "List Rendering", Component: Task09 },
  { id: 10, label: "Styling Strategy", Component: Task10 },
  { id: 11, label: "React DevTools Practice", Component: Task11 },
  { id: 12, label: "Deliverable", Component: Task12 }
];

export default function App() {
  const [active, setActive] = useState(1);
  const [theme, setTheme] = useState(() => localStorage.getItem("day3.theme") ?? "light");

  // Task 10 — one class on the body flips every design token
  useEffect(() => {
    document.body.className = theme === "dark" ? "theme-dark" : "";
    localStorage.setItem("day3.theme", theme);
  }, [theme]);

  const current = PAGES.find(page => page.id === active) ?? PAGES[0];
  const { Component } = current;

  return (
    <ToastProvider>
      <div className="app">
        <nav className="nav" aria-label="Tasks">
          <div>
            <p className="nav__brand">
              Day 3 <span>React</span>
            </p>
            <p className="nav__sub">Twelve tasks, one project</p>
          </div>

          <ul className="nav__list">
            {PAGES.map(page => (
              <li key={page.id}>
                <button
                  type="button"
                  className={`nav__link ${page.id === active ? "nav__link--active" : ""}`}
                  aria-current={page.id === active ? "page" : undefined}
                  onClick={() => {
                    setActive(page.id);
                    window.scrollTo({ top: 0 });
                  }}
                >
                  <span className="nav__num">{String(page.id).padStart(2, "0")}</span>
                  <span>{page.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setTheme(value => (value === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "☀️ Light theme" : "🌙 Dark theme"}
          </button>
        </nav>

        <main className="app__main">
          {/* The key remounts the page on change, so each task starts clean */}
          <div className="app__inner" key={current.id}>
            <Component theme={theme} onThemeChange={setTheme} />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
