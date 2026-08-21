/* Task 1 — the data model.

   Everything else in Day 5 reads from this file. Three entities, one shape
   each, with the field rules written down as data rather than scattered
   through form components. */

export const ENTITIES = ["products", "users", "tasks"];

export const STATUS = {
  active: { label: "Active", tone: "ok" },
  draft: { label: "Draft", tone: "" },
  archived: { label: "Archived", tone: "warn" }
};

export const PRIORITY = {
  high: { label: "High", tone: "bad", rank: 0 },
  medium: { label: "Medium", tone: "warn", rank: 1 },
  low: { label: "Low", tone: "ok", rank: 2 }
};

export const ROLES = ["admin", "editor", "viewer"];
export const CATEGORIES = ["peripherals", "displays", "audio", "accessories"];

/* ---------- ids ---------- */

/* Prefixed so a stray id in a log says which entity it belongs to, and
   sortable-ish because the timestamp leads. */
export function makeId(prefix = "rec") {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------- schemas ----------
   `fields` drives the forms in tasks 3, 6 and 7, and the columns in task 2.
   Adding a field here is meant to be the only edit needed. */

export const SCHEMAS = {
  products: {
    label: "Product",
    plural: "Products",
    idPrefix: "prd",
    titleField: "name",
    searchFields: ["name", "sku", "category"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, min: 3, max: 60 },
      {
        name: "sku",
        label: "SKU",
        type: "text",
        required: true,
        pattern: /^[A-Z]{2,4}-\d{3,5}$/,
        hint: "Two to four capitals, a dash, then 3–5 digits — e.g. KB-1042"
      },
      { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
      {
        name: "price",
        label: "Price (USD)",
        type: "number",
        required: true,
        min: 0.01,
        max: 100000,
        step: "0.01"
      },
      {
        name: "stock",
        label: "Stock",
        type: "number",
        required: true,
        min: 0,
        max: 100000,
        integer: true
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: Object.keys(STATUS)
      },
      { name: "email", label: "Supplier email", type: "email", required: false },
      { name: "notes", label: "Notes", type: "textarea", required: false, max: 200 }
    ]
  },

  users: {
    label: "User",
    plural: "Users",
    idPrefix: "usr",
    titleField: "name",
    searchFields: ["name", "email", "role"],
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, min: 3, max: 60 },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "role", label: "Role", type: "select", required: true, options: ROLES },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: Object.keys(STATUS)
      },
      { name: "notes", label: "Notes", type: "textarea", required: false, max: 200 }
    ]
  },

  tasks: {
    label: "Task",
    plural: "Tasks",
    idPrefix: "tsk",
    titleField: "title",
    searchFields: ["title", "assignee"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, min: 3, max: 80 },
      { name: "assignee", label: "Assignee", type: "text", required: true, min: 3 },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        required: true,
        options: Object.keys(PRIORITY)
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: Object.keys(STATUS)
      },
      { name: "dueDate", label: "Due date", type: "date", required: true, notPast: true },
      { name: "notes", label: "Notes", type: "textarea", required: false, max: 200 }
    ]
  }
};

/* ---------- record lifecycle ----------
   Every record carries the same four system fields. Keeping them out of the
   schema means no form can accidentally let a user edit them. */

export function createRecord(entity, values) {
  const now = new Date().toISOString();

  return {
    id: makeId(SCHEMAS[entity].idPrefix),
    ...blankValues(entity),
    ...values,
    createdAt: now,
    updatedAt: now
  };
}

export function updateRecord(record, changes) {
  return {
    ...record,
    ...changes,
    // id and createdAt are re-applied AFTER the spread, so a stray field in
    // `changes` can never overwrite them
    id: record.id,
    createdAt: record.createdAt,
    updatedAt: new Date().toISOString()
  };
}

export function blankValues(entity) {
  return Object.fromEntries(
    SCHEMAS[entity].fields.map(field => [
      field.name,
      field.type === "number" ? "" : field.type === "select" ? (field.options[0] ?? "") : ""
    ])
  );
}

/* Only the fields the schema declares — used before saving, so an edit form
   can never smuggle an unexpected key into a record. */
export function pickSchemaValues(entity, values) {
  return Object.fromEntries(SCHEMAS[entity].fields.map(field => [field.name, values[field.name]]));
}

export function titleOf(entity, record) {
  return record[SCHEMAS[entity].titleField] ?? record.id;
}

/* ---------- display helpers ---------- */

export function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(number);
}

export function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);

  if (Number.isNaN(minutes)) return "—";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function titleCase(value = "") {
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}
