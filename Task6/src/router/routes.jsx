import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import DashboardShell from "@layout/DashboardShell";
import ErrorBoundary from "@tasks/task-09-error-boundaries/components/ErrorBoundary";
import { LoadingState } from "@tasks/task-10-ux-states/components/states";

/* Task 8 — every page is lazy.

   React.lazy takes a function returning a dynamic import. Vite turns each one
   into its own chunk automatically, so opening the dashboard downloads the shell
   and the first page only. Run `npm run build` and count the files in dist/assets:
   the recharts chunk is separate, and it is only fetched when you visit /charts. */

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

/* Task 9 — the boundary sits inside the shell, so a page that throws leaves the
   sidebar and topbar usable. Suspense sits inside the boundary, so a chunk that
   fails to load also lands in the boundary rather than crashing the app. */
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardShell />,
    children: [
      { index: true, element: <Navigate to="/deliverable" replace /> },
      ...Object.keys(pages).map(slug => ({ path: slug, element: <Page slug={slug} /> })),
      {
        path: "*",
        element: (
          <div className="rounded-card border border-dashed p-10 text-center">
            <p className="text-sm font-semibold">No page at that address</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pick a task from the sidebar.
            </p>
          </div>
        )
      }
    ]
  }
]);
