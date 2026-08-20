import { useReducer, useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "./lib/CrudContext";
import { crudReducer, initialState, ACTIONS, selectVisible } from "./lib/crudReducer";
import { titleOf, ENTITIES, SCHEMAS } from "@model/model";

export default function Page() {
  const crud = useCrud();

  /* A second, isolated reducer so actions can be dispatched here without
     touching the app's real store. */
  const [demo, dispatch] = useReducer(crudReducer, undefined, () => initialState(true));
  const [log, setLog] = useState([]);

  function run(action, label) {
    try {
      dispatch(action);
      setLog(list => [`${action.type} — ${label}`, ...list].slice(0, 8));
    } catch (error) {
      setLog(list => [`⚠ ${error.message}`, ...list].slice(0, 8));
    }
  }

  const demoRows = selectVisible(demo);

  return (
    <>
      <PageHeader
        number={10}
        title="useReducer CRUD Logic"
        brief="Manage add/update/delete/filter actions through useReducer instead of scattered setState calls"
        lead="Seven pieces of state that change together, in one function of (state, action)."
        actions={
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLog([])}>
            Clear log
          </button>
        }
      />

      <Section
        title="What it replaces"
        note="Seven useState calls that have to be updated in the right order. Deleting a record has to remove it, drop it from the selection, and clear its pending flag — three setters, and forgetting one is a bug you find later."
        code={`// ❌ scattered
const [records, setRecords] = useState([]);
const [entity, setEntity] = useState("products");
const [search, setSearch] = useState("");
const [filter, setFilter] = useState("all");
const [sort, setSort] = useState("updated");
const [selected, setSelected] = useState([]);
const [pending, setPending] = useState([]);

// ✅ one transition, named and testable
case ACTIONS.DELETE: {
  return {
    ...state,
    records: { ...state.records, [entity]: state.records[entity].filter(r => r.id !== id) },
    selected: state.selected.filter(selectedId => selectedId !== id)
  };
}`}
      >
        <div className="grid">
          {[
            ["records", "the three entity arrays"],
            ["entity", "which one is on screen"],
            ["search", "the query text"],
            ["filter", "status filter"],
            ["sort", "sort order"],
            ["selected", "ids ticked for a bulk action"],
            ["pending / failed", "optimistic flags (task 12)"]
          ].map(([key, purpose]) => (
            <div className="card card--flat" key={key}>
              <p className="small" style={{ fontWeight: 700 }}>
                <code>{key}</code>
              </p>
              <p className="tiny muted">{purpose}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Dispatch against an isolated store"
        note="This reducer is separate from the app's, so you can break things here without losing the records the other pages use."
      >
        <div className="row">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() =>
              run(
                {
                  type: ACTIONS.CREATE,
                  payload: {
                    entity: demo.entity,
                    values: {
                      name: `Demo ${Math.floor(Math.random() * 900 + 100)}`,
                      sku: "DM-1000",
                      category: "peripherals",
                      price: 25,
                      stock: 5,
                      status: "draft"
                    }
                  }
                },
                "added a record"
              )
            }
          >
            CREATE
          </button>

          <button
            type="button"
            className="btn btn--sm btn--ghost"
            disabled={!demoRows[0]}
            onClick={() =>
              run(
                {
                  type: ACTIONS.UPDATE,
                  payload: {
                    entity: demo.entity,
                    id: demoRows[0].id,
                    changes: { status: "archived" }
                  }
                },
                `archived ${titleOf(demo.entity, demoRows[0])}`
              )
            }
          >
            UPDATE
          </button>

          <button
            type="button"
            className="btn btn--sm btn--ghost"
            disabled={!demoRows[0]}
            onClick={() =>
              run(
                { type: ACTIONS.DELETE, payload: { entity: demo.entity, id: demoRows[0].id } },
                `deleted ${titleOf(demo.entity, demoRows[0])}`
              )
            }
          >
            DELETE
          </button>

          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() =>
              run(
                { type: ACTIONS.SET_FILTER, payload: demo.filter === "all" ? "active" : "all" },
                "toggled the filter"
              )
            }
          >
            SET_FILTER
          </button>

          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => run({ type: ACTIONS.RESET }, "back to seed data")}
          >
            RESET
          </button>

          <button
            type="button"
            className="btn btn--sm btn--ghost"
            style={{ color: "var(--bad)" }}
            onClick={() => run({ type: "record/typo" }, "an action that doesn't exist")}
          >
            Unknown action
          </button>
        </div>

        <div className="grid">
          <div className="stat">
            <b>{demo.records[demo.entity].length}</b>
            <span>{SCHEMAS[demo.entity].plural}</span>
          </div>
          <div className="stat">
            <b>{demoRows.length}</b>
            <span>Visible</span>
          </div>
          <div className="stat">
            <b>{demo.filter}</b>
            <span>Filter</span>
          </div>
        </div>

        <div className="log">
          {log.length ? (
            log.map((line, index) => <div key={index}>&gt; {line}</div>)
          ) : (
            <div>&gt; nothing yet</div>
          )}
        </div>

        <p className="tiny muted">
          Press <strong>Unknown action</strong> — the reducer throws rather than silently returning
          state. A typo in an action type otherwise looks like &ldquo;my dispatch does
          nothing&rdquo;, which is a genuinely hard bug to find.
        </p>
      </Section>

      <Section
        title="Selectors, not stored derivations"
        note="The filtered list is computed from state during render. Storing it means two sources of truth and a useEffect keeping them married."
        code={`export function selectVisible(state, entity = state.entity) {
  const list = state.records[entity] ?? [];
  const query = state.search.trim().toLowerCase();

  return [...list
    .filter(r => state.filter === "all" ? true : r.status === state.filter)
    .filter(r => SCHEMAS[entity].searchFields.some(f =>
      String(r[f] ?? "").toLowerCase().includes(query)))
  ].sort(sorters[state.sort]);
}`}
      >
        <p className="section__note">
          Selectors also keep the reducer small. The reducer answers &ldquo;what changed&rdquo;;
          selectors answer &ldquo;what should be on screen&rdquo;. Mixing those is how a reducer
          ends up 400 lines long.
        </p>
      </Section>

      <Section
        title="Action creators, so components never build an action by hand"
        code={`// CrudContext.jsx
const actions = useMemo(() => ({
  create:  (entity, values) => dispatch({ type: ACTIONS.CREATE, payload: { entity, values } }),
  update:  (entity, id, changes) => dispatch({ type: ACTIONS.UPDATE, payload: { entity, id, changes } }),
  remove:  (entity, id) => dispatch({ type: ACTIONS.DELETE, payload: { entity, id } })
}), [dispatch]);

// in a component
actions.create("products", values);        // not dispatch({ type: "record/create", … })`}
      >
        <p className="section__note">
          A typo in <code>actions.craete</code> is an immediate TypeError. A typo in an inline
          action string reaches the reducer and does nothing — which is why the default case throws.
        </p>
      </Section>

      <Section
        title="The reducer is pure, and that's the point"
        note="No fetch, no localStorage, no context. crudReducer.js can be tested by calling it with a state and an action — no DOM, no React, no rendering."
        code={`import { crudReducer, initialState, ACTIONS } from "./crudReducer";

it("removes the record and drops it from the selection", () => {
  const before = { ...initialState(true), selected: ["prd_seed1"] };

  const after = crudReducer(before, {
    type: ACTIONS.DELETE,
    payload: { entity: "products", id: "prd_seed1" }
  });

  expect(after.records.products).toHaveLength(5);
  expect(after.selected).toEqual([]);
});`}
      >
        <p className="section__note">
          The test suite in <code>src/test/</code> does exactly this — the reducer tests need no
          rendering at all, which is why they run in milliseconds.
        </p>
      </Section>

      <Section title="useState or useReducer">
        <table className="table">
          <thead>
            <tr>
              <th>Use useState when</th>
              <th>Use useReducer when</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["One independent value", "Several values that change together"],
              ["A toggle, an input, an open flag", "One action touching three or four fields"],
              ["The next value doesn't depend on the last", "Transitions are the interesting part"],
              [
                "No need to test the logic in isolation",
                "You want the logic testable without React"
              ]
            ].map(([left, right]) => (
              <tr key={left}>
                <td className="muted">{left}</td>
                <td>{right}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="section__note">
          The app store currently holds {crud.state.records[crud.state.entity].length}{" "}
          {crud.state.entity}. It became a reducer at the point where deleting a record needed to
          touch three separate pieces of state at once.
        </p>
      </Section>
    </>
  );
}
