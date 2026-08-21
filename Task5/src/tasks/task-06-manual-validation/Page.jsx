import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { SCHEMAS } from "@model/model";
import { useRecordForm } from "./lib/useRecordForm";
import { validateField } from "./lib/validation";
import Field from "@tasks/task-03-create-flow/components/Field";

const CASES = [
  ["Required", { name: "", label: "Name", type: "text", required: true }, ""],
  ["Too short", { name: "name", label: "Name", type: "text", min: 3 }, "ab"],
  ["Too long", { name: "name", label: "Name", type: "text", max: 5 }, "abcdefgh"],
  ["Bad email", { name: "email", label: "Email", type: "email" }, "abdullah@nope"],
  ["Email with a space", { name: "email", label: "Email", type: "email" }, "a b@c.com"],
  ["Not a number", { name: "price", label: "Price", type: "number" }, "abc"],
  ["Below minimum", { name: "price", label: "Price", type: "number", min: 1 }, "0"],
  ["Not an integer", { name: "stock", label: "Stock", type: "number", integer: true }, "4.5"],
  ["Bad SKU pattern", SCHEMAS.products.fields[1], "kb1042"],
  ["Good SKU", SCHEMAS.products.fields[1], "KB-1042"],
  [
    "Date in the past",
    { name: "dueDate", label: "Due date", type: "date", notPast: true },
    "2020-01-01"
  ]
];

export default function Page() {
  const [result, setResult] = useState(null);
  const form = useRecordForm("products", { status: "draft" });

  return (
    <>
      <PageHeader
        number={6}
        title="Manual Validation"
        brief="Validate required fields, email format, min/max length, numeric fields, and select fields"
        lead="Rules derived from the schema, written by hand. Task 7 replaces the plumbing — this is what it replaces."
      />

      <Section
        title="Every rule, run against a failing value"
        note="Each row calls the real validateField() with the value shown. Green means the rule passed, red is the message a user would see."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Case</th>
              <th>Value</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {CASES.map(([label, field, value]) => {
              const message = validateField(field, value);
              return (
                <tr key={label}>
                  <td>{label}</td>
                  <td>
                    <code>{value === "" ? "(empty)" : value}</code>
                  </td>
                  <td className="tiny" style={{ color: message ? "var(--bad)" : "var(--ok)" }}>
                    {message || "valid"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section
        title="A real form using it"
        note="Try submitting empty, then fix the fields one at a time. Errors appear on blur, not on the first keystroke, and clear the moment a field becomes valid."
      >
        <form
          onSubmit={form.handleSubmit(async values => {
            setResult(values);
          })}
          noValidate
          className="stack"
        >
          {form.errorList.length > 0 && (
            <div className="summary" role="alert">
              <strong>{form.errorList.length} fields need attention</strong>
              <ul>
                {form.errorList.map(([name, message]) => (
                  <li key={name}>
                    <a
                      href={`#${name}`}
                      onClick={event => {
                        event.preventDefault();
                        document.querySelector(`[name="${name}"]`)?.focus();
                      }}
                    >
                      {message}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {SCHEMAS.products.fields.map(field => (
            <Field
              key={field.name}
              field={field}
              value={form.values[field.name]}
              error={form.errorFor(field.name)}
              onChange={form.setValue}
              onBlur={form.handleBlur}
            />
          ))}

          <div className="row">
            <button type="submit" className="btn">
              Validate and submit
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => form.reset()}>
              Reset
            </button>
          </div>
        </form>

        {result && (
          <>
            <p className="tiny muted">Passed validation:</p>
            <pre className="code">{JSON.stringify(result, null, 2)}</pre>
          </>
        )}
      </Section>

      <Section
        title="Validate on blur, not on the first keystroke"
        note="A `touched` map tracks which fields the user has actually left. Flagging 'ab' as too short while someone is still typing 'abdullah' reads as hostile."
        code={`const errorFor = name => (touched[name] ? errors[name] ?? "" : "");

// on blur, mark touched and validate
setTouched(prev => ({ ...prev, [name]: true }));

// on submit, treat EVERYTHING as touched
setTouched(Object.fromEntries(schema.fields.map(f => [f.name, true])));`}
      >
        <p className="section__note">
          After the first blur the field validates live, so the error clears the instant it&apos;s
          fixed. That combination — late to complain, quick to forgive — is what makes validation
          feel helpful rather than nagging.
        </p>
      </Section>

      <Section
        title="Rules return a message, not a boolean"
        code={`export function validateField(field, value, allValues = {}) {
  if (field.required && !text) return \`\${field.label} is required.\`;
  if (!text) return "";                    // an empty optional field is valid
  if (field.min && text.length < field.min) return \`…at least \${field.min} characters.\`;
  …
  return "";
}`}
      >
        <p className="section__note">
          The caller gets the text for free, and the rule lives in one place. Returning{" "}
          <code>false</code> means the message has to be written again wherever the check is used.
        </p>
      </Section>

      <Section
        title="The email regex you shouldn't write"
        note="There is no regex that correctly validates an email address. The only reliable test is sending mail to it. These checks catch typos, which is all they claim to do."
        code={`if (!text.includes("@"))        return "Email needs an @ sign.";
const [local, domain] = text.split("@");
if (!local || !domain)         return "Email needs text either side of the @.";
if (!domain.includes("."))     return "Email domain needs a dot.";
if (/\\s/.test(text))           return "Email can't contain spaces.";`}
      >
        <p className="section__note">
          The famous RFC 5322 regex is several hundred characters, still rejects valid addresses,
          and nobody can maintain it. Four readable checks plus a confirmation email is the honest
          answer.
        </p>
      </Section>

      <Section
        title="Cross-field rules"
        note="Some rules need more than one value. validateField takes allValues as a second argument for exactly this."
        code={`if (field.name === "stock" && allValues.status === "active" && Number(text) === 0) {
  return "An active product can't have zero stock — set it to draft or archived.";
}`}
      >
        <p className="section__note">
          Try it in the form above: set Status to Active and Stock to 0. This is also the rule that
          shows why validation belongs beside the model rather than inside a component.
        </p>
      </Section>

      <Section
        title="The caveat"
        code={`// Client-side validation is a courtesy to the user, never a security control.
// Anyone can open DevTools, delete the handler, and submit whatever they like.
// Every rule here has to exist on the server too.`}
      >
        <p className="section__note">
          What it buys you is a fast, clear correction loop — not safety.
        </p>
      </Section>
    </>
  );
}
