import { describe, expect, it } from "vitest";
import {
  validateField,
  validateAll,
  isValid
} from "@tasks/task-06-manual-validation/lib/validation";
import { SCHEMAS, createRecord, updateRecord, pickSchemaValues, blankValues } from "@model/model";

const field = name => SCHEMAS.products.fields.find(item => item.name === name);

describe("required", () => {
  it("rejects an empty required field", () => {
    expect(validateField(field("name"), "")).toMatch(/required/);
  });

  it("treats whitespace as empty", () => {
    expect(validateField(field("name"), "   ")).toMatch(/required/);
  });

  it("accepts an empty optional field", () => {
    expect(validateField(field("notes"), "")).toBe("");
  });
});

describe("length", () => {
  it("rejects too short", () => {
    expect(validateField(field("name"), "ab")).toMatch(/at least 3/);
  });

  it("rejects too long", () => {
    expect(validateField(field("name"), "x".repeat(61))).toMatch(/under 60/);
  });

  it("accepts a value in range", () => {
    expect(validateField(field("name"), "Keyboard")).toBe("");
  });
});

describe("pattern", () => {
  it("rejects a lowercase SKU", () => {
    expect(validateField(field("sku"), "kb-1042")).toBeTruthy();
  });

  it("rejects a SKU with no dash", () => {
    expect(validateField(field("sku"), "KB1042")).toBeTruthy();
  });

  it("accepts a well-formed SKU", () => {
    expect(validateField(field("sku"), "KB-1042")).toBe("");
  });
});

describe("email", () => {
  it.each([
    ["no at sign", "abdullah.example.com"],
    ["no domain", "abdullah@"],
    ["no dot in the domain", "abdullah@nope"],
    ["a space", "a b@example.com"]
  ])("rejects %s", (_label, value) => {
    expect(validateField(field("email"), value)).toBeTruthy();
  });

  it("accepts a plausible address", () => {
    expect(validateField(field("email"), "abdullah@example.com")).toBe("");
  });

  it("is optional on products", () => {
    expect(validateField(field("email"), "")).toBe("");
  });
});

describe("numbers", () => {
  it("rejects text", () => {
    expect(validateField(field("price"), "abc")).toMatch(/must be a number/);
  });

  it("rejects below the minimum", () => {
    expect(validateField(field("price"), "0")).toMatch(/at least/);
  });

  it("rejects a fractional integer field", () => {
    expect(validateField(field("stock"), "4.5")).toMatch(/whole number/);
  });

  it("accepts a valid number", () => {
    expect(validateField(field("price"), "49.99")).toBe("");
  });
});

describe("cross-field rules", () => {
  it("rejects zero stock on an active product", () => {
    expect(validateField(field("stock"), "0", { status: "active" })).toMatch(/active product/);
  });

  it("allows zero stock on a draft", () => {
    expect(validateField(field("stock"), "0", { status: "draft" })).toBe("");
  });
});

describe("dates", () => {
  const dueDate = SCHEMAS.tasks.fields.find(item => item.name === "dueDate");

  it("rejects a past date", () => {
    expect(validateField(dueDate, "2020-01-01")).toMatch(/past/);
  });

  it("accepts a future date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validateField(dueDate, future.toISOString().slice(0, 10))).toBe("");
  });
});

describe("validateAll", () => {
  it("reports exactly the required fields a blank record leaves empty", () => {
    const errors = validateAll("products", blankValues("products"));

    // blankValues pre-fills selects with their first option, so `category` and
    // `status` are already valid — only the text and number fields fail.
    expect(Object.keys(errors).sort()).toEqual(["name", "price", "sku", "stock"]);
    expect(isValid("products", blankValues("products"))).toBe(false);
  });

  it("passes a complete record", () => {
    const values = {
      name: "Mechanical keyboard",
      sku: "KB-1042",
      category: "peripherals",
      price: "89",
      stock: "42",
      status: "active",
      email: "",
      notes: ""
    };

    expect(validateAll("products", values)).toEqual({});
    expect(isValid("products", values)).toBe(true);
  });
});

describe("model helpers", () => {
  it("createRecord stamps a prefixed id", () => {
    expect(createRecord("users", { name: "Test" }).id).toMatch(/^usr_/);
  });

  it("updateRecord ignores an attempt to change the id", () => {
    const record = createRecord("products", { name: "Original" });
    const updated = updateRecord(record, { id: "hacked", name: "Changed" });

    expect(updated.id).toBe(record.id);
    expect(updated.name).toBe("Changed");
  });

  it("pickSchemaValues drops keys the schema doesn't declare", () => {
    const picked = pickSchemaValues("users", {
      name: "A",
      email: "a@b.com",
      role: "admin",
      status: "active",
      notes: "",
      isAdmin: true,
      __proto__: {}
    });

    expect(picked).not.toHaveProperty("isAdmin");
    expect(Object.keys(picked).sort()).toEqual(SCHEMAS.users.fields.map(f => f.name).sort());
  });
});
