import { describe, expect, it } from "vitest";
import {
  crudReducer,
  initialState,
  ACTIONS,
  selectVisible,
  selectStats,
  findRecord
} from "@store/crudReducer";

/* No React, no DOM, no rendering — the reducer is a pure function, which is
   the whole argument for keeping it in its own file. */

const seeded = () => initialState(true);

describe("create", () => {
  it("adds a record to the front of the list", () => {
    const before = seeded();
    const after = crudReducer(before, {
      type: ACTIONS.CREATE,
      payload: { entity: "products", values: { name: "New thing", sku: "NT-1000" } }
    });

    expect(after.records.products).toHaveLength(before.records.products.length + 1);
    expect(after.records.products[0].name).toBe("New thing");
  });

  it("stamps an id and both timestamps", () => {
    const after = crudReducer(seeded(), {
      type: ACTIONS.CREATE,
      payload: { entity: "products", values: { name: "Timestamped" } }
    });

    const record = after.records.products[0];
    expect(record.id).toMatch(/^prd_/);
    expect(record.createdAt).toBeTruthy();
    expect(record.updatedAt).toBe(record.createdAt);
  });

  it("does not touch the other entities", () => {
    const before = seeded();
    const after = crudReducer(before, {
      type: ACTIONS.CREATE,
      payload: { entity: "products", values: { name: "x" } }
    });

    expect(after.records.users).toBe(before.records.users);
  });
});

describe("update", () => {
  it("changes only the targeted record", () => {
    const before = seeded();
    const after = crudReducer(before, {
      type: ACTIONS.UPDATE,
      payload: { entity: "products", id: "prd_seed1", changes: { stock: 99 } }
    });

    expect(findRecord(after, "products", "prd_seed1").stock).toBe(99);
    expect(findRecord(after, "products", "prd_seed2")).toEqual(
      findRecord(before, "products", "prd_seed2")
    );
  });

  it("preserves fields the change did not mention", () => {
    const after = crudReducer(seeded(), {
      type: ACTIONS.UPDATE,
      payload: { entity: "products", id: "prd_seed1", changes: { stock: 5 } }
    });

    const record = findRecord(after, "products", "prd_seed1");
    expect(record.name).toBe("Mechanical keyboard");
    expect(record.sku).toBe("KB-1042");
  });

  it("refuses to let a change overwrite id or createdAt", () => {
    const before = findRecord(seeded(), "products", "prd_seed1");

    const after = crudReducer(seeded(), {
      type: ACTIONS.UPDATE,
      payload: {
        entity: "products",
        id: "prd_seed1",
        changes: { id: "hacked", createdAt: "1999-01-01", stock: 1 }
      }
    });

    const record = findRecord(after, "products", "prd_seed1");
    expect(record.id).toBe("prd_seed1");
    expect(record.createdAt).toBe(before.createdAt);
    expect(record.stock).toBe(1);
  });

  it("moves updatedAt", () => {
    const before = findRecord(seeded(), "products", "prd_seed1");
    const after = crudReducer(seeded(), {
      type: ACTIONS.UPDATE,
      payload: { entity: "products", id: "prd_seed1", changes: { stock: 7 } }
    });

    expect(
      new Date(findRecord(after, "products", "prd_seed1").updatedAt).getTime()
    ).toBeGreaterThan(new Date(before.updatedAt).getTime());
  });
});

describe("delete", () => {
  it("removes the record and drops it from the selection", () => {
    const before = { ...seeded(), selected: ["prd_seed1", "prd_seed2"] };

    const after = crudReducer(before, {
      type: ACTIONS.DELETE,
      payload: { entity: "products", id: "prd_seed1" }
    });

    expect(findRecord(after, "products", "prd_seed1")).toBeNull();
    expect(after.selected).toEqual(["prd_seed2"]);
  });

  it("deletes many at once and clears the whole selection", () => {
    const before = { ...seeded(), selected: ["prd_seed1", "prd_seed2"] };

    const after = crudReducer(before, {
      type: ACTIONS.DELETE_MANY,
      payload: { entity: "products", ids: ["prd_seed1", "prd_seed2"] }
    });

    expect(after.records.products).toHaveLength(before.records.products.length - 2);
    expect(after.selected).toEqual([]);
  });
});

describe("restore", () => {
  it("puts a deleted record back at its original index", () => {
    const before = seeded();
    const index = 2;
    const record = before.records.products[index];

    const deleted = crudReducer(before, {
      type: ACTIONS.DELETE,
      payload: { entity: "products", id: record.id }
    });

    const restored = crudReducer(deleted, {
      type: ACTIONS.RESTORE,
      payload: { entity: "products", record, index }
    });

    expect(restored.records.products[index].id).toBe(record.id);
    expect(restored.records.products).toHaveLength(before.records.products.length);
  });
});

describe("ui actions", () => {
  it("clears filters and selection when the entity changes", () => {
    const before = { ...seeded(), search: "keyboard", filter: "active", selected: ["prd_seed1"] };
    const after = crudReducer(before, { type: ACTIONS.SET_ENTITY, payload: "users" });

    expect(after.entity).toBe("users");
    expect(after.search).toBe("");
    expect(after.filter).toBe("all");
    expect(after.selected).toEqual([]);
  });

  it("toggles selection on and off", () => {
    const once = crudReducer(seeded(), { type: ACTIONS.TOGGLE_SELECT, payload: "prd_seed1" });
    expect(once.selected).toEqual(["prd_seed1"]);

    const twice = crudReducer(once, { type: ACTIONS.TOGGLE_SELECT, payload: "prd_seed1" });
    expect(twice.selected).toEqual([]);
  });
});

describe("optimistic flags", () => {
  it("marks and clears pending", () => {
    const pending = crudReducer(seeded(), { type: ACTIONS.MARK_PENDING, payload: "prd_seed1" });
    expect(pending.pending).toContain("prd_seed1");

    const cleared = crudReducer(pending, { type: ACTIONS.CLEAR_PENDING, payload: "prd_seed1" });
    expect(cleared.pending).not.toContain("prd_seed1");
  });

  it("marking failed also clears pending", () => {
    const pending = crudReducer(seeded(), { type: ACTIONS.MARK_PENDING, payload: "prd_seed1" });
    const failed = crudReducer(pending, { type: ACTIONS.MARK_FAILED, payload: "prd_seed1" });

    expect(failed.pending).not.toContain("prd_seed1");
    expect(failed.failed).toContain("prd_seed1");
  });

  it("marking pending again clears a previous failure", () => {
    const failed = crudReducer(seeded(), { type: ACTIONS.MARK_FAILED, payload: "prd_seed1" });
    const retried = crudReducer(failed, { type: ACTIONS.MARK_PENDING, payload: "prd_seed1" });

    expect(retried.failed).not.toContain("prd_seed1");
  });
});

describe("unknown actions", () => {
  it("throws rather than silently returning state", () => {
    // A typo in an action type otherwise looks like "my dispatch does nothing"
    expect(() => crudReducer(seeded(), { type: "record/typo" })).toThrow(/unknown action/);
  });
});

describe("selectors", () => {
  it("filters by status", () => {
    const state = { ...seeded(), filter: "archived" };
    const rows = selectVisible(state, "products");

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(record => record.status === "archived")).toBe(true);
  });

  it("searches across the schema's search fields", () => {
    const state = { ...seeded(), search: "KB-1042" };
    const rows = selectVisible(state, "products");

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Mechanical keyboard");
  });

  it("search is case-insensitive", () => {
    const rows = selectVisible({ ...seeded(), search: "MECHANICAL" }, "products");
    expect(rows).toHaveLength(1);
  });

  it("sorts by price numerically, not alphabetically", () => {
    const rows = selectVisible({ ...seeded(), sort: "price" }, "products");
    const prices = rows.map(record => record.price);

    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    // 129 must not come before 39
    expect(prices[0]).toBeLessThan(prices[prices.length - 1]);
  });

  it("does not mutate the source array when sorting", () => {
    const state = { ...seeded(), sort: "title" };
    const first = state.records.products[0].id;

    selectVisible(state, "products");

    expect(state.records.products[0].id).toBe(first);
  });

  it("counts by status", () => {
    const stats = selectStats(seeded(), "products");

    expect(stats.total).toBe(6);
    expect(stats.active + stats.draft + stats.archived).toBe(stats.total);
  });
});
