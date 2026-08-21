import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "@shared/AppShell";

import DataModelPage from "@tasks/task-01-crud-data-model/Page";
import ReadViewsPage from "@tasks/task-02-read-views/Page";
import CreateFlowPage from "@tasks/task-03-create-flow/Page";
import UpdateFlowPage from "@tasks/task-04-update-flow/Page";
import DeleteFlowPage from "@tasks/task-05-delete-flow/Page";
import ManualValidationPage from "@tasks/task-06-manual-validation/Page";
import ReactHookFormPage from "@tasks/task-07-react-hook-form/Page";
import ToastPage from "@tasks/task-08-toast-notifications/Page";
import ContextPage from "@tasks/task-09-context-api/Page";
import ReducerPage from "@tasks/task-10-usereducer-crud-logic/Page";
import PersistencePage from "@tasks/task-11-local-persistence/Page";
import OptimisticPage from "@tasks/task-12-optimistic-ui/Page";
import DeliverablePage from "@tasks/task-13-deliverable/Page";

export const routes = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/deliverable" replace /> },
      { path: "data-model", element: <DataModelPage /> },
      { path: "read-views", element: <ReadViewsPage /> },
      { path: "create-flow", element: <CreateFlowPage /> },
      { path: "update-flow", element: <UpdateFlowPage /> },
      { path: "delete-flow", element: <DeleteFlowPage /> },
      { path: "manual-validation", element: <ManualValidationPage /> },
      { path: "react-hook-form", element: <ReactHookFormPage /> },
      { path: "toast-notifications", element: <ToastPage /> },
      { path: "context-api", element: <ContextPage /> },
      { path: "usereducer-crud", element: <ReducerPage /> },
      { path: "local-persistence", element: <PersistencePage /> },
      { path: "optimistic-ui", element: <OptimisticPage /> },
      { path: "deliverable", element: <DeliverablePage /> },
      {
        path: "*",
        element: (
          <div className="state">
            <strong>No page at that address</strong>
            <p>Pick a task from the sidebar.</p>
          </div>
        )
      }
    ]
  }
];

export const router = createBrowserRouter(routes);
