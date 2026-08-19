import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Avatar, Badge, Button, Card, Input } from "@ui";
import { team } from "@shared/data";

/* ---------- primitives ---------- */
function Greeting({ name, count = 0, isAdmin = false }) {
  return (
    <p className="small">
      {name} — {count} task{count === 1 ? "" : "s"} {isAdmin && <Badge tone="ok">admin</Badge>}
    </p>
  );
}

/* ---------- object + array props ---------- */
function PersonCard({ person, tags = [], onPing }) {
  return (
    <Card variant="flat">
      <div className="row">
        <Avatar name={person.name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="small" style={{ fontWeight: 600 }}>
            {person.name}
          </p>
          <p className="tiny muted">{person.role}</p>
        </div>
      </div>
      <div className="row">
        {tags.map(tag => (
          <Badge key={tag} tone="neutral">
            {tag}
          </Badge>
        ))}
      </div>
      <Card.Footer>
        {/* callback prop: the child says what happened, the parent decides what to do */}
        <Button size="sm" variant="ghost" onClick={() => onPing(person.name)}>
          Ping
        </Button>
      </Card.Footer>
    </Card>
  );
}

/* ---------- children as a slot ---------- */
function Panel({ title, actions, children }) {
  return (
    <div className="demo stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong className="small">{title}</strong>
        {actions}
      </div>
      {children}
    </div>
  );
}

/* ---------- children as a function (render prop) ---------- */
function Toggle({ children }) {
  const [on, setOn] = useState(false);
  return children({ on, toggle: () => setOn(value => !value) });
}

/* ---------- specialisation by wrapping ---------- */
function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

export default function Page() {
  const [log, setLog] = useState([]);

  const record = message => setLog(previous => [message, ...previous].slice(0, 4));

  return (
    <>
      <PageHeader
        number={6}
        title="Props & Composition"
        brief="Pass primitives, objects, arrays, callbacks, children, and component variants through props"
        lead="Props flow down, callbacks report back up. Everything else is a variation on those two."
      />

      <Section
        title="Primitives, with defaults"
        note="Default parameters in the signature beat defaultProps — they're plain JavaScript, they work for function components, and defaultProps is deprecated for them anyway."
        code={`function Greeting({ name, count = 0, isAdmin = false }) {
  return <p>{name} — {count} tasks {isAdmin && <Badge>admin</Badge>}</p>;
}

<Greeting name="Ayesha" count={12} isAdmin />
<Greeting name="Attique" />          // count and isAdmin fall back`}
      >
        <div className="demo stack">
          <Greeting name="Ayesha Raiz" count={12} isAdmin />
          <Greeting name="Sadiq Rehman" count={1} />
          <Greeting name="Attique Ahmed" />
          <p className="tiny muted">
            <code>isAdmin</code> with no value means <code>isAdmin={"{true}"}</code> — that
            shorthand only works for booleans.
          </p>
        </div>
      </Section>

      <Section
        title="Objects, arrays and callbacks"
        note="Passing the whole object keeps the call site short. Passing a callback is how a child reports upward without knowing what the parent will do with it."
        code={`<PersonCard
  person={person}                    // object
  tags={["frontend", "react"]}       // array
  onPing={name => record(name)}      // callback
/>`}
      >
        <div className="grid">
          {team.slice(0, 3).map(person => (
            <PersonCard
              key={person.id}
              person={person}
              tags={person.role === "Frontend" ? ["react", "css"] : ["node"]}
              onPing={name => record(`Pinged ${name}`)}
            />
          ))}
        </div>

        {log.length > 0 && (
          <div className="demo">
            <p className="tiny muted">Parent received:</p>
            {log.map((entry, index) => (
              <p key={index} className="small">
                {entry}
              </p>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="children as a slot"
        note="The most useful prop, and the one people reach for last. A component that takes children never has to know what goes inside it — which is exactly why it stays reusable."
        code={`function Panel({ title, actions, children }) {
  return (
    <div>
      <header>{title} {actions}</header>
      {children}
    </div>
  );
}

<Panel title="Team" actions={<Button size="sm">Add</Button>}>
  <p>Anything at all goes here.</p>
</Panel>`}
      >
        <div className="grid">
          <Panel title="With a form" actions={<Button size="sm">Save</Button>}>
            <Input label="Team name" defaultValue="Frontend" />
          </Panel>

          <Panel title="With a list" actions={<Badge tone="ok">4</Badge>}>
            <ul className="list">
              {team.map(person => (
                <li className="list__item" key={person.id}>
                  <Avatar name={person.name} size="sm" />
                  <span className="list__text">{person.name}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <p className="section__note">
          Both panels use the same component. Neither knows anything about forms or lists —{" "}
          <code>actions</code> is a second slot, proving you can have more than one.
        </p>
      </Section>

      <Section
        title="children as a function"
        note="A render prop: the component owns the behaviour, the caller owns the markup. Custom hooks have largely replaced this pattern, but it's worth recognising in older code — and it's still the cleanest way to share behaviour with an unknown UI."
        code={`function Toggle({ children }) {
  const [on, setOn] = useState(false);
  return children({ on, toggle: () => setOn(v => !v) });
}

<Toggle>
  {({ on, toggle }) => <Button onClick={toggle}>{on ? "On" : "Off"}</Button>}
</Toggle>`}
      >
        <div className="demo row">
          <Toggle>
            {({ on, toggle }) => (
              <Button variant={on ? "primary" : "ghost"} onClick={toggle}>
                {on ? "Enabled" : "Disabled"}
              </Button>
            )}
          </Toggle>

          <Toggle>
            {({ on, toggle }) => (
              <span className="row" onClick={toggle} style={{ cursor: "pointer" }}>
                <Badge tone={on ? "ok" : "neutral"}>{on ? "visible" : "hidden"}</Badge>
                <span className="tiny muted">same component, different markup</span>
              </span>
            )}
          </Toggle>
        </div>
      </Section>

      <Section
        title="Specialisation by wrapping"
        note="When you find yourself passing the same props over and over, wrap once. The spread must come after the fixed prop so callers can still override it."
        code={`function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

<DangerButton>Delete</DangerButton>
<DangerButton size="sm" disabled>Disabled</DangerButton>

// order matters — this version can never be overridden:
function Broken(props) {
  return <Button {...props} variant="danger" />;
}`}
      >
        <div className="demo row">
          <DangerButton>Delete</DangerButton>
          <DangerButton size="sm">Small delete</DangerButton>
          <DangerButton disabled>Disabled</DangerButton>
          <DangerButton variant="ghost">Overridden back to ghost</DangerButton>
        </div>
      </Section>

      <Section
        title="Two rules about props"
        code={`// 1. props are read-only — never assign to them
function Bad({ items }) {
  items.push("x");        // ❌ mutating the parent's array
  return null;
}

function Good({ items }) {
  const next = [...items, "x"];   // ✅ a copy
  return null;
}

// 2. a new object or array literal is a new reference every render
<Child config={{ a: 1 }} />       // breaks React.memo on Child
const config = useMemo(() => ({ a: 1 }), []);   // stable`}
      >
        <p className="section__note">
          The second rule is what task 11 profiles. An inline <code>{"{{ }}"}</code> or arrow
          function is a fresh reference on every render, so a memoised child re-renders anyway.
        </p>
      </Section>
    </>
  );
}
