import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader, Section } from "@shared/Section";
import { products, categories, formatPrice, titleCase } from "@shared/data";
import { cx } from "@shared/cx";

const SORTS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
  { value: "name", label: "Name A–Z" }
];

const STOCK = [
  { value: "all", label: "All stock" },
  { value: "in", label: "In stock" },
  { value: "out", label: "Out of stock" }
];

export default function Page() {
  const [params, setParams] = useSearchParams();

  /* Every control reads from the URL. There is no useState mirroring these —
     the query string IS the state, which is what makes the view shareable. */
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "all";
  const stock = params.get("stock") ?? "all";
  const sort = params.get("sort") ?? "default";
  const limit = Number(params.get("limit") ?? 6);
  const page = Math.max(Number(params.get("page") ?? 1), 1);

  // A local mirror only for the text input, so typing stays responsive while
  // the URL updates on a delay.
  const [term, setTerm] = useState(search);
  useEffect(() => setTerm(search), [search]);

  const setParam = useCallback(
    (updates, { resetPage = true } = {}) => {
      setParams(
        prev => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            // Drop defaults instead of writing ?category=all&sort=default —
            // a clean URL is the whole point
            if (!value || value === "all" || value === "default") next.delete(key);
            else next.set(key, value);
          });
          if (resetPage) next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  // Debounce: one history entry per pause, not one per keystroke
  useEffect(() => {
    if (term === search) return undefined;
    const timer = setTimeout(() => setParam({ search: term }), 350);
    return () => clearTimeout(timer);
  }, [term, search, setParam]);

  const filtered = products
    .filter(item => (category === "all" ? true : item.category === category))
    .filter(item => (stock === "in" ? item.stock > 0 : stock === "out" ? item.stock === 0 : true))
    .filter(item => item.name.toLowerCase().includes(search.trim().toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const pageCount = Math.max(Math.ceil(sorted.length / limit), 1);
  const safePage = Math.min(page, pageCount);
  const visible = sorted.slice((safePage - 1) * limit, safePage * limit);

  const hasFilters = search || category !== "all" || stock !== "all" || sort !== "default";

  return (
    <>
      <PageHeader
        number={6}
        title="URL Search Params"
        brief="Use query params for search, category, status, page, limit, and sort order"
        lead="Six controls, zero useState for their values. Copy the URL, open it in a new tab — same view."
        actions={
          hasFilters && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setParams({}, { replace: true })}
            >
              Clear all
            </button>
          )
        }
      />

      <Section
        title="The live query string"
        note="Change anything below and watch this update. This is the entire state of the page."
      >
        <pre className="code">{`${window.location.pathname}${params.toString() ? `?${params}` : "  (no params — everything is at its default)"}`}</pre>
      </Section>

      <Section title="The controls">
        <div className="stack">
          <div className="grid">
            <div>
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="search"
                placeholder="Try 'monitor'"
                value={term}
                onChange={event => setTerm(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={event => setParam({ category: event.target.value })}
              >
                <option value="all">All categories</option>
                {categories.map(item => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="stock">Stock</label>
              <select
                id="stock"
                value={stock}
                onChange={event => setParam({ stock: event.target.value })}
              >
                {STOCK.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort">Sort</label>
              <select
                id="sort"
                value={sort}
                onChange={event => setParam({ sort: event.target.value })}
              >
                {SORTS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="limit">Per page</label>
              <select
                id="limit"
                value={limit}
                onChange={event => setParam({ limit: event.target.value })}
              >
                {[3, 6, 12].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="tiny muted">
            {sorted.length} result{sorted.length === 1 ? "" : "s"} · page {safePage} of {pageCount}
          </p>

          {visible.length === 0 ? (
            <div className="state">
              <strong>Nothing matches</strong>
              <p>Try a different search, category or stock filter.</p>
            </div>
          ) : (
            <div className="products">
              {visible.map(product => (
                <article className="product" key={product.id}>
                  <div className="product__thumb">{product.emoji}</div>
                  <div className="product__body">
                    <p className="product__name">{product.name}</p>
                    <p className="tiny muted">
                      {titleCase(product.category)} · {product.rating}★
                    </p>
                    <p className="product__price">{formatPrice(product.price)}</p>
                    {/* Carry the current filters into the detail page, so Back returns here */}
                    <Link
                      className="btn btn--sm"
                      to={`/dynamic-routes/${product.id}?${params.toString()}`}
                    >
                      View
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={safePage === 1}
                onClick={() => setParam({ page: safePage - 1 }, { resetPage: false })}
              >
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => (
                <button
                  key={number}
                  type="button"
                  className={cx("btn", "btn--ghost", "btn--sm", number === safePage && "is-active")}
                  aria-current={number === safePage ? "page" : undefined}
                  onClick={() =>
                    setParam({ page: number === 1 ? "" : number }, { resetPage: false })
                  }
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={safePage === pageCount}
                onClick={() => setParam({ page: safePage + 1 }, { resetPage: false })}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </Section>

      <Section
        title="Why the URL and not useState"
        note="Four things you get for free, and lose the moment you mirror this into component state."
        code={`const [params, setParams] = useSearchParams();
const category = params.get("category") ?? "all";     // read
setParams(prev => { const n = new URLSearchParams(prev); n.set("sort", "price-asc"); return n; });`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>You get</th>
              <th>Because</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Shareable views", "the URL contains everything — paste it to a colleague"],
              ["A working back button", "each change is a history entry, so Back undoes a filter"],
              ["Refresh-proof state", "reload and the filters survive, with no localStorage"],
              ["Deep links", "/url-search-params?search=monitor&sort=price-asc works from cold"]
            ].map(([gain, why]) => (
              <tr key={gain}>
                <td>{gain}</td>
                <td className="muted">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Four details in this implementation"
        code={`// 1. always update from the previous params — never build a fresh
//    URLSearchParams, or you silently wipe every other filter
setParams(prev => { const next = new URLSearchParams(prev); … });

// 2. drop defaults, so the URL stays readable
if (!value || value === "all") next.delete(key); else next.set(key, value);

// 3. changing a filter resets the page — otherwise you land on page 4 of 2
if (resetPage) next.delete("page");

// 4. replace: true while typing, so Back doesn't step through every keystroke
setParams(next, { replace: true });`}
      >
        <p className="section__note">
          The second one is easy to skip and immediately visible: without it, touching every control
          once gives you{" "}
          <code>?search=&amp;category=all&amp;stock=all&amp;sort=default&amp;page=1</code> — a URL
          that says nothing.
        </p>
      </Section>

      <Section
        title="Everything arrives as a string"
        code={`const limit = params.get("limit");          // "6", not 6
const limit = Number(params.get("limit") ?? 6);

const page = Math.max(Number(params.get("page") ?? 1), 1);   // guard ?page=-3
const safePage = Math.min(page, pageCount);                  // guard ?page=99`}
      >
        <p className="section__note">
          Anyone can type anything into the address bar, so a param is untrusted input. Try{" "}
          <code>?page=999</code> — it clamps to the last page rather than showing an empty grid.
        </p>
      </Section>
    </>
  );
}
