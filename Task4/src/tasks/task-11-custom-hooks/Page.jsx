import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { getProducts, getUsers } from "@services";
import {
  useFetch,
  useDebounce,
  useLocalStorage,
  useDocumentTitle,
  useApp,
  usePrevious
} from "./hooks";
import { formatPrice } from "@shared/data";

export default function Page() {
  useDocumentTitle("Custom Hooks");

  const { user } = useApp();

  const [term, setTerm] = useState("");
  const debouncedTerm = useDebounce(term, 400);
  const previousTerm = usePrevious(debouncedTerm);

  const [favourites, setFavourites] = useLocalStorage("day4.favourites", []);
  const [resource, setResource] = useState("products");

  const query = useFetch(
    options =>
      resource === "products"
        ? getProducts({ limit: 5, search: debouncedTerm }, options)
        : getUsers({ limit: 5 }, options),
    [resource, debouncedTerm]
  );

  const rows = query.data?.products ?? query.data?.users ?? [];

  const toggleFavourite = id =>
    setFavourites(list => (list.includes(id) ? list.filter(item => item !== id) : [...list, id]));

  return (
    <>
      <PageHeader
        number={11}
        title="Custom Hooks"
        brief="Implement useFetch, useDebounce, useLocalStorage, and useDocumentTitle hooks"
        lead="Six hooks. Between them they remove about forty lines from every data page in this project."
      />

      <Section
        title="All six, working at once"
        note="This panel uses every hook in the folder. The list is fetched by useFetch, the search is debounced, the favourites survive a refresh, and the tab title came from useDocumentTitle."
      >
        <div className="stack">
          <div className="row">
            {["products", "users"].map(key => (
              <button
                key={key}
                type="button"
                className={`btn btn--sm ${resource === key ? "" : "btn--ghost"}`}
                onClick={() => setResource(key)}
              >
                {key}
              </button>
            ))}
          </div>

          {resource === "products" && (
            <div>
              <label htmlFor="search">Search (debounced 400ms)</label>
              <input
                id="search"
                type="search"
                placeholder="Try 'phone'"
                value={term}
                onChange={event => setTerm(event.target.value)}
              />
              <p className="tiny muted" style={{ marginTop: "0.25rem" }}>
                typing: <code>{term || "—"}</code> · debounced: <code>{debouncedTerm || "—"}</code>{" "}
                · previous: <code>{previousTerm ?? "—"}</code>
              </p>
            </div>
          )}

          <div style={{ minHeight: "150px" }}>
            {query.loading && (
              <div className="stack">
                <div className="skeleton" style={{ height: "2.4rem" }} />
                <div className="skeleton" style={{ height: "2.4rem" }} />
                <div className="skeleton" style={{ height: "2.4rem" }} />
              </div>
            )}

            {!query.loading && query.error && (
              <div className="state state--error">
                <strong>Request failed</strong>
                <p>{query.error}</p>
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: "0.6rem" }}
                  onClick={query.retry}
                >
                  Try again
                </button>
              </div>
            )}

            {!query.loading && !query.error && rows.length === 0 && (
              <div className="state">
                <strong>Nothing matches</strong>
                <p>Try a different search term.</p>
              </div>
            )}

            {!query.loading && !query.error && rows.length > 0 && (
              <ul className="list">
                {rows.map(row => {
                  const label = row.title ?? `${row.firstName} ${row.lastName}`;
                  return (
                    <li className="list__item" key={row.id}>
                      <span className="list__text">
                        <strong>{label}</strong>
                        {row.price && (
                          <span className="tiny muted"> · {formatPrice(row.price)}</span>
                        )}
                      </span>
                      <button
                        type="button"
                        className="btn btn--sm btn--ghost"
                        onClick={() => toggleFavourite(`${resource}-${row.id}`)}
                      >
                        {favourites.includes(`${resource}-${row.id}`) ? "★ Saved" : "☆ Save"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="tiny muted">
            {favourites.length} saved — refresh the page and they&apos;re still here. Signed in as{" "}
            {user.name}, read through <code>useApp()</code>.
          </p>
        </div>
      </Section>

      <Section
        title="What each one removes"
        code={`const { data, loading, error, retry } = useFetch(fn, [deps]);   // ~30 lines
const debounced = useDebounce(value, 400);                      // ~8 lines
const [saved, setSaved] = useLocalStorage("key", []);           // ~14 lines
useDocumentTitle("Custom Hooks");                               // ~6 lines
const app = useApp();                                           // + a useful error
const previous = usePrevious(value);                            // ~5 lines`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Hook</th>
              <th>Owns</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["useFetch", "loading, error, data, retry, abort on unmount and on dep change"],
              ["useDebounce", "one timer, cleared on every change"],
              ["useLocalStorage", "lazy read, write on change, try/catch on both"],
              ["useDocumentTitle", "sets the tab title, restores the previous on unmount"],
              ["useApp", "outlet context, with an error that names the problem"],
              ["usePrevious", "the value from the last render, via a ref"]
            ].map(([hook, owns]) => (
              <tr key={hook}>
                <td>
                  <code>{hook}</code>
                </td>
                <td className="muted">{owns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="useFetch — the ref that keeps the deps honest"
        note="The fetcher is almost always an inline arrow, so it has a new identity every render. Putting it in the dependency array creates an infinite loop; holding it in a ref keeps the deps to what actually matters."
        code={`const fetcherRef = useRef(fetcher);
fetcherRef.current = fetcher;              // updated every render, not a dependency

useEffect(() => {
  const controller = new AbortController();
  let active = true;

  fetcherRef.current({ signal: controller.signal })
    .then(result => { if (active) setData(result); })
    .catch(err => { if (active && err.name !== "AbortError") setError(err.message); })
    .finally(() => { if (active) setLoading(false); });

  return () => { active = false; controller.abort(); };
}, [...deps, reloadKey, enabled]);`}
      >
        <p className="section__note">
          <code>reloadKey</code> is how <code>retry</code> works — bumping a number re-runs the
          effect without any of the caller&apos;s dependencies changing.
        </p>
      </Section>

      <Section
        title="useDebounce — the cleanup IS the mechanism"
        code={`useEffect(() => {
  const timer = setTimeout(() => setDebounced(value), delay);
  return () => clearTimeout(timer);      // ← delete this line and it stops working
}, [value, delay]);`}
      >
        <p className="section__note">
          Without the cleanup you don&apos;t get a debounce — you get one delayed update per
          keystroke, all of them firing 400ms apart. Type in the box above and watch the two values
          diverge and then converge.
        </p>
      </Section>

      <Section
        title="The rules"
        code={`1. The name starts with "use", or React can't apply the rules of hooks to it.
2. A hook returns values, never JSX. If it renders, it's a component.
3. Hooks compose — useFetch calls useState, useEffect, useRef and useCallback.
4. Extract when you've written the same effect twice, not in anticipation.`}
      >
        <p className="section__note">
          Rule 4 is the one worth holding to. <code>useFetch</code> here exists because tasks 9, 10
          and 12 all needed the same thirty lines — not because a fetching hook seemed like a good
          idea in advance.
        </p>
      </Section>

      <Section
        title="What useFetch deliberately isn't"
        note="It's about forty lines. TanStack Query is thousands, and the difference is not padding."
        code={`useFetch has:      loading, error, data, retry, abort, dependency tracking
useFetch lacks:    caching, deduplication of identical in-flight requests,
                   background refetch, stale-while-revalidate, pagination
                   helpers, optimistic updates, devtools

// Write this to understand the problem. Reach for TanStack Query when the
// missing column starts mattering — usually the first time two components
// request the same data at once.`}
      >
        <p className="section__note">
          Switching between products and users above refetches every time, with no cache. That
          limitation is the honest reason libraries exist.
        </p>
      </Section>
    </>
  );
}
