import { render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routes } from "@/router/routes";
import AppProviders from "@providers/AppProviders";

/* Renders the real route tree with the real providers, so tests exercise what
   ships rather than a parallel copy. */
export function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
