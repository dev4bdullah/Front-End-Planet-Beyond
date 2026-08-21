import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge } from "@ui";
import { Tabs, useToast } from "@interactive";
import LoginForm from "./forms/LoginForm";
import ProfileForm from "./forms/ProfileForm";
import ProductForm from "./forms/ProductForm";

export default function Page() {
  const { toast } = useToast();
  const [lastResult, setLastResult] = useState(null);

  const done = message => {
    setLastResult(message);
    toast(message, "ok");
  };

  return (
    <>
      <PageHeader
        number={8}
        title="Controlled Forms"
        brief="Build login, profile, and product forms with controlled inputs and validation feedback"
        lead="Three forms, one useForm hook. The hook exists because these three would otherwise repeat the same forty lines."
      />

      <Section
        title="What controlled means"
        note="The input's value comes from state and every change goes back through setState. React is the single source of truth — the DOM never holds a value React doesn't know about."
        code={`// controlled — React owns the value
const [name, setName] = useState("");
<input value={name} onChange={e => setName(e.target.value)} />

// uncontrolled — the DOM owns it, you read it later
const ref = useRef();
<input ref={ref} defaultValue="" />

// the classic bug: value with no onChange
<input value={name} />   // permanently read-only, React warns in console`}
      >
        <p className="section__note">
          Controlled is the default choice. Reach for uncontrolled when you genuinely don&apos;t
          need the value until submit — a file input, or a very large form where re-rendering on
          every keystroke actually shows up in the profiler.
        </p>
      </Section>

      <Section
        title="Three forms, one hook"
        note="Each form declares its initial values and its validators. Everything else — touched tracking, blur validation, submit blocking, focus on the first error, dirty checking — comes from useForm."
      >
        <Tabs
          items={[
            { id: "login", label: "Login", content: <LoginForm onDone={done} /> },
            { id: "profile", label: "Profile", content: <ProfileForm onDone={done} /> },
            { id: "product", label: "Product", content: <ProductForm onDone={done} /> }
          ]}
        />

        {lastResult && (
          <p className="small" style={{ marginTop: "0.6rem" }}>
            <Badge tone="ok">submitted</Badge> {lastResult}
          </p>
        )}
      </Section>

      <Section
        title="The useForm API"
        code={`const form = useForm({
  initialValues: { email: "", password: "" },
  validators: { email, password },
  onSubmit: async values => { ... }
});

// spread onto any Input — name, value, onChange, onBlur, error
<Input label="Email" {...form.field("email")} />

// also available
form.values      form.errors       form.touched
form.isValid     form.isDirty      form.submitting
form.setValue    form.reset        form.handleSubmit`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Returned</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>field(name)</code>
              </td>
              <td className="muted">spread onto an input — five props at once</td>
            </tr>
            <tr>
              <td>
                <code>isDirty</code>
              </td>
              <td className="muted">disable Reset until something actually changed</td>
            </tr>
            <tr>
              <td>
                <code>isValid</code>
              </td>
              <td className="muted">preview the submit outcome without submitting</td>
            </tr>
            <tr>
              <td>
                <code>submitting</code>
              </td>
              <td className="muted">drives the button spinner and blocks double-submits</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section
        title="Validate on blur, not on the first keystroke"
        note="A touched map tracks which fields the user has actually left. Flagging 'a' as too short while someone is still typing 'abdullah' reads as hostile. After the first blur the field validates live, so the error clears the moment it's fixed."
        code={`// only show the error once the field has been left
const fieldError = name => (touched[name] ? errors[name] : "");

// on submit, treat everything as touched
setTouched(Object.fromEntries(Object.keys(validators).map(n => [n, true])));`}
      >
        <p className="section__note">
          Try it: focus Email on the login tab, type one letter, and nothing complains. Tab away and
          the error appears. Type a valid address and it clears immediately.
        </p>
      </Section>

      <Section
        title="Composable validators"
        note="Each validator is a pure function returning a message or an empty string. compose() runs them in order and stops at the first failure, so one field can have several rules without nesting ifs."
        code={`export const required = label => value =>
  String(value).trim() ? "" : \`\${label} is required.\`;

export const minLength = (label, min) => value =>
  value.trim().length >= min ? "" : \`\${label} needs at least \${min} characters.\`;

// combine
name: compose(required("Name"), minLength("Name", 3))

// cross-field — the second argument is every value
confirmPassword: (value, allValues) =>
  value === allValues.newPassword ? "" : "Passwords do not match.";`}
      >
        <p className="section__note">
          The profile form uses the cross-field version: change the new password and the confirm
          field revalidates against it.
        </p>
      </Section>

      <Section title="Client-side validation is a courtesy, not a control">
        <p className="section__note">
          Everything here exists to give a fast, clear correction loop. Anyone can open DevTools,
          delete the handler and submit whatever they like. Every rule on this page has to exist on
          the server too.
        </p>
      </Section>
    </>
  );
}
