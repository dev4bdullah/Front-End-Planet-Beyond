import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card } from "@ui";
import { cx } from "@shared/cx";
import { team } from "@shared/data";

/* Extracted markup — a component defined outside the main one so it isn't
   redefined on every render. */
function Stat({ label, value, tone = "brand" }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
      <Badge tone={tone}>{tone === "ok" ? "good" : "watch"}</Badge>
    </div>
  );
}

export default function Page() {
  const [count, setCount] = useState(3);
  const [status, setStatus] = useState("loading");

  const isEven = count % 2 === 0;

  return (
    <>
      <PageHeader
        number={3}
        title="JSX Fundamentals"
        brief="Practice fragments, expressions, conditional rendering, dynamic class names, and reusable markup patterns"
        lead="JSX is JavaScript with markup syntax — everything in braces is an expression, which is why all of this works."
      />

      <Section
        title="Expressions in braces"
        note="Anything that evaluates to a value can go in braces. Statements — if, for, switch — cannot, which is why conditionals use ternaries or && instead."
        code={`<p>{team.length} people</p>
<p>{count * 2}</p>
<p>{new Date().getFullYear()}</p>
<p>{isEven ? "even" : "odd"}</p>
<p>{team.map(p => p.name).join(", ")}</p>`}
      >
        <div className="demo stack">
          <p className="small">Team size: {team.length} people</p>
          <p className="small">
            Count doubled: {count * 2} — currently {isEven ? "even" : "odd"}
          </p>
          <p className="small">Year: {new Date().getFullYear()}</p>
          <p className="small muted">Names: {team.map(person => person.name).join(", ")}</p>
          <div className="row">
            <Button size="sm" onClick={() => setCount(value => value + 1)}>
              Increment
            </Button>
          </div>
        </div>
      </Section>

      <Section
        title="Fragments"
        note="A component returns one node. A fragment groups siblings without adding a wrapper div — which matters when the parent is a grid or flex container and a stray div would break the layout."
        code={`// <> </> — the short form, no extra DOM node
return (
  <>
    <h3>Title</h3>
    <p>Body</p>
  </>
);

// <React.Fragment key={id}> — the long form, needed when you want a key
{items.map(item => (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </React.Fragment>
))}`}
      >
        <div className="demo">
          <p className="small muted">
            The three stats below are siblings inside a grid. Wrapping them in a div would make them
            one grid item instead of three.
          </p>
          <div className="grid" style={{ marginTop: "0.6rem" }}>
            <Stat label="People" value={team.length} tone="ok" />
            <Stat label="Open tasks" value={team.reduce((sum, p) => sum + (p.tasks - p.done), 0)} />
            <Stat label="Count" value={count} tone={isEven ? "ok" : "warn"} />
          </div>
        </div>
      </Section>

      <Section
        title="Conditional rendering"
        note="Three patterns, each with its own trap."
        code={`// ternary — when there are two outcomes
{isLoggedIn ? <Dashboard /> : <Login />}

// && — when there's one
{error && <ErrorState message={error} />}

// early return — when the whole component depends on it
if (!user) return <EmptyState />;

// the && trap: 0 is falsy but React RENDERS it
{items.length && <List />}     // shows "0" when empty
{items.length > 0 && <List />} // correct`}
      >
        <div className="demo stack">
          <div className="row">
            {["loading", "success", "empty", "error"].map(value => (
              <Button
                key={value}
                size="sm"
                variant={status === value ? "primary" : "ghost"}
                onClick={() => setStatus(value)}
              >
                {value}
              </Button>
            ))}
          </div>

          <div style={{ minHeight: "56px" }}>
            {status === "loading" && <p className="small muted">Loading…</p>}
            {status === "success" && (
              <p className="small">
                Loaded {team.length} people <Badge tone="ok">200</Badge>
              </p>
            )}
            {status === "empty" && <p className="small muted">No results found.</p>}
            {status === "error" && (
              <p className="small" style={{ color: "var(--bad)" }}>
                Request failed.
              </p>
            )}
          </div>

          <p className="tiny muted">
            The <code>0</code> trap is worth remembering: <code>{"{items.length && <List/>}"}</code>{" "}
            renders a literal <code>0</code> on the page when the array is empty, because React
            skips <code>false</code> and <code>null</code> but happily prints <code>0</code>.
          </p>
        </div>
      </Section>

      <Section
        title="Dynamic class names"
        note="A tiny cx() helper beats template strings, because falsy values drop out instead of leaving stray spaces or the word 'false' in your class attribute."
        code={`// src/shared/cx.js
export const cx = (...classes) => classes.filter(Boolean).join(" ");

// in a component
<button className={cx("btn", isActive && "btn--active", size && \`btn--\${size}\`)} />

// without it — note the empty string leaves a double space
<button className={\`btn \${isActive ? "btn--active" : ""}\`} />`}
      >
        <div className="demo row">
          <button className={cx("btn", "btn--sm", isEven && "btn--active")} type="button">
            {isEven ? "active (count is even)" : "inactive (count is odd)"}
          </button>
          <code className="tiny">{cx("btn", "btn--sm", isEven && "btn--active")}</code>
        </div>
      </Section>

      <Section
        title="Reusable markup"
        note="The moment you write the same block twice, extract it. Define the component outside the parent — a component declared inside another is a brand-new type on every render, so React unmounts and remounts it, losing state and focus."
        code={`// ✅ outside
function Stat({ label, value }) {
  return <div className="stat">{value} {label}</div>;
}

export default function Page() { ... }

// ❌ inside — remounts on every parent render
export default function Page() {
  function Stat({ label }) { ... }   // new function identity each time
  return <Stat label="x" />;
}`}
      >
        <div className="grid">
          {team.slice(0, 3).map(person => (
            <Card key={person.id} variant="flat">
              <Card.Title>{person.name}</Card.Title>
              <Card.Body>
                {person.done} of {person.tasks} done
              </Card.Body>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="JSX attribute gotchas"
        code={`className   not class          // class is reserved in JS
htmlFor     not for
onClick     not onclick        // camelCase, and a function not a string
style={{ }}  double braces     // an object, and camelCased keys
{/* comment */}                // braces around a JS comment`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>HTML</th>
              <th>JSX</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>class</code>
              </td>
              <td>
                <code>className</code>
              </td>
              <td className="muted">class is a reserved word in JavaScript</td>
            </tr>
            <tr>
              <td>
                <code>for</code>
              </td>
              <td>
                <code>htmlFor</code>
              </td>
              <td className="muted">same reason</td>
            </tr>
            <tr>
              <td>
                <code>onclick=&quot;fn()&quot;</code>
              </td>
              <td>
                <code>onClick={"{fn}"}</code>
              </td>
              <td className="muted">camelCase, and a function reference not a string</td>
            </tr>
            <tr>
              <td>
                <code>style=&quot;color:red&quot;</code>
              </td>
              <td>
                <code>style={"{{ color: 'red' }}"}</code>
              </td>
              <td className="muted">an object — outer braces are JSX, inner are the object</td>
            </tr>
            <tr>
              <td>
                <code>tabindex</code>
              </td>
              <td>
                <code>tabIndex</code>
              </td>
              <td className="muted">camelCase, like every multi-word attribute</td>
            </tr>
          </tbody>
        </table>
      </Section>
    </>
  );
}
