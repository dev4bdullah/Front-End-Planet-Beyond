import { useOutletContext } from "react-router-dom";
import { PageHeader, Section } from "@shared/Section";

/* Nested three levels below MainLayout, still reading its state — with no
   props passed anywhere along the way. */
function DeepChild() {
  const { user, settings } = useOutletContext();

  return (
    <div className="card card--flat">
      <p className="tiny muted">A component nested inside this page</p>
      <p className="small">
        Reads <strong>{user.name}</strong> and theme <strong>{settings.theme}</strong> — it received
        no props at all.
      </p>
    </div>
  );
}

export default function Page() {
  const { user, settings, updateSetting } = useOutletContext();

  return (
    <>
      <PageHeader
        number={7}
        title="Outlet Context"
        brief="Pass layout-level user/settings data through useOutletContext where appropriate"
        lead="The layout owns the user and settings. Any route below it can read them, at any depth."
      />

      <Section
        title="Live — this page is editing MainLayout's state"
        note="Change the theme or density below and the whole app responds. The values live in MainLayout; this page never received them as props."
      >
        <div className="grid">
          <div>
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={event => updateSetting("theme", event.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label htmlFor="density">Density</label>
            <select
              id="density"
              value={settings.density}
              onChange={event => updateSetting("density", event.target.value)}
            >
              <option value="cosy">Cosy</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </div>

        <div className="card card--flat">
          <p className="tiny muted">What the context currently holds</p>
          <pre className="code">{JSON.stringify({ user, settings }, null, 2)}</pre>
        </div>

        <DeepChild />
      </Section>

      <Section
        title="Both halves"
        note="The parent passes a context prop to Outlet; any descendant route reads it with useOutletContext. That's the entire API."
        code={`// MainLayout.jsx — the provider half
<Outlet context={{ user, settings, updateSetting }} />

// any child route — the consumer half
const { user, settings, updateSetting } = useOutletContext();

// DashboardLayout is a child AND a parent, so it forwards:
const app = useOutletContext();
<Outlet context={app} />          // ← without this line, task 4's panels get undefined`}
      >
        <p className="section__note">
          That forwarding line is the part people miss. A nested layout doesn&apos;t pass context
          through automatically — each layer that renders its own <code>Outlet</code> decides what
          the next layer receives.
        </p>
      </Section>

      <Section
        title="What it replaces"
        code={`// ❌ prop drilling — every layer has to know about a prop it doesn't use
<MainLayout user={user}>
  <DashboardLayout user={user}>
    <UsersPage user={user}>
      <UserCard user={user} />

// ✅ outlet context — the layers in between don't mention it
<Outlet context={{ user }} />`}
      >
        <p className="section__note">
          Worth noticing: <code>updateSetting</code> is passed down too. Context isn&apos;t only for
          data — passing the setter is what lets a child write back to the layout.
        </p>
      </Section>

      <Section
        title="Outlet context vs React context vs a store"
        note="They solve overlapping problems, and picking the heaviest one first is a common mistake."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Use</th>
              <th>When</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Outlet context",
                "data owned by a layout, needed by its routes",
                "free, already there"
              ],
              [
                "React context",
                "needed by components outside the route tree too, e.g. a portal modal",
                "a provider and a hook per concern"
              ],
              [
                "Zustand / Redux",
                "genuinely global, updated from many places, needs devtools",
                "a dependency and a mental model"
              ],
              ["Props", "one or two levels", "nothing — still the right default"]
            ].map(([tool, when, cost]) => (
              <tr key={tool}>
                <td>
                  <strong>{tool}</strong>
                </td>
                <td className="muted">{when}</td>
                <td className="muted">{cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="The limitation worth knowing"
        note="Outlet context is not memoised, and it's not typed. Two consequences."
        code={`// 1. a new object literal every render means every consumer re-renders
<Outlet context={{ user, settings }} />           // new object each time

const value = useMemo(() => ({ user, settings, updateSetting }),
                      [user, settings, updateSetting]);
<Outlet context={value} />                        // stable

// 2. useOutletContext() returns undefined outside a route — it doesn't throw
const context = useOutletContext();
context.user.name                                  // 💥 if used outside the tree`}
      >
        <p className="section__note">
          The second one produces a confusing error message, because the failure surfaces as
          &ldquo;cannot read property of undefined&rdquo; rather than &ldquo;you&apos;re outside the
          router&rdquo;. Task 11 wraps it in a <code>useApp()</code> hook that throws a useful
          message instead.
        </p>
      </Section>
    </>
  );
}
