import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "@store/CrudContext";
import { useToast } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import { useUiPreferences } from "./hooks/useUiPreferences";
import { read, sizeOf, write, remove } from "./hooks/useLocalStorage";

const KEYS = ["day5.crud", "day5.ui.v1", "day5.theme", "day5.auth"];

export default function Page() {
  const { actions } = useCrud();
  const { toast } = useToast();
  const [prefs, setPref] = useUiPreferences();
  const [tick, setTick] = useState(0);

  const refresh = () => setTick(value => value + 1);
  const saved = read("day5.crud", null);

  return (
    <>
      <PageHeader
        number={11}
        title="Local Persistence"
        brief="Save CRUD records, filters, and UI preferences in localStorage through reusable hooks"
        lead="Everything on this page survives a refresh. Press F5 and check."
        actions={
          <button type="button" className="btn btn--ghost btn--sm" onClick={refresh}>
            Re-read storage
          </button>
        }
      />

      <Section
        title="What's actually stored"
        note="Four keys, deliberately separate. Records change rarely and are large; UI preferences change constantly and are tiny. One key for both means rewriting the whole dataset every time someone toggles a view."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Holds</th>
              <th style={{ textAlign: "right" }}>Size</th>
            </tr>
          </thead>
          <tbody>
            {KEYS.map(key => (
              <tr key={`${key}-${tick}`}>
                <td>
                  <code>{key}</code>
                </td>
                <td className="muted tiny">
                  {
                    {
                      "day5.crud": "records, entity, filter, sort",
                      "day5.ui.v1": "view mode, density, page size",
                      "day5.theme": "light or dark",
                      "day5.auth": "the pretend signed-in user"
                    }[key]
                  }
                </td>
                <td style={{ textAlign: "right" }} className="tiny">
                  {sizeOf(key)} B
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="row">
          {["cards", "table"].map(view => (
            <button
              key={view}
              type="button"
              className={`btn btn--sm ${prefs.view === view ? "" : "btn--ghost"}`}
              onClick={() => {
                setPref("view", view);
                refresh();
              }}
            >
              Prefer {view}
            </button>
          ))}
          <span className="chip">saved preference: {prefs.view}</span>
        </div>
      </Section>

      <Section
        title="Transient state is stripped before saving"
        note="Persisting an in-flight operation means the app reloads believing a request is still running. The persist function picks only what should survive."
        code={`const [state, dispatch] = usePersistedReducer(crudReducer, initialState(), {
  key: "day5.crud",
  version: 1,
  // pending, failed, selected and search are deliberately NOT persisted
  persist: ({ records, entity, filter, sort }) => ({ records, entity, filter, sort })
});`}
      >
        <div className="grid">
          <div className="card card--flat">
            <p className="tiny muted">Persisted</p>
            <p className="small">records · entity · filter · sort</p>
          </div>
          <div className="card card--flat">
            <p className="tiny muted">Deliberately not</p>
            <p className="small">pending · failed · selected · search</p>
          </div>
        </div>
        <p className="section__note">
          Selection is arguably a judgement call. Restoring &ldquo;3 records selected&rdquo; after a
          refresh, when the user has no memory of selecting them, is worse than losing it.
        </p>
      </Section>

      <Section
        title="A version number"
        note="When the shape of the saved state changes, old data is discarded rather than merged into a half-migrated object. Bump the version and every browser starts clean."
        code={`const saved = read(key, null);

if (!saved || saved.__v !== version) {
  if (saved) console.warn(\`Discarding saved state — version \${saved.__v} ≠ \${version}\`);
  return initial;
}

return { ...initial, ...hydrate(saved.data) };   // spread over the default,
                                                  // so a new key is never undefined`}
      >
        <div className="row">
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => {
              write("day5.crud", { __v: 99, data: { records: {} } });
              toast.warning("Saved data is now version 99. Refresh the page.", { sticky: true });
              refresh();
            }}
          >
            Fake a version mismatch
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => {
              write("day5.crud", "{ this is not json");
              toast.warning("Storage corrupted on purpose. Refresh the page.", { sticky: true });
              refresh();
            }}
          >
            Corrupt the storage
          </button>
        </div>
        <p className="tiny muted">
          Press either, then refresh. The app starts from seed data with a console warning instead
          of a white screen — that recovery is the entire reason for the try/catch and the version
          check.
        </p>
      </Section>

      <Section
        title="The mount guard"
        note="Skipping the first write is not an optimisation. Without it, mounting immediately overwrites saved data with the default state on any run where hydration was rejected."
        code={`const mounted = useRef(false);

useEffect(() => {
  if (!mounted.current) {
    mounted.current = true;
    return;                    // ← skip the write on mount
  }
  write(key, { __v: version, savedAt: new Date().toISOString(), data: persist(state) });
}, [state, key, version]);`}
      >
        <p className="section__note">
          This is the bug that makes persistence look like it &ldquo;works sometimes&rdquo; — data
          survives a refresh but vanishes after a version bump, because the first effect wrote the
          defaults straight over it.
        </p>
      </Section>

      <Section
        title="Three facts about localStorage"
        code={`// 1. strings only — hence JSON.stringify going in, JSON.parse coming out
// 2. synchronous — writing a large object on every keystroke blocks the main thread
// 3. not secure — any script on the page can read it. Never store tokens.`}
      >
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>localStorage</th>
              <th>sessionStorage</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Survives a refresh", "yes", "yes"],
              ["Survives closing the tab", "yes", "no"],
              ["Shared between tabs", "yes", "no"],
              ["Typical limit", "~5MB per origin", "~5MB per origin"]
            ].map(([aspect, local, session]) => (
              <tr key={aspect}>
                <td className="muted">{aspect}</td>
                <td>{local}</td>
                <td>{session}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="section__note">
          It also throws — in private mode on older Safari, and when the quota is full. Every read
          and write in <code>useLocalStorage.js</code> is wrapped in try/catch for that reason.
        </p>
      </Section>

      <Section title="Reset">
        <div className="row">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              actions.reset();
              toast.success("Back to seed data.");
              refresh();
            }}
          >
            Reset to seed data
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => {
              actions.clear();
              toast.warning("All records cleared.");
              refresh();
            }}
          >
            Clear all records
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            style={{ color: "var(--bad)" }}
            onClick={() => {
              KEYS.forEach(remove);
              toast.error("Every key removed. Refresh to start clean.", { sticky: true });
              refresh();
            }}
          >
            Wipe every key
          </button>
        </div>

        {saved?.savedAt && (
          <p className="tiny muted">Last written: {new Date(saved.savedAt).toLocaleTimeString()}</p>
        )}

        <pre className="code" style={{ maxHeight: "220px", overflow: "auto" }}>
          {saved ? JSON.stringify(saved, null, 2).slice(0, 1400) : "(nothing stored)"}
        </pre>
      </Section>
    </>
  );
}
