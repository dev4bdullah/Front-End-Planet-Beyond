import { useCallback, useEffect, useState } from "react";
import { Outlet, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { PageHeader, Section } from "@shared/Section";
import { getProducts, getCategories } from "@services";
import { useFetch, useDebounce, useDocumentTitle, useApp } from "@hooks";
import { cx } from "@shared/cx";
import { titleCase } from "@shared/data";
import ProductGrid from "./components/ProductGrid";

const SORTS = [
  { value: "default", label: "Default order" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
  { value: "title", label: "Title A–Z" }
];

export default function Page() {
  const params_ = useParams();
  const isDetail = Boolean(params_.id);

  const [params, setParams] = useSearchParams();
  const { user } = useApp();
  const app = useOutletContext();

  useDocumentTitle(isDetail ? null : "Products");

  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "default";
  const limit = Number(params.get("limit") ?? 8);
  const page = Math.max(Number(params.get("page") ?? 1), 1);

  const [term, setTerm] = useState(search);
  const debouncedTerm = useDebounce(term, 400);

  useEffect(() => setTerm(search), [search]);

  const setParam = useCallback(
    (updates, { resetPage = true } = {}) => {
      setParams(
        prev => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
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

  useEffect(() => {
    if (debouncedTerm !== search) setParam({ search: debouncedTerm });
  }, [debouncedTerm, search, setParam]);

  const categoriesQuery = useFetch(options => getCategories(options), [], { enabled: !isDetail });

  const productsQuery = useFetch(
    options => getProducts({ limit, skip: (page - 1) * limit, search, category }, options),
    [limit, page, search, category],
    { enabled: !isDetail }
  );

  const rows = productsQuery.data?.products ?? [];
  const total = productsQuery.data?.total ?? 0;
  const pageCount = Math.max(Math.ceil(total / limit), 1);

  // Sorting is applied to the current page of results, client-side
  const visible = [...rows].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  const hasFilters = search || category !== "all" || sort !== "default";

  /* On a detail route this page renders only the child. Keeping the list
     mounted underneath would refetch it on every product view. */
  if (isDetail) {
    return (
      <>
        <PageHeader
          number={12}
          title="Deliverable"
          brief="Build a routed product listing app with detail pages, URL-based filters, pagination, loading, error, and empty states"
          lead="A detail route — the list is unmounted, and its filters are preserved in the query string."
        />
        <Section title="Product detail">
          <Outlet context={app} />
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        number={12}
        title="Deliverable"
        brief="Build a routed product listing app with detail pages, URL-based filters, pagination, loading, error, and empty states"
        lead={`Every task in one app. Signed in as ${user.name}.`}
        actions={
          hasFilters && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setParams({}, { replace: true })}
            >
              Clear filters
            </button>
          )
        }
      />

      <Section
        title="Catalogue"
        note="Search, category, sort, page size and page all live in the URL. Copy the address bar into a new tab and you get the identical view."
      >
        <div className="stack">
          <div className="grid">
            <div>
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="search"
                placeholder="Try 'phone'"
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
                {(categoriesQuery.data ?? []).map(item => (
                  <option key={item.slug} value={item.slug}>
                    {titleCase(item.name)}
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
                {[4, 8, 12].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="tiny muted">
            {productsQuery.loading
              ? "Loading…"
              : `${total} result${total === 1 ? "" : "s"} · page ${page} of ${pageCount}`}
          </p>

          {/* ---------- the four states ---------- */}

          {productsQuery.loading && (
            <div className="products">
              {Array.from({ length: Math.min(limit, 8) }, (_, index) => (
                <div className="product" key={index}>
                  <div className="skeleton" style={{ height: "110px", borderRadius: 0 }} />
                  <div className="product__body">
                    <div className="skeleton" style={{ height: "0.9rem", width: "80%" }} />
                    <div className="skeleton" style={{ height: "1.2rem", width: "45%" }} />
                    <div className="skeleton" style={{ height: "1.8rem" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!productsQuery.loading && productsQuery.error && (
            <div className="state state--error">
              <strong>Couldn&apos;t load the catalogue</strong>
              <p>{productsQuery.error}</p>
              <button
                type="button"
                className="btn"
                style={{ marginTop: "0.7rem" }}
                onClick={productsQuery.retry}
              >
                Try again
              </button>
            </div>
          )}

          {!productsQuery.loading && !productsQuery.error && visible.length === 0 && (
            <div className="state">
              <strong>{hasFilters ? "Nothing matches" : "No products"}</strong>
              <p>
                {hasFilters
                  ? "Your filters excluded every product — the data is still there."
                  : "The API returned an empty catalogue."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: "0.7rem" }}
                  onClick={() => setParams({}, { replace: true })}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!productsQuery.loading && !productsQuery.error && visible.length > 0 && (
            <>
              <ProductGrid products={visible} />

              {pageCount > 1 && (
                <nav className="pager" aria-label="Pagination">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={page === 1}
                    onClick={() => setParam({ page: page - 1 }, { resetPage: false })}
                  >
                    Previous
                  </button>

                  {Array.from({ length: pageCount }, (_, index) => index + 1)
                    .filter(n => n === 1 || n === pageCount || Math.abs(n - page) <= 1)
                    .map((n, index, list) => (
                      <span key={n} className="row" style={{ gap: "0.25rem" }}>
                        {index > 0 && n - list[index - 1] > 1 && (
                          <span className="tiny muted">…</span>
                        )}
                        <button
                          type="button"
                          className={cx("btn", "btn--ghost", "btn--sm", n === page && "is-active")}
                          aria-current={n === page ? "page" : undefined}
                          onClick={() => setParam({ page: n === 1 ? "" : n }, { resetPage: false })}
                        >
                          {n}
                        </button>
                      </span>
                    ))}

                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={page === pageCount}
                    onClick={() => setParam({ page: page + 1 }, { resetPage: false })}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </Section>

      <Section title="Every task, in this one screen">
        <table className="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Used here as</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["1 Router setup", "this page is a route in one central route tree"],
              ["2 Base pages", "the list, the detail and the 404 all live as routes"],
              ["3 Shared layouts", "the sidebar and topbar around it never remount"],
              ["4 Nested routes", "/deliverable and /deliverable/:id share this parent"],
              ["5 Dynamic routes", "useParams drives the detail fetch"],
              ["6 URL search params", "search, category, sort, limit and page"],
              ["7 Outlet context", "the signed-in user in the lead paragraph above"],
              ["8 Navigation UX", "breadcrumbs in the topbar, tab title per view"],
              ["9 API service layer", "getProducts and getCategories from @services"],
              ["10 useEffect & cleanup", "every request aborts when a filter changes"],
              ["11 Custom hooks", "useFetch, useDebounce, useDocumentTitle, useApp"]
            ].map(([task, where]) => (
              <tr key={task}>
                <td>
                  <strong className="tiny">{task}</strong>
                </td>
                <td className="muted">{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Try this" note="Six things worth doing, in order.">
        <ul className="list">
          {[
            "Filter and search, then copy the URL into a new tab — identical view",
            "Press the browser back button — it steps back through your filters, not out of the app",
            "Open a product, then press Back — the filters are still applied",
            "On a product, press Next repeatedly and watch the Network tab abort the superseded requests",
            "Visit /deliverable/999999 — the route matches, the data doesn't, and you get an error state with a retry",
            "Turn off wifi and press Try again — a network failure reads differently from a bad status"
          ].map(item => (
            <li className="list__item" key={item}>
              <span className="list__text small">{item}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
