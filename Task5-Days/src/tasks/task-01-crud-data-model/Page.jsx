import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import {
  SCHEMAS,
  ENTITIES,
  STATUS,
  PRIORITY,
  createRecord,
  updateRecord,
  titleCase
} from "./model";
import { seedFor } from "./seed";

export default function Page() {
  const [entity, setEntity] = useState("products");
  const schema = SCHEMAS[entity];
  const sample = seedFor(entity)[0];

  const [demo, setDemo] = useState(null);

  return (
    <>
      <PageHeader
        number={1}
        title="CRUD Data Model"
        brief="Define a clean users/products/tasks data model with IDs, status, priority, timestamps, and validation rules"
        lead="One file the rest of Day 5 reads from. The field rules live here as data, not scattered through form components."
      />

      <Section
        title="Three entities, one shape"
        note="Pick one to see its schema. Every form, table column and validator in the following twelve tasks is generated from this object."
      >
        <div className="row">
          {ENTITIES.map(name => (
            <button
              key={name}
              type="button"
              className={`btn btn--sm ${entity === name ? "" : "btn--ghost"}`}
              onClick={() => setEntity(name)}
            >
              {SCHEMAS[name].plural}
            </button>
          ))}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Rules</th>
            </tr>
          </thead>
          <tbody>
            {schema.fields.map(field => (
              <tr key={field.name}>
                <td>
                  <code>{field.name}</code>
                  {field.required && <span style={{ color: "var(--bad)" }}> *</span>}
                </td>
                <td className="muted">{field.type}</td>
                <td className="tiny muted">
                  {[
                    field.required && "required",
                    field.min !== undefined && `min ${field.min}`,
                    field.max !== undefined && `max ${field.max}`,
                    field.integer && "whole numbers",
                    field.pattern && "pattern",
                    field.notPast && "not in the past",
                    field.options && `one of: ${field.options.join(", ")}`
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="System fields are not schema fields"
        note="id, createdAt and updatedAt are managed by the model helpers and deliberately absent from `fields`. A form can't render them, so a form can't corrupt them."
        code={`export function createRecord(entity, values) {
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
    id: record.id,                 // re-applied AFTER the spread,
    createdAt: record.createdAt,   // so a stray field can't overwrite them
    updatedAt: new Date().toISOString()
  };
}`}
      >
        <div className="row">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => setDemo(createRecord(entity, { ...sample, id: undefined }))}
          >
            createRecord()
          </button>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            disabled={!demo}
            onClick={() =>
              setDemo(
                updateRecord(demo, { id: "hacked", createdAt: "1999-01-01", notes: "edited" })
              )
            }
          >
            updateRecord() with a malicious id
          </button>
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => setDemo(null)}>
            Clear
          </button>
        </div>

        {demo && (
          <>
            <pre className="code">{JSON.stringify(demo, null, 2)}</pre>
            <p className="tiny muted">
              Press the second button: <code>notes</code> changed and <code>updatedAt</code> moved,
              but <code>id</code> and <code>createdAt</code> ignored the attempt.
            </p>
          </>
        )}
      </Section>

      <Section
        title="Ids"
        note="Prefixed, so a stray id in a log says which entity it belongs to. Timestamp-led, so ids sort roughly by creation order."
        code={`export function makeId(prefix = "rec") {
  return \`\${prefix}_\${Date.now().toString(36)}\${Math.random().toString(36).slice(2, 6)}\`;
}

// prd_m2k4x9a1   usr_m2k4x9b7   tsk_m2k4x9c3`}
      >
        <p className="section__note">
          <code>crypto.randomUUID()</code> is the right answer once the ids leave the browser. This
          is a client-only demo, and a readable prefix is worth more here than collision resistance
          across machines.
        </p>
      </Section>

      <Section
        title="Enums as objects, not strings"
        note="A status is a key with a label and a colour tone attached. Every badge on every page reads from this, so the same status can never be green in one view and grey in another."
        code={`export const STATUS = {
  active:   { label: "Active",   tone: "ok" },
  draft:    { label: "Draft",    tone: "" },
  archived: { label: "Archived", tone: "warn" }
};

export const PRIORITY = {
  high:   { label: "High",   tone: "bad",  rank: 0 },
  medium: { label: "Medium", tone: "warn", rank: 1 },
  low:    { label: "Low",    tone: "ok",   rank: 2 }
};`}
      >
        <div className="row">
          {Object.entries(STATUS).map(([key, value]) => (
            <span key={key} className={`badge ${value.tone ? `badge--${value.tone}` : ""}`}>
              {value.label}
            </span>
          ))}
          {Object.entries(PRIORITY).map(([key, value]) => (
            <span key={key} className={`badge badge--${value.tone}`}>
              {value.label}
            </span>
          ))}
        </div>
        <p className="tiny muted">
          <code>rank</code> on PRIORITY exists so sorting doesn&apos;t need a lookup table somewhere
          else — high, medium, low don&apos;t sort alphabetically.
        </p>
      </Section>

      <Section
        title="A sample record"
        note="Seed data uses fixed ids and timestamps, so the dataset is identical on every load. A moving dataset makes a demo impossible to reason about."
      >
        <dl className="kv">
          {Object.entries(sample).map(([key, value]) => (
            <div key={key} style={{ display: "contents" }}>
              <dt>{titleCase(key)}</dt>
              <dd>{String(value) || "—"}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        title="Why the schema drives everything"
        code={`SCHEMAS.products.fields  →  the form inputs        (tasks 3, 4, 7, 13)
                         →  the validation rules   (task 6)
                         →  the table columns      (task 2)
                         →  the search fields      (task 10 selector)`}
      >
        <p className="section__note">
          Adding a field to a product is meant to be one edit in <code>model.js</code>. Everything
          that renders or validates it follows automatically — which is the difference between a
          data model and a pile of interfaces.
        </p>
      </Section>
    </>
  );
}
