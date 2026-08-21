import { RouterProvider } from "react-router-dom";
import { router } from "@/router/routes";
import ErrorBoundary from "@tasks/task-09-error-boundaries/components/ErrorBoundary";

export default function App() {
  /* The outermost boundary is the last resort: if the shell itself throws,
     the user still gets a styled page rather than a blank white screen. */
  return (
    <ErrorBoundary level="page" name="Application">
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
