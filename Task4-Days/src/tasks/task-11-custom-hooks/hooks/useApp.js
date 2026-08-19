import { useOutletContext } from "react-router-dom";

/* useOutletContext returns undefined outside a route rather than throwing, so
   the failure surfaces as "cannot read property of undefined" somewhere far
   from the cause. This wrapper fails with a message that names the problem. */

export function useApp() {
  const context = useOutletContext();

  if (!context) {
    throw new Error("useApp must be called from a component rendered inside MainLayout's Outlet");
  }

  return context;
}
