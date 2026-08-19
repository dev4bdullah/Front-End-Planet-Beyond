import Breadcrumbs from "@tasks/task-08-navigation-ux/components/Breadcrumbs";

export default function Topbar({ title, theme, onThemeToggle }) {
  return (
    <header className="topbar">
      <p className="topbar__title">{title}</p>

      <div className="topbar__right">
        <Breadcrumbs />
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onThemeToggle}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
