import { ThemeProvider } from "@tasks/task-09-context-api/contexts/ThemeContext";
import { AuthProvider } from "@tasks/task-09-context-api/contexts/AuthContext";
import { ToastProvider } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import { CrudProvider } from "@store/CrudContext";

/* Task 9 — provider composition in one place.

   Order matters where one provider consumes another. CrudProvider is
   innermost because nothing above it needs the records; ToastProvider sits
   above it so a CRUD action can raise a toast. */

export default function AppProviders({ children, seeded = true }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CrudProvider seeded={seeded}>{children}</CrudProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
