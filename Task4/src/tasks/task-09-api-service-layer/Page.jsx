import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { getProducts, getUsers, getBroken } from "@services";
import { formatPrice } from "@shared/data";

/* Deliberately written WITHOUT useFetch, so the raw shape is visible.
   Task 11 collapses all of this into three lines. */

const SOURCES = {
  products: { label: "products", call: getProducts },
  users: { label: "users", call: getUsers },
  broken: { label: "data", call: getBroken },
  offline: {
    label: "data",
    call: () => fetch("https://no-such-host-9x7q.dev/x").then(response => response.json())
  },
  timeout: { label: "products", call: options => getProducts({}, { ...options, timeout: 1 }) }
};

export default function Page() {
  const [state, setState] = useState({ status: "idle", data: null, error: null });
  const [source, setSource] = useState("products");
  const [log, setLog] = useState([]);

  async function load(key) {
    setSource(key);
    setState({ status: "loading", data: null, error: null });
    setLog(list => [`request → ${key}`, ...list].slice(0, 6));

    try {
      const data = await SOURCES[key].call({ limit: 6 });
      const rows = data.products ?? data.users ?? [];
      setState({ status: rows.length ? "success" : "empty", data: rows, error: null });
      setLog(list => [`${rows.length} rows returned`, ...list].slice(0, 6));
    } catch (error) {
      setState({ status: "error", data: null, error });
      setLog(list => [`${error.name}: ${error.message}`, ...list].slice(0, 6));
    }
  }

  return (
    <>
      <PageHeader
        number={9}
        title="API Service Layer"
        brief="Create reusable fetch or axios service functions with centralized error handling"
        lead="One http wrapper, one module per resource, and nothing in a component that knows about URLs."
      />

      <Section
        title="Try every outcome"
        note="Five buttons, five different failure modes. The error message tells you which — a bad status, a dead host and a timeout are three different problems."
      >
        <div className="row">
          {Object.keys(SOURCES).map(key => (
            <button
              key={key}
              type="button"
              className={`btn btn--sm ${source === key && state.status !== "idle" ? "" : "btn--ghost"}`}
              onClick={() => load(key)}
            >
              {key}
            </button>
          ))}
        </div>

        <div style={{ minHeight: "150px" }}>
          {state.status === "idle" && (
            <div className="state">
              <strong>Nothing requested yet</strong>
              <p>Press a button above.</p>
            </div>
          )}

          {state.status === "loading" && (
            <div className="state">
              <div className="spinner" />
              Loading {SOURCES[source].label}…
            </div>
          )}

          {state.status === "empty" && (
            <div className="state">
              <strong>Nothing came back</strong>
              <p>The request succeeded and returned an empty list.</p>
            </div>
          )}

          {state.status === "error" && (
            <div className="state state--error">
              <strong>Request failed</strong>
              <p>{state.error.message}</p>
              {state.error.status && (
                <p className="tiny">
                  status: <code>{state.error.status}</code>
                </p>
              )}
              {!state.error.status && (
                <p className="tiny">no status at all — the request never reached a server</p>
              )}
              <button
                type="button"
                className="btn"
                style={{ marginTop: "0.7rem" }}
                onClick={() => load(source)}
              >
                Try again
              </button>
            </div>
          )}

          {state.status === "success" && (
            <ul className="list">
              {state.data.map(row => (
                <li className="list__item" key={row.id}>
                  <span className="list__text">
                    <strong>{row.title ?? `${row.firstName} ${row.lastName}`}</strong>
                    <span className="tiny muted"> · {row.category ?? row.email}</span>
                  </span>
                  {row.price && <span className="badge">{formatPrice(row.price)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {log.length > 0 && <pre className="code">{log.map(line => `> ${line}`).join("\n")}</pre>}
      </Section>

      <Section
        title="The structure"
        note="Three files. Components import from @services and never see a URL, a header or a status code."
        code={`services/
├── http.js             the wrapper — base URL, timeout, abort, status check, ApiError
├── productService.js   getProducts, getProductById, getCategories
├── userService.js      getUsers, getUserById
└── index.js            one import path: import { getProducts } from "@services"`}
      >
        <p className="section__note">
          Nothing in <code>services/</code> imports React. They&apos;re plain async functions, which
          means they can be called from a hook, a test, or a Node script without change.
        </p>
      </Section>

      <Section
        title="What the wrapper centralises"
        code={`export async function request(path, { signal, timeout = 10000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // a caller's signal must ALSO be able to cancel this
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const response = await fetch(\`\${BASE}\${path}\`, { signal: controller.signal, ...options });

    // fetch does NOT reject on 404 or 500 — the single most common async bug
    if (!response.ok) throw new ApiError(\`Request failed with \${response.status}\`,
                                          { status: response.status });

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw error;      // not a failure
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message, { url });        // network failure, no status
  } finally {
    clearTimeout(timer);                                // always, both paths
  }
}`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Handled once</th>
              <th>Instead of</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Base URL", "a hardcoded string in every component"],
              ["res.ok checking", "forgetting it in three of five places"],
              ["Timeout", "fetch has none — a dead request hangs forever"],
              ["Abort forwarding", "cleanup that silently doesn't cancel anything"],
              ["Error shape", "sometimes a string, sometimes an object, sometimes a Response"]
            ].map(([here, there]) => (
              <tr key={here}>
                <td>{here}</td>
                <td className="muted">{there}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="A custom error class"
        note="ApiError carries the status and the URL, so a caller can branch on 401 vs 500 without parsing a message string. A network failure has no status — that absence is itself the signal."
        code={`export class ApiError extends Error {
  constructor(message, { status, url } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

// callers can then do:
if (error.status === 401) redirectToLogin();
if (!error.status) showOfflineBanner();       // never reached a server`}
      >
        <p className="section__note">
          Press <strong>broken</strong> and <strong>offline</strong> above and compare the panel:
          one shows a status, the other explicitly says there wasn&apos;t one.
        </p>
      </Section>

      <Section
        title="Normalising at the boundary"
        note="The categories endpoint has shipped as both an array of strings and an array of objects. The service normalises it, so no component ever has to handle both shapes."
        code={`export async function getCategories(options = {}) {
  const data = await request("/products/categories", options);

  return data.map(item =>
    typeof item === "string" ? { slug: item, name: item }
                             : { slug: item.slug, name: item.name }
  );
}`}
      >
        <p className="section__note">
          This is the quiet argument for a service layer. When an API changes shape, exactly one
          file needs editing — and you can find it without searching the codebase for{" "}
          <code>fetch(</code>.
        </p>
      </Section>

      <Section
        title="fetch or axios"
        code={`// axios gives you: interceptors, automatic JSON, a real timeout option,
//                  better error objects, upload progress
// fetch gives you: no dependency, and it's already there

// Once you've written this wrapper, the gap is small — which is the point.
// The abstraction matters more than the library underneath it.`}
      >
        <p className="section__note">
          Swapping this file for axios would change nothing in any component, because none of them
          import <code>fetch</code> or <code>axios</code> directly. That&apos;s the test of whether
          a service layer is doing its job.
        </p>
      </Section>
    </>
  );
}
