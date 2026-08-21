import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { useCrud } from "@store/CrudContext";
import { useToast } from "@tasks/task-08-toast-notifications/lib/ToastContext";
import ProductFormRHF from "./forms/ProductFormRHF";

export default function Page() {
  const { actions } = useCrud();
  const { toast } = useToast();
  const [saved, setSaved] = useState(null);
  const [renders, setRenders] = useState(0);

  return (
    <>
      <PageHeader
        number={7}
        title="React Hook Form"
        brief="Rebuild one major form using react-hook-form with Controller components where needed"
        lead="The product form from task 6, rebuilt. Same rules, roughly a third of the plumbing."
      />

      <Section
        title="The rebuilt form"
        note="Try submitting empty, then fix one field at a time. The behaviour is deliberately identical to task 6 — that's the point of rebuilding rather than writing something new."
      >
        <ProductFormRHF
          onSubmit={values => {
            actions.create("products", values);
            setSaved(values);
            setRenders(count => count + 1);
            toast.success(`${values.name} created via react-hook-form.`);
          }}
        />

        {saved && (
          <>
            <p className="tiny muted">Last submitted ({renders} total):</p>
            <pre className="code">{JSON.stringify(saved, null, 2)}</pre>
          </>
        )}
      </Section>

      <Section
        title="What moved where"
        note="The rules didn't get simpler — they moved into the register call. What disappeared is the state management around them."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Concern</th>
              <th>Task 6 (by hand)</th>
              <th>react-hook-form</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Values", "useState + setValue per field", "register(), uncontrolled"],
              ["Errors", "useState object + validateAll()", "formState.errors"],
              ["Touched", "a Set maintained on blur", "formState.touchedFields"],
              ["Validate on blur", "hand-rolled in the hook", 'mode: "onTouched"'],
              ["Focus first error", "querySelector after submit", "automatic"],
              ["isDirty", "JSON.stringify comparison", "formState.isDirty"],
              ["Submitting", "useState + try/finally", "formState.isSubmitting"],
              ["Re-renders", "one per keystroke", "none, until an error changes"]
            ].map(([concern, manual, rhf]) => (
              <tr key={concern}>
                <td>{concern}</td>
                <td className="muted tiny">{manual}</td>
                <td className="tiny">{rhf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="register — the core of it"
        note="register returns the props an input needs: name, ref, onChange, onBlur. Spreading it makes the input uncontrolled, which is why typing doesn't re-render the form."
        code={`<input
  {...register("name", {
    required: "Name is required.",
    minLength: { value: 3, message: "Name needs at least 3 characters." },
    maxLength: { value: 60, message: "Name must be under 60 characters." }
  })}
/>

<p className="field__error">{errors.name?.message}</p>`}
      >
        <p className="section__note">
          Note the message strings live next to the rule. In the manual version the rule and its
          message are in <code>validation.js</code>, which is arguably better for reuse and worse
          for reading one form.
        </p>
      </Section>

      <Section
        title="valueAsNumber, and the bug without it"
        code={`{...register("price", {
  valueAsNumber: true,                                  // ← without this…
  min: { value: 0.01, message: "Must be greater than zero." }
})}

// …price is the string "5", and "5" > 0.01 does work by coercion,
// but validate: value => Number.isInteger(value) never does,
// and the value saved into the record is a string.`}
      >
        <p className="section__note">
          Every input reads as a string, in every framework. <code>valueAsNumber</code> is the
          library&apos;s answer; the manual version has to call <code>Number()</code> in the
          validator and again before saving.
        </p>
      </Section>

      <Section
        title="Controller — and when you actually need it"
        note="register works by attaching a ref to a native input. A component that doesn't forward a ref, or doesn't emit a normal change event, can't be registered — that's what Controller is for."
        code={`<Controller
  name="category"
  control={control}
  rules={{ required: "Category is required." }}
  render={({ field, fieldState }) => (
    <MyCustomSelect {...field} error={fieldState.error?.message} />
  )}
/>`}
      >
        <ul className="list">
          {[
            "A component library's Select, DatePicker or Autocomplete",
            "A rich text editor",
            "Anything storing a non-string value — a Date, an array of tags",
            "NOT a plain <input> or <select> — register is simpler and faster"
          ].map(item => (
            <li className="list__item" key={item}>
              <span className="list__text tiny">{item}</span>
            </li>
          ))}
        </ul>
        <p className="section__note">
          The Category field on this page uses <code>Controller</code> around a plain{" "}
          <code>&lt;select&gt;</code> purely to show the shape. In production that field would use{" "}
          <code>register</code> — <code>Controller</code> makes it controlled again, which gives up
          the re-render saving.
        </p>
      </Section>

      <Section
        title="Custom validate rules"
        code={`validate: {
  whole: value => Number.isInteger(value) || "Stock must be a whole number.",

  // the second argument is every value — cross-field rules without extra wiring
  activeNeedsStock: (value, values) =>
    !(values.status === "active" && value === 0) ||
    "An active product can't have zero stock."
}`}
      >
        <p className="section__note">
          Same cross-field rule as task 6, expressed in about a third of the code. Set Status to
          Active and Stock to 0 in the form above.
        </p>
      </Section>

      <Section
        title="When to use which"
        note="Honest version: the library wins on any form with more than about four fields. Below that, the hook in task 6 is fewer moving parts and no dependency."
      >
        <div className="grid">
          <div className="card card--flat">
            <p className="small" style={{ fontWeight: 700 }}>
              Write it by hand when
            </p>
            <ul className="tiny muted" style={{ marginLeft: "1rem", marginTop: "0.4rem" }}>
              <li>the form has two or three fields</li>
              <li>the rules are genuinely unusual</li>
              <li>you&apos;re learning what the library does for you</li>
              <li>a dependency has to be justified</li>
            </ul>
          </div>
          <div className="card card--flat">
            <p className="small" style={{ fontWeight: 700 }}>
              Reach for react-hook-form when
            </p>
            <ul className="tiny muted" style={{ marginLeft: "1rem", marginTop: "0.4rem" }}>
              <li>the form has more than about four fields</li>
              <li>re-render cost is measurable</li>
              <li>you want schema validation via zod or yup</li>
              <li>field arrays — repeating rows of inputs</li>
            </ul>
          </div>
        </div>
        <p className="section__note">
          The version this project pins is 7.x. Its API has been stable for years, which is worth
          more than most feature comparisons.
        </p>
      </Section>
    </>
  );
}
