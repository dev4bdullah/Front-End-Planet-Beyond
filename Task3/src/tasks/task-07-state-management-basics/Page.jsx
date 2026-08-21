import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Avatar, Badge, Button, Card, EmptyState, Input } from "@ui";
import { Modal, Tabs, Switch } from "@interactive";
import { team } from "@shared/data";

export default function Page() {
  /* 1 — a number */
  const [count, setCount] = useState(0);

  /* 2 — a boolean */
  const [expanded, setExpanded] = useState(false);
  const [dark, setDark] = useState(false);

  /* 3 — a string, driving a controlled input */
  const [query, setQuery] = useState("");

  /* 4 — an id, not the whole object */
  const [selectedId, setSelectedId] = useState(null);

  /* 5 — a modal */
  const [modalOpen, setModalOpen] = useState(false);

  /* 6 — an object, updated immutably */
  const [settings, setSettings] = useState({ notify: true, digest: "weekly", density: "cosy" });

  /* 7 — an array */
  const [items, setItems] = useState(["Review PR", "Write tests"]);
  const [draft, setDraft] = useState("");

  /* 8 — lazy initial state */
  const [expensive] = useState(() => {
    // The function form runs once. Passing the call directly would run it on EVERY render.
    let total = 0;
    for (let i = 0; i < 50_000; i++) total += i;
    return total;
  });

  const selected = team.find(person => person.id === selectedId) ?? null;
  const visible = team.filter(person =>
    person.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <>
      <PageHeader
        number={7}
        title="State Management Basics"
        brief="Use useState for counters, toggles, tabs, forms, modals, and selected records"
        lead="Eight kinds of state on one page — and the three mistakes that cause most useState bugs."
      />

      <Section
        title="Counter — the updater function"
        note="setCount(count + 1) reads a value captured when the component rendered. Three of those in a row all read the same stale value and you get +1, not +3. setCount(c => c + 1) always receives the latest."
        code={`// ❌ all three read the same stale count
<Button onClick={() => { setCount(count + 1); setCount(count + 1); setCount(count + 1); }} />

// ✅ each receives the result of the last
<Button onClick={() => { setCount(c => c + 1); setCount(c => c + 1); setCount(c => c + 1); }} />`}
      >
        <div className="demo stack">
          <p className="small">
            Count: <strong>{count}</strong>
          </p>
          <div className="row">
            <Button size="sm" onClick={() => setCount(value => value + 1)}>
              +1
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setCount(value => value + 1);
                setCount(value => value + 1);
                setCount(value => value + 1);
              }}
            >
              +3 (updater — works)
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setCount(count + 1);
                setCount(count + 1);
                setCount(count + 1);
              }}
            >
              +3 (stale — adds 1)
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCount(0)}>
              Reset
            </Button>
          </div>
          <p className="tiny muted">
            Press the two +3 buttons and compare. This is the single most common useState bug.
          </p>
        </div>
      </Section>

      <Section
        title="Toggles"
        note="Always setOpen(v => !v), never setOpen(!open) — same stale-closure reason as above."
        code={`<Button onClick={() => setExpanded(v => !v)}>
  {expanded ? "Hide" : "Show"}
</Button>

<Switch checked={dark} onChange={setDark} />`}
      >
        <div className="demo stack">
          <div className="row">
            <Button size="sm" onClick={() => setExpanded(value => !value)}>
              {expanded ? "Hide details" : "Show details"}
            </Button>
            <Switch checked={dark} onChange={setDark} label="Preview dark card" />
          </div>

          {expanded && (
            <Card variant={dark ? "raised" : "flat"}>
              <Card.Title>Conditionally rendered</Card.Title>
              <Card.Body>
                This block is unmounted entirely when hidden — not merely display:none. Any state it
                held would be lost.
              </Card.Body>
            </Card>
          )}
        </div>
      </Section>

      <Section
        title="Controlled input and derived values"
        note="Don't store what you can calculate. The filtered list below is derived during render — keeping it in a second useState means two sources of truth that fall out of sync."
        code={`const [query, setQuery] = useState("");

// ✅ derived on every render — always correct
const visible = team.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

// ❌ a second source of truth
const [visible, setVisible] = useState(team);
useEffect(() => setVisible(team.filter(...)), [query]);`}
      >
        <div className="demo stack">
          <Input
            label="Filter the team"
            placeholder="Type a name..."
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <p className="tiny muted">
            {visible.length} of {team.length} shown — derived, never stored
          </p>
          <ul className="list">
            {visible.map(person => (
              <li className="list__item" key={person.id}>
                <Avatar name={person.name} size="sm" />
                <span className="list__text">{person.name}</span>
                <Badge tone="neutral">{person.role}</Badge>
              </li>
            ))}
          </ul>
          {visible.length === 0 && (
            <EmptyState title="No matches" message="Try a different name." />
          )}
        </div>
      </Section>

      <Section
        title="Selected record — store the id, not the object"
        note="Storing the whole object means you're holding a stale copy the moment the source data updates. An id always resolves to the current version."
        code={`// ✅
const [selectedId, setSelectedId] = useState(null);
const selected = team.find(p => p.id === selectedId);

// ❌ goes stale as soon as team changes
const [selected, setSelected] = useState(null);`}
      >
        <div className="demo stack">
          <div className="row">
            {team.map(person => (
              <Button
                key={person.id}
                size="sm"
                variant={person.id === selectedId ? "primary" : "ghost"}
                onClick={() => setSelectedId(person.id === selectedId ? null : person.id)}
              >
                {person.name.split(" ")[0]}
              </Button>
            ))}
          </div>

          {selected ? (
            <Card variant="flat">
              <div className="row">
                <Avatar name={selected.name} />
                <div>
                  <p className="small" style={{ fontWeight: 600 }}>
                    {selected.name}
                  </p>
                  <p className="tiny muted">
                    {selected.role} · {selected.done}/{selected.tasks} tasks
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <p className="tiny muted">Nothing selected — selectedId is null.</p>
          )}
        </div>
      </Section>

      <Section
        title="Tabs and modals are state too"
        note="Both are just a value in state. A modal is a boolean, a tab group is a string id — neither needs a library."
        code={`const [modalOpen, setModalOpen] = useState(false);
<Modal open={modalOpen} onClose={() => setModalOpen(false)} />`}
      >
        <div className="demo stack">
          <Tabs
            items={[
              {
                id: "one",
                label: "Tab one",
                content: <p className="small">Tabs hold a string id in state.</p>
              },
              {
                id: "two",
                label: "Tab two",
                content: <p className="small">Switching tabs is just setState.</p>
              }
            ]}
          />
          <Button size="sm" onClick={() => setModalOpen(true)}>
            Open a modal
          </Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Just a boolean">
            <p className="small">
              <code>open</code> is <code>true</code>. Closing sets it to <code>false</code> and the
              component unmounts.
            </p>
          </Modal>
        </div>
      </Section>

      <Section
        title="Objects and arrays — replace, never mutate"
        note="React compares by reference. Mutating an object keeps the same reference, so React sees no change and skips the re-render. Copy, then change the copy."
        code={`// ❌ nothing happens — same reference
settings.notify = false;
setSettings(settings);

// ✅ new object
setSettings(prev => ({ ...prev, notify: false }));

// arrays
setItems(prev => [...prev, newItem]);              // add
setItems(prev => prev.filter(i => i !== target));  // remove
setItems(prev => prev.map(i => i === old ? next : i));  // update`}
      >
        <div className="demo grid">
          <div className="stack">
            <p className="tiny muted">Object state</p>
            <Switch
              checked={settings.notify}
              onChange={value => setSettings(previous => ({ ...previous, notify: value }))}
              label="Notifications"
            />
            <div className="row">
              {["daily", "weekly", "never"].map(option => (
                <Button
                  key={option}
                  size="sm"
                  variant={settings.digest === option ? "primary" : "ghost"}
                  onClick={() => setSettings(previous => ({ ...previous, digest: option }))}
                >
                  {option}
                </Button>
              ))}
            </div>
            <pre className="code code--inline">{JSON.stringify(settings, null, 2)}</pre>
          </div>

          <div className="stack">
            <p className="tiny muted">Array state</p>
            <div className="row">
              <Input
                placeholder="Add an item"
                value={draft}
                onChange={event => setDraft(event.target.value)}
              />
              <Button
                size="sm"
                disabled={!draft.trim()}
                onClick={() => {
                  setItems(previous => [...previous, draft.trim()]);
                  setDraft("");
                }}
              >
                Add
              </Button>
            </div>
            <ul className="list">
              {items.map(item => (
                <li className="list__item" key={item}>
                  <span className="list__text">{item}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setItems(previous => previous.filter(entry => entry !== item))}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            {items.length === 0 && <p className="tiny muted">Empty — add something above.</p>}
          </div>
        </div>
      </Section>

      <Section
        title="Lazy initial state"
        note="useState(expensiveCall()) runs the function on every render and throws the result away every time after the first. useState(() => expensiveCall()) runs it once."
        code={`// ❌ runs on every render
const [value] = useState(computeSomethingExpensive());

// ✅ runs once
const [value] = useState(() => computeSomethingExpensive());`}
      >
        <p className="section__note">
          Computed once at mount: <strong>{expensive.toLocaleString()}</strong>. Every button on
          this page re-renders the component, and that loop has never run again.
        </p>
      </Section>

      <Section title="The three mistakes, in one place">
        <table className="table">
          <thead>
            <tr>
              <th>Mistake</th>
              <th>Symptom</th>
              <th>Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>setCount(count + 1)</code> called twice
              </td>
              <td className="muted">only increments once</td>
              <td>
                <code>setCount(c =&gt; c + 1)</code>
              </td>
            </tr>
            <tr>
              <td>mutating an object in state</td>
              <td className="muted">nothing re-renders</td>
              <td>
                <code>{"setX(prev => ({ ...prev }))"}</code>
              </td>
            </tr>
            <tr>
              <td>storing a derived value</td>
              <td className="muted">two sources of truth, drift</td>
              <td>calculate during render</td>
            </tr>
          </tbody>
        </table>
      </Section>
    </>
  );
}
