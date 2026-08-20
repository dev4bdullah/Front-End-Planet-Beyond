/* Task 10 — one reducer for every CRUD action, across all three entities.

   The alternative is a useState per concern — records, filter, search, sort,
   selection, editing id, pending ids — seven setters that have to be updated
   in the right order. A reducer makes each transition one named, testable
   function of (state, action). */

import { createRecord, updateRecord, pickSchemaValues, SCHEMAS } from "@model/model";
import { seededStore, emptyStore } from "@model/seed";

export const ACTIONS = {
  CREATE: "record/create",
  UPDATE: "record/update",
  DELETE: "record/delete",
  DELETE_MANY: "record/deleteMany",
  RESTORE: "record/restore",
  REPLACE_ALL: "records/replaceAll",
  RESET: "records/reset",
  CLEAR: "records/clear",

  SET_ENTITY: "ui/setEntity",
  SET_SEARCH: "ui/setSearch",
  SET_FILTER: "ui/setFilter",
  SET_SORT: "ui/setSort",
  TOGGLE_SELECT: "ui/toggleSelect",
  CLEAR_SELECTION: "ui/clearSelection",

  // Task 12 — optimistic flags live in the same reducer as the data they mark
  MARK_PENDING: "optimistic/markPending",
  CLEAR_PENDING: "optimistic/clearPending",
  MARK_FAILED: "optimistic/markFailed"
};

export function initialState(seeded = true) {
  return {
    records: seeded ? seededStore() : emptyStore(),
    entity: "products",
    search: "",
    filter: "all",
    sort: "updated",
    selected: [],
    pending: [], // ids with an in-flight optimistic operation
    failed: [] // ids whose operation was rolled back
  };
}

/* Pure. No fetch, no localStorage, no Date.now beyond what the model helpers
   do — which is what makes every transition testable without a DOM. */
export function crudReducer(state, action) {
  switch (action.type) {
    case ACTIONS.CREATE: {
      const { entity, values, record } = action.payload;
      // A caller can pass a fully-formed record (used by the optimistic flow,
      // which needs the id before the request is sent)
      const next = record ?? createRecord(entity, pickSchemaValues(entity, values));

      return {
        ...state,
        records: { ...state.records, [entity]: [next, ...state.records[entity]] }
      };
    }

    case ACTIONS.UPDATE: {
      const { entity, id, changes } = action.payload;

      return {
        ...state,
        records: {
          ...state.records,
          [entity]: state.records[entity].map(record =>
            record.id === id
              ? updateRecord(record, pickSchemaValues(entity, { ...record, ...changes }))
              : record
          )
        }
      };
    }

    case ACTIONS.DELETE: {
      const { entity, id } = action.payload;

      return {
        ...state,
        records: {
          ...state.records,
          [entity]: state.records[entity].filter(record => record.id !== id)
        },
        selected: state.selected.filter(selectedId => selectedId !== id)
      };
    }

    case ACTIONS.DELETE_MANY: {
      const { entity, ids } = action.payload;
      const set = new Set(ids);

      return {
        ...state,
        records: {
          ...state.records,
          [entity]: state.records[entity].filter(record => !set.has(record.id))
        },
        selected: []
      };
    }

    /* Put a deleted record back where it was, so an undo doesn't reorder the
       list. Index is captured by the caller before the delete. */
    case ACTIONS.RESTORE: {
      const { entity, record, index = 0 } = action.payload;
      const list = [...state.records[entity]];
      list.splice(Math.min(index, list.length), 0, record);

      return { ...state, records: { ...state.records, [entity]: list } };
    }

    case ACTIONS.REPLACE_ALL:
      return {
        ...state,
        records: { ...state.records, [action.payload.entity]: action.payload.list }
      };

    case ACTIONS.RESET:
      return { ...initialState(true), entity: state.entity };

    case ACTIONS.CLEAR:
      return { ...initialState(false), entity: state.entity };

    /* ---------- UI ---------- */

    case ACTIONS.SET_ENTITY:
      // Switching entity clears filters and selection — leaving a product
      // filter applied to users is a confusing bug
      return { ...state, entity: action.payload, search: "", filter: "all", selected: [] };

    case ACTIONS.SET_SEARCH:
      return { ...state, search: action.payload };

    case ACTIONS.SET_FILTER:
      return { ...state, filter: action.payload };

    case ACTIONS.SET_SORT:
      return { ...state, sort: action.payload };

    case ACTIONS.TOGGLE_SELECT: {
      const id = action.payload;
      return {
        ...state,
        selected: state.selected.includes(id)
          ? state.selected.filter(selectedId => selectedId !== id)
          : [...state.selected, id]
      };
    }

    case ACTIONS.CLEAR_SELECTION:
      return { ...state, selected: [] };

    /* ---------- optimistic flags (task 12) ---------- */

    case ACTIONS.MARK_PENDING:
      return {
        ...state,
        pending: [...state.pending, action.payload],
        failed: state.failed.filter(id => id !== action.payload)
      };

    case ACTIONS.CLEAR_PENDING:
      return { ...state, pending: state.pending.filter(id => id !== action.payload) };

    case ACTIONS.MARK_FAILED:
      return {
        ...state,
        pending: state.pending.filter(id => id !== action.payload),
        failed: [...state.failed, action.payload]
      };

    default:
      // Throwing beats returning state silently — a typo in an action type
      // otherwise looks like "my dispatch does nothing"
      throw new Error(`crudReducer: unknown action "${action.type}"`);
  }
}

/* ---------- selectors ----------
   Derived data belongs here, not in state. Storing a filtered list means two
   sources of truth that drift the moment a record changes. */

const RANK = { high: 0, medium: 1, low: 2 };

export function selectVisible(state, entity = state.entity) {
  const list = state.records[entity] ?? [];
  const query = state.search.trim().toLowerCase();
  const searchFields = SCHEMAS[entity].searchFields;

  const filtered = list
    .filter(record => (state.filter === "all" ? true : record.status === state.filter))
    .filter(record =>
      query
        ? searchFields.some(field =>
            String(record[field] ?? "")
              .toLowerCase()
              .includes(query)
          )
        : true
    );

  const sorters = {
    updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    title: (a, b) =>
      String(a[SCHEMAS[entity].titleField]).localeCompare(String(b[SCHEMAS[entity].titleField])),
    priority: (a, b) => (RANK[a.priority] ?? 9) - (RANK[b.priority] ?? 9),
    price: (a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)
  };

  return [...filtered].sort(sorters[state.sort] ?? sorters.updated);
}

export function selectStats(state, entity = state.entity) {
  const list = state.records[entity] ?? [];

  return {
    total: list.length,
    active: list.filter(record => record.status === "active").length,
    draft: list.filter(record => record.status === "draft").length,
    archived: list.filter(record => record.status === "archived").length
  };
}

export function findRecord(state, entity, id) {
  return (state.records[entity] ?? []).find(record => record.id === id) ?? null;
}
