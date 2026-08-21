import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import DashboardShell from "@layout/DashboardShell";
import ErrorBoundary from "@tasks/task-09-error-boundaries/components/ErrorBoundary";
import { LoadingState } from "@tasks/task-10-ux-states/components/states";
import { NAV } from "@layout/navigation";

/* Mirrors src/router/routes.jsx but with a memory router, so every lazy page
   can be mounted and asserted on without a browser. */

const pages = {
  "tailwind-setup": lazy(() => import("@tasks/task-01-tailwind-dashboard-setup/Page")),
  "dashboard-shell": lazy(() => import("@tasks/task-02-dashboard-shell/Page")),
  "ui-system": lazy(() => import("@tasks/task-03-reusable-ui-system/Page")),
  "kpi-cards": lazy(() => import("@tasks/task-04-stats-and-kpi-cards/Page")),
  "data-table": lazy(() => import("@tasks/task-05-professional-data-table/Page")),
  charts: lazy(() => import("@tasks/task-06-charts-and-analytics/Page")),
  performance: lazy(() => import("@tasks/task-07-performance-optimization/Page")),
  "code-splitting": lazy(() => import("@tasks/task-08-code-splitting/Page")),
  "error-boundaries": lazy(() => import("@tasks/task-09-error-boundaries/Page")),
  "ux-states": lazy(() => import("@tasks/task-10-ux-states/Page")),
  "framer-motion": lazy(() => import("@tasks/task-11-framer-motion/Page")),
  "testing-build": lazy(() => import("@tasks/task-12-testing-and-build/Page")),
  deliverable: lazy(() => import("@tasks/task-13-deliverable/Page"))
};

function Page({ slug }) {
  const Component = pages[slug];
  return (
    <ErrorBoundary level="page" name={slug}>
      <Suspense fallback={<LoadingState />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

const routes = [
  {
    path: "/",
    element: <DashboardShell />,
    children: Object.keys(pages).map(slug => ({ path: slug, element: <Page slug={slug} /> }))
  }
];

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("every route mounts", () => {
  it.each(NAV.map(item => [item.slug, item.title, item.num]))(
    "/%s renders task %s",
    async (slug, title, num) => {
      renderAt(`/${slug}`);

      // The lazy chunk resolves, then the page header appears
      await waitFor(() => expect(screen.getByText(`Day 6 · Task ${num}`)).toBeInTheDocument(), {
        timeout: 5000
      });

      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
      // The shell survived — the sidebar is still there
      expect(screen.getByRole("navigation", { name: "Dashboard" })).toBeInTheDocument();
    }
  );
});

describe("the shell", () => {
  it("marks the current page in the sidebar", async () => {
    renderAt("/data-table");
    await waitFor(() => screen.getByText("Day 6 · Task 5"));

    const nav = screen.getByRole("navigation", { name: "Dashboard" });
    const active = within(nav).getByRole("link", { name: /Professional Data Table/ });
    expect(active).toHaveAttribute("aria-current", "page");
  });

  it("shows the task number and label in the topbar", async () => {
    renderAt("/charts");
    await waitFor(() => expect(screen.getByText("06 · Charts & Analytics")).toBeInTheDocument());
  });

  it("toggles the dark class on <html> and remembers it", async () => {
    renderAt("/ui-system");
    await waitFor(() => screen.getByText("Day 6 · Task 3"));

    expect(document.documentElement).not.toHaveClass("dark");

    await userEvent.click(screen.getByRole("button", { name: /switch to dark theme/i }));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("day6.theme")).toBe("dark");
  });
});

describe("a page that throws is contained", () => {
  it("keeps the sidebar usable", async () => {
    const Boom = () => {
      throw new Error("Page exploded");
    };

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <DashboardShell />,
          children: [
            {
              path: "boom",
              element: (
                <ErrorBoundary level="page" name="boom">
                  <Boom />
                </ErrorBoundary>
              )
            }
          ]
        }
      ],
      { initialEntries: ["/boom"] }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("This page failed to load")).toBeInTheDocument();
    // The whole point: navigation still works
    expect(screen.getByRole("navigation", { name: "Dashboard" })).toBeInTheDocument();
  });
});
