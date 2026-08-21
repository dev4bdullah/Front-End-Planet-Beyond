import { PageHeader, Section } from "@shared/Section";
import { useTheme } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import { useToast } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import { useCrud } from "@store/CrudContext";
import { titleCase } from "@model/model";

/* A component nested a few levels down, to show the reach of context. */
function DeepChild() {
  const { theme } = useTheme();
  const { user, can } = useAuth();

  return (
    <div className="card card--flat">
      <p className="tiny muted">A component nested inside this page</p>
      <p className="small">
        theme <strong>{theme}</strong> · user <strong>{user?.name ?? "signed out"}</strong> · can
        delete: <strong>{String(can("delete"))}</strong>
      </p>
      <p className="tiny muted">It received no props at all.</p>
    </div>
  );
}

export default function Page() {
  const { theme, toggle } = useTheme();
  const { role, can, login, logout, PERMISSIONS } = useAuth();
  const { toast } = useToast();
  const { stats } = useCrud();

  return (
    <>
      <PageHeader
        number={9}
        title="Context API"
        brief="Create ThemeContext, AuthContext, and ToastContext for app-level state"
        lead="Four providers, each owning one concern. The rule: context is for state many components need, not for state that's merely inconvenient to pass."
      />

      <Section
        title="Provider composition"
        note="Order matters where one provider consumes another. CrudProvider is innermost because nothing above it needs the records; ToastProvider sits above it so a CRUD action can raise a toast."
        code={`// providers/AppProviders.jsx
<ThemeProvider>
  <AuthProvider>
    <ToastProvider>
      <CrudProvider>{children}</CrudProvider>
    </ToastProvider>
  </AuthProvider>
</ThemeProvider>`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Context</th>
              <th>Owns</th>
              <th>Consumed by</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["ThemeContext", "light/dark, persisted", "the shell, this page"],
              [
                "AuthContext",
                "the current user and permissions",
                "every page that hides an action"
              ],
              ["ToastContext", "raising notifications", "every CRUD action in Day 5"],
              ["CrudContext", "records + the reducer (task 10)", "tasks 2–5, 11, 12, 13"]
            ].map(([name, owns, consumers]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td className="muted tiny">{owns}</td>
                <td className="muted tiny">{consumers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Theme"
        note="One class on <html>, one value in localStorage. Every component follows without any of them holding a colour."
      >
        <div className="row">
          <button type="button" className="btn btn--sm" onClick={toggle}>
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
          <span className="chip">current: {theme}</span>
        </div>
      </Section>

      <Section
        title="Auth and permissions"
        note="A pretend auth context — no server, no token. Its job is the shape: a user, a role, and a can() check that components use instead of comparing role strings themselves."
        code={`const PERMISSIONS = {
  admin:  ["read", "create", "update", "delete"],
  editor: ["read", "create", "update"],
  viewer: ["read"]
};

const can = useCallback(
  action => Boolean(user && PERMISSIONS[user.role]?.includes(action)),
  [user]
);

// in a component
{can("delete") && <button>Delete</button>}`}
      >
        <div className="row">
          {Object.keys(PERMISSIONS).map(name => (
            <button
              key={name}
              type="button"
              className={`btn btn--sm ${role === name ? "" : "btn--ghost"}`}
              onClick={() => {
                login(name);
                toast.info(`Signed in as ${name}.`);
              }}
            >
              {titleCase(name)}
            </button>
          ))}
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => {
              logout();
              toast.warning("Signed out.");
            }}
          >
            Sign out
          </button>
        </div>

        <div className="grid">
          {["read", "create", "update", "delete"].map(action => (
            <div className="stat" key={action}>
              <b style={{ color: can(action) ? "var(--ok)" : "var(--bad)" }}>
                {can(action) ? "yes" : "no"}
              </b>
              <span>{action}</span>
            </div>
          ))}
        </div>

        <p className="tiny muted">
          Switch to <strong>viewer</strong>, then open task 5 — the delete buttons are still there,
          because this is a demo and hiding them would make that page useless. In a real app{" "}
          <code>can(&quot;delete&quot;)</code> gates them, and the server checks again anyway.
        </p>

        <DeepChild />
      </Section>

      <Section
        title="The three mistakes"
        code={`// 1. no memo on the value — every consumer re-renders whenever the provider does
const value = useMemo(() => ({ user, can, login, logout }), [user, can, login, logout]);

// 2. one giant AppContext holding everything — a theme toggle then
//    re-renders every component reading the records
//    → one context per concern, which is why there are four here

// 3. returning undefined outside the provider, so the failure appears
//    somewhere far from the cause
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an <AuthProvider>");
  return context;
}`}
      >
        <p className="section__note">
          The third one is a two-line habit that saves an afternoon. Without it you get
          &ldquo;cannot read property &apos;user&apos; of undefined&rdquo; pointing at a component
          that is entirely innocent.
        </p>
      </Section>

      <Section
        title="When context is the wrong tool"
        note="Context is not a state manager — it's a way of passing a value down without props. It has no batching, no selectors, and any change re-renders every consumer."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Situation</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["One or two levels deep", "props — still the right default"],
              ["Rarely-changing app-wide value", "context (theme, user, locale)"],
              ["Frequently-changing value read by many", "context + a reducer, or a store library"],
              ["Server data", "TanStack Query — caching and refetching are not context's job"],
              ["Form state", "react-hook-form (task 7), not a context per field"]
            ].map(([situation, tool]) => (
              <tr key={situation}>
                <td className="muted">{situation}</td>
                <td>{tool}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="section__note">
          The records here sit in a context because this is a client-only demo with {stats().total}{" "}
          rows. Backed by an API, they&apos;d belong in a query cache instead.
        </p>
      </Section>
    </>
  );
}
