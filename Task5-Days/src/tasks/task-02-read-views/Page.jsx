import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "@store/CrudContext";
import { SCHEMAS, ENTITIES, STATUS, titleCase } from "@model/model";
import { cx } from "@shared/cx";
import RecordCard from "./components/RecordCard";
import RecordTable from "./components/RecordTable";

export default function Page() {
  const { state, actions, visible, stats } = useCrud();
  const [view, setView] = useState("cards");

  const rows = visible();
  const counts = stats();

  return (
    <>
      <PageHeader
        number={2}
        title="Read Views"
        brief="Display records in both responsive card view and admin-style table view"
        lead="The same records, two layouts. Cards are for browsing; a table is for comparing."
        actions={
          <div className="viewswitch">
            {["cards", "table"].map(mode => (
              <button
                key={mode}
                type="button"
                className={cx("btn", "btn--sm", view === mode ? "" : "btn--ghost")}
                onClick={() => setView(mode)}
                aria-pressed={view === mode}
              >
                {titleCase(mode)}
              </button>
            ))}
          </div>
        }
      />

      <Section
        title="Live data"
        note="Reading from the same store the rest of Day 5 writes to — create a record in task 3 and it appears here."
      >
        <div className="toolbar">
          <div>
            <label htmlFor="entity">Entity</label>
            <select
              id="entity"
              value={state.entity}
              onChange={event => actions.setEntity(event.target.value)}
            >
              {ENTITIES.map(name => (
                <option key={name} value={name}>
                  {SCHEMAS[name].plural}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="search"
              placeholder={`Search ${SCHEMAS[state.entity].searchFields.join(", ")}`}
              value={state.search}
              onChange={event => actions.setSearch(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filter">Status</label>
            <select
              id="filter"
              value={state.filter}
              onChange={event => actions.setFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort">Sort</label>
            <select
              id="sort"
              value={state.sort}
              onChange={event => actions.setSort(event.target.value)}
            >
              <option value="updated">Recently updated</option>
              <option value="created">Newest first</option>
              <option value="title">A–Z</option>
              {state.entity === "products" && <option value="price">Price</option>}
              {state.entity === "tasks" && <option value="priority">Priority</option>}
            </select>
          </div>
        </div>

        <div className="grid">
          {[
            ["Total", counts.total],
            ["Active", counts.active],
            ["Draft", counts.draft],
            ["Archived", counts.archived]
          ].map(([label, value]) => (
            <div className="stat" key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="state">
            <strong>{counts.total === 0 ? "No records yet" : "Nothing matches"}</strong>
            <p>
              {counts.total === 0
                ? "Create one in task 3, or reset the store in task 11."
                : "Your search and status filter excluded every record — the data is still there."}
            </p>
            {counts.total > 0 && (
              <button
                type="button"
                className="btn"
                style={{ marginTop: "0.6rem" }}
                onClick={() => {
                  actions.setSearch("");
                  actions.setFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : view === "cards" ? (
          <div className="cards">
            {rows.map(record => (
              <RecordCard key={record.id} entity={state.entity} record={record} actions={false} />
            ))}
          </div>
        ) : (
          <RecordTable entity={state.entity} records={rows} actions={false} />
        )}

        <p className="tiny muted">
          Showing {rows.length} of {counts.total}
        </p>
      </Section>

      <Section
        title="Cards or table"
        note="Not a style preference. They answer different questions, and picking the wrong one makes a screen harder to use."
      >
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Cards</th>
              <th>Table</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Good at",
                "browsing, scanning one record at a time",
                "comparing a field across many records"
              ],
              ["Density", "3–4 fields before it feels crowded", "6–8 columns comfortably"],
              [
                "Mobile",
                "reflows naturally, no work needed",
                "needs columns dropped or horizontal scroll"
              ],
              [
                "Sorting",
                "feels odd — cards imply no order",
                "expected, and the header is the affordance"
              ],
              ["Bulk actions", "awkward to place a checkbox", "a natural first column"]
            ].map(([aspect, cards, table]) => (
              <tr key={aspect}>
                <td className="muted">{aspect}</td>
                <td>{cards}</td>
                <td>{table}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="section__note">
          Offering both, with the choice remembered, is the usual answer for an admin screen — task
          11 persists it.
        </p>
      </Section>

      <Section
        title="Responsive without a separate mobile component"
        note="Column definitions carry their own breakpoint class, applied to the th and the td from the same object — so a header can never drift out of line with its data."
        code={`const COLUMNS = {
  products: [
    { key: "name",     label: "Product" },
    { key: "sku",      label: "SKU",      hide: "hide-sm" },
    { key: "category", label: "Category", hide: "hide-md", render: r => titleCase(r.category) },
    { key: "price",    label: "Price",    align: "right",  render: r => formatPrice(r.price) }
  ]
};

<th className={column.hide}>   // same class,
<td className={column.hide}>   // same source`}
      >
        <p className="section__note">
          Narrow the window and watch SKU disappear before Category. The alternative — reflowing
          rows into cards below a breakpoint — reads better on a phone but loses the alignment that
          made a table worth choosing.
        </p>
      </Section>

      <Section
        title="Derived, never stored"
        code={`// ✅ selectVisible() runs during render, from the raw records
const rows = visible();

// ❌ a second copy that has to be kept in sync
const [filtered, setFiltered] = useState([]);
useEffect(() => setFiltered(records.filter(...)), [records, search, filter]);`}
      >
        <p className="section__note">
          The filter, search and sort all live in the reducer as plain values; the visible list is
          computed by a selector in task 10. Storing the result instead gives you two sources of
          truth and a <code>useEffect</code> to keep them married.
        </p>
      </Section>
    </>
  );
}
