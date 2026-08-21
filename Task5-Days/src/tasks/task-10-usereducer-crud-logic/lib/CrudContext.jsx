import { createContext, useCallback, useContext, useMemo } from "react";
import { usePersistedReducer } from "@hooks";
import {
  crudReducer,
  initialState,
  ACTIONS,
  selectVisible,
  selectStats,
  findRecord
} from "./crudReducer";

/* Task 10 + 11 — the reducer, wrapped in a context and persisted.

   The reducer stays a pure function in its own file; this file is only the
   wiring. That separation is what lets crudReducer.js be tested with no
   React at all. */

const CrudContext = createContext(null);

export function CrudProvider({ children, seeded = true }) {
  const [state, dispatch] = usePersistedReducer(crudReducer, initialState(seeded), {
    key: "day5.crud",
    version: 1,
    // Strip transient state — persisting `pending` means the app reloads
    // believing a request is still in flight
    persist: ({ records, entity, filter, sort }) => ({ records, entity, filter, sort })
  });

  /* Action creators, so components never build an action object by hand and
     a typo in a type string can't reach the reducer. */
  const actions = useMemo(
    () => ({
      create: (entity, values, record) =>
        dispatch({ type: ACTIONS.CREATE, payload: { entity, values, record } }),
      update: (entity, id, changes) =>
        dispatch({ type: ACTIONS.UPDATE, payload: { entity, id, changes } }),
      remove: (entity, id) => dispatch({ type: ACTIONS.DELETE, payload: { entity, id } }),
      removeMany: (entity, ids) =>
        dispatch({ type: ACTIONS.DELETE_MANY, payload: { entity, ids } }),
      restore: (entity, record, index) =>
        dispatch({ type: ACTIONS.RESTORE, payload: { entity, record, index } }),
      replaceAll: (entity, list) =>
        dispatch({ type: ACTIONS.REPLACE_ALL, payload: { entity, list } }),
      reset: () => dispatch({ type: ACTIONS.RESET }),
      clear: () => dispatch({ type: ACTIONS.CLEAR }),

      setEntity: entity => dispatch({ type: ACTIONS.SET_ENTITY, payload: entity }),
      setSearch: value => dispatch({ type: ACTIONS.SET_SEARCH, payload: value }),
      setFilter: value => dispatch({ type: ACTIONS.SET_FILTER, payload: value }),
      setSort: value => dispatch({ type: ACTIONS.SET_SORT, payload: value }),
      toggleSelect: id => dispatch({ type: ACTIONS.TOGGLE_SELECT, payload: id }),
      clearSelection: () => dispatch({ type: ACTIONS.CLEAR_SELECTION }),

      markPending: id => dispatch({ type: ACTIONS.MARK_PENDING, payload: id }),
      clearPending: id => dispatch({ type: ACTIONS.CLEAR_PENDING, payload: id }),
      markFailed: id => dispatch({ type: ACTIONS.MARK_FAILED, payload: id })
    }),
    [dispatch]
  );

  const visible = useCallback((entity = state.entity) => selectVisible(state, entity), [state]);
  const stats = useCallback((entity = state.entity) => selectStats(state, entity), [state]);
  const find = useCallback((entity, id) => findRecord(state, entity, id), [state]);

  const value = useMemo(
    () => ({ state, dispatch, actions, visible, stats, find }),
    [state, dispatch, actions, visible, stats, find]
  );

  return <CrudContext.Provider value={value}>{children}</CrudContext.Provider>;
}

export function useCrud() {
  const context = useContext(CrudContext);
  if (!context) throw new Error("useCrud must be used inside a <CrudProvider>");
  return context;
}
