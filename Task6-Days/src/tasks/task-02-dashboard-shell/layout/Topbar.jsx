import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Avatar, Badge, Button } from "@ui";

export default function Topbar({ onMenu, theme, onThemeToggle, title }) {
  return (
    <header className="bg-surface/85 dark:bg-surface-dark/85 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-3 backdrop-blur-sm sm:px-4">
      {/* Only rendered under lg — the sidebar is permanent above that */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenu}
        aria-label="Open menu"
        className="lg:hidden"
      >
        <Menu className="size-4" />
      </Button>

      <p className="truncate text-sm font-semibold sm:text-base">{title}</p>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* The search field itself is hidden on small screens; the icon stays */}
        <div className="relative hidden sm:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Search the dashboard"
            className="bg-sunk focus:border-brand-500 dark:bg-sunk-dark h-8 w-36 rounded-lg border pr-3 pl-8 text-xs focus:w-52 focus:outline-none md:w-48"
          />
        </div>

        <Button variant="ghost" size="sm" aria-label="Notifications" className="relative">
          <Bell className="size-4" />
          <span className="bg-danger-500 absolute top-1 right-1 size-1.5 rounded-full" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onThemeToggle}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <Badge tone="success" dot className="hidden md:inline-flex">
          live
        </Badge>

        <Avatar name="Syed Abdullah Ayaz" size="sm" />
      </div>
    </header>
  );
}
