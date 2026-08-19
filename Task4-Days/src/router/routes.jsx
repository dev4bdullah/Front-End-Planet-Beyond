import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "@layout/MainLayout";

import RouterSetupPage from "@tasks/task-01-react-router-setup/Page";
import BasePagesPage from "@tasks/task-02-base-pages/Page";
import Home from "@tasks/task-02-base-pages/pages/Home";
import About from "@tasks/task-02-base-pages/pages/About";
import Products from "@tasks/task-02-base-pages/pages/Products";
import NotFound from "@tasks/task-02-base-pages/pages/NotFound";
import SharedLayoutsPage from "@tasks/task-03-shared-layouts/Page";
import NestedRoutesPage from "@tasks/task-04-nested-routes/Page";
import DashboardLayout from "@tasks/task-04-nested-routes/dashboard/DashboardLayout";
import {
  Overview,
  Profile,
  DashProducts,
  Analytics,
  DashSettings,
  Users,
  UserDetail
} from "@tasks/task-04-nested-routes/dashboard/panels";
import DynamicRoutesPage from "@tasks/task-05-dynamic-routes/Page";
import ProductDetail from "@tasks/task-05-dynamic-routes/ProductDetail";
import SearchParamsPage from "@tasks/task-06-url-search-params/Page";
import OutletContextPage from "@tasks/task-07-outlet-context/Page";
import NavigationUxPage from "@tasks/task-08-navigation-ux/Page";
import ApiServicePage from "@tasks/task-09-api-service-layer/Page";
import CleanupPage from "@tasks/task-10-useeffect-and-cleanup/Page";
import CustomHooksPage from "@tasks/task-11-custom-hooks/Page";
import DeliverablePage from "@tasks/task-12-deliverable/Page";
import DeliverableDetail from "@tasks/task-12-deliverable/components/ProductDetail";

/* Task 1 — the entire route tree in one file, so the shape of the app is
   visible at a glance rather than scattered across components. */

export const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },

      { path: "router-setup", element: <RouterSetupPage /> },

      // Task 2 — a layout route with its own tabbed children
      {
        path: "base-pages",
        element: <BasePagesPage />,
        children: [
          { index: true, element: <Home /> },
          { path: "about", element: <About /> },
          { path: "products", element: <Products /> },
          { path: "*", element: <NotFound /> }
        ]
      },

      { path: "shared-layouts", element: <SharedLayoutsPage /> },

      // Task 4 — a pathless layout route, so the URL stays /nested-routes/profile
      {
        path: "nested-routes",
        element: <NestedRoutesPage />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Overview /> },
              { path: "profile", element: <Profile /> },
              { path: "products", element: <DashProducts /> },
              { path: "analytics", element: <Analytics /> },
              { path: "settings", element: <DashSettings /> },
              {
                path: "users",
                children: [
                  { index: true, element: <Users /> },
                  { path: ":id", element: <UserDetail /> }
                ]
              }
            ]
          }
        ]
      },

      // Task 5 — a dynamic segment
      {
        path: "dynamic-routes",
        element: <DynamicRoutesPage />,
        children: [{ path: ":id", element: <ProductDetail /> }]
      },

      { path: "url-search-params", element: <SearchParamsPage /> },
      { path: "outlet-context", element: <OutletContextPage /> },
      { path: "navigation-ux", element: <NavigationUxPage /> },
      { path: "api-service-layer", element: <ApiServicePage /> },
      { path: "useeffect-cleanup", element: <CleanupPage /> },
      { path: "custom-hooks", element: <CustomHooksPage /> },

      // Task 12 — list and detail sharing one parent
      {
        path: "deliverable",
        element: <DeliverablePage />,
        children: [{ path: ":id", element: <DeliverableDetail /> }]
      },

      // An old link kept alive. `replace` so Back doesn't bounce through it again.
      { path: "shop", element: <Navigate to="/deliverable" replace /> },

      // Must be last — and it renders inside the layout, so navigation survives
      { path: "*", element: <NotFound /> }
    ]
  }
];

export const router = createBrowserRouter(routes);
