import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Avatar, Badge, Button, EmptyState, Input, Select, Skeleton } from "@ui";
import { tasks as seed, products } from "@shared/data";

const RANK = { high: 0, medium: 1, low: 2 };

/* The demo that proves why keys matter. Each row has its own uncontrolled
   input — React only preserves it correctly when the key is stable. */
function KeyDemo({ useIndexKey }) {
  const [rows, setRows] = useState([
    { id: "a", label: "First" },
    { id: "b", label: "Second" },
    { id: "c", label: "Third" }
  ]);

  return (
    <div className="stack">
      <ul className="list">
        {rows.map((row, index) => (
          <li className="list__item" key={useIndexKey ? index : row.id}>
            <span className="list__text">{row.label}</span>
            <input
              className="field__control"
              style={{ maxWidth: "150px" }}
              placeholder="type here"
              aria-label={`Note for ${row.label}`}
            />
          </li>
        ))}
      </ul>

      <div className="row">
        <Button size="sm" variant="ghost" onClick={() => setRows(list => [...list].reverse())}>
          Reverse order
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setRows(list => list.slice(1))}>
          Remove first
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            setRows([
              { id: "a", label: "First" },
              { id: "b", label: "Second" },
              { id: "c", label: "Third" }
            ])
          }
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

export default function Page() {
  const [tasks, setTasks] = useState(seed);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("priority");
  const [loading, setLoading] = useState(false);
  const [useIndexKey, setUseIndexKey] = useState(false);

  const visible = tasks
    .filter(task => {
      if (filter === "active") return !task.done;
      if (filter === "done") return task.done;
      if (filter === "high") return task.priority === "high";
      return true;
    })
    .filter(task => task.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) =>
      sort === "priority" ? RANK[a.priority] - RANK[b.priority] : a.title.localeCompare(b.title)
    );

  const toggle = id =>
    setTasks(list => list.map(task => (task.id === id ? { ...task, done: !task.done } : task)));

  const remove = id => setTasks(list => list.filter(task => task.id !== id));

  const simulateLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <>
      <PageHeader
        number={9}
        title="List Rendering"
        brief="Render dynamic arrays with proper keys, empty states, status badges, and conditional actions"
        lead="map() is the easy half. Keys, empty states and loading states are what separate a demo from something usable."
      />

      <Section
        title="Keys — and what breaks without stable ones"
        note="Each row below has its own uncontrolled input. Type into the boxes, then press Reverse or Remove first. With id keys the text follows its row. With index keys it stays behind, because React thinks row 0 is still row 0 and only swaps the text."
        code={`// ✅ stable — tied to the data
{rows.map(row => <Row key={row.id} {...row} />)}

// ❌ positional — breaks on reorder, insert and delete
{rows.map((row, i) => <Row key={i} {...row} />)}

// ❌ new key every render — remounts everything, every time
{rows.map(row => <Row key={Math.random()} {...row} />)}`}
      >
        <div className="demo stack">
          <div className="row">
            <Button
              size="sm"
              variant={useIndexKey ? "ghost" : "primary"}
              onClick={() => setUseIndexKey(false)}
            >
              key={"{row.id}"}
            </Button>
            <Button
              size="sm"
              variant={useIndexKey ? "danger" : "ghost"}
              onClick={() => setUseIndexKey(true)}
            >
              key={"{index}"}
            </Button>
            <Badge tone={useIndexKey ? "bad" : "ok"}>
              {useIndexKey ? "positional — watch it break" : "stable"}
            </Badge>
          </div>

          {/* The outer key forces a clean remount when the strategy changes,
              so the two modes can be compared from the same starting point. */}
          <KeyDemo key={String(useIndexKey)} useIndexKey={useIndexKey} />

          <p className="tiny muted">
            Type in all three boxes, then press Reverse. Index keys are only safe when the list
            never reorders, never has items inserted or removed, and has no state or inputs inside
            it — which is rarer than it sounds.
          </p>
        </div>
      </Section>

      <Section
        title="A real list — filter, search, sort"
        note="All three derive from state during render. Nothing is stored twice, so nothing can fall out of sync."
        code={`const visible = tasks
  .filter(t => filter === "done" ? t.done : filter === "active" ? !t.done : true)
  .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
  .sort((a, b) => RANK[a.priority] - RANK[b.priority]);`}
      >
        <div className="demo stack">
          <div className="row">
            <Input
              placeholder="Search tasks..."
              value={query}
              onChange={event => setQuery(event.target.value)}
              aria-label="Search tasks"
            />
            <Select
              value={sort}
              onChange={event => setSort(event.target.value)}
              placeholder=""
              options={[
                { value: "priority", label: "By priority" },
                { value: "title", label: "A–Z" }
              ]}
              aria-label="Sort"
            />
          </div>

          <div className="row">
            {["all", "active", "done", "high"].map(value => (
              <Button
                key={value}
                size="sm"
                variant={filter === value ? "primary" : "ghost"}
                onClick={() => setFilter(value)}
              >
                {value}
              </Button>
            ))}
            <Button size="sm" variant="secondary" onClick={simulateLoad}>
              Simulate loading
            </Button>
          </div>

          {loading ? (
            <div>
              <Skeleton height="2.6rem" count={3} />
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              title={tasks.length === 0 ? "No tasks left" : "Nothing matches"}
              message={
                tasks.length === 0
                  ? "Everything has been deleted."
                  : "Try a different search or filter."
              }
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                    setTasks(seed);
                  }}
                >
                  Reset
                </Button>
              }
            />
          ) : (
            <ul className="list">
              {visible.map(task => (
                <li className={`list__item ${task.done ? "list__item--done" : ""}`} key={task.id}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggle(task.id)}
                    aria-label={`Complete ${task.title}`}
                  />
                  <span className="list__text">{task.title}</span>

                  <Badge
                    tone={
                      task.priority === "high" ? "bad" : task.priority === "medium" ? "warn" : "ok"
                    }
                  >
                    {task.priority}
                  </Badge>

                  {/* Conditional action: only unfinished tasks can be deleted */}
                  {!task.done && (
                    <Button size="sm" variant="ghost" onClick={() => remove(task.id)}>
                      Delete
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="tiny muted">
            Showing {visible.length} of {tasks.length}
          </p>
        </div>
      </Section>

      <Section
        title="Every list needs four states"
        note="Loading, empty-because-no-data, empty-because-filtered, and populated. The two empty states say different things and merging them confuses people — 'nothing matches' is not the same message as 'you have no tasks yet'."
        code={`{loading   ? <Skeleton count={3} />
: !items.length && !hasFilters ? <EmptyState title="No tasks yet" />
: !visible.length              ? <EmptyState title="Nothing matches" />
: <ul>{visible.map(...)}</ul>}`}
      >
        <p className="section__note">
          Delete every task above to see the first empty state, or search for nonsense to see the
          second.
        </p>
      </Section>

      <Section
        title="Grouping"
        note="reduce into an object, then map the entries. Object.entries preserves insertion order for string keys, so the groups come out in the order they first appeared."
        code={`const groups = products.reduce((acc, item) => {
  (acc[item.category] ||= []).push(item);
  return acc;
}, {});

{Object.entries(groups).map(([category, items]) => (
  <div key={category}>
    <h4>{category}</h4>
    {items.map(item => <Row key={item.id} {...item} />)}
  </div>
))}`}
      >
        <div className="demo stack">
          {Object.entries(
            products.reduce((acc, product) => {
              (acc[product.category] ||= []).push(product);
              return acc;
            }, {})
          ).map(([category, items]) => (
            <div key={category}>
              <p className="small" style={{ fontWeight: 600 }}>
                {category} <Badge tone="neutral">{items.length}</Badge>
              </p>
              <ul className="list" style={{ marginTop: "0.3rem" }}>
                {items.map(product => (
                  <li className="list__item" key={product.id}>
                    <Avatar name={product.name} size="sm" square />
                    <span className="list__text">{product.name}</span>
                    <span className="tiny muted">${product.price}</span>
                    {product.stock === 0 ? (
                      <Badge tone="bad">out of stock</Badge>
                    ) : product.stock < 5 ? (
                      <Badge tone="warn">low</Badge>
                    ) : (
                      <Badge tone="ok">in stock</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Key rules, summarised">
        <table className="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Verdict</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>item.id</code>
              </td>
              <td>
                <Badge tone="ok">correct</Badge>
              </td>
              <td className="muted">tied to the data, survives reordering</td>
            </tr>
            <tr>
              <td>
                <code>index</code>
              </td>
              <td>
                <Badge tone="warn">only if static</Badge>
              </td>
              <td className="muted">no reorder, no insert, no delete, no inner state</td>
            </tr>
            <tr>
              <td>
                <code>Math.random()</code>
              </td>
              <td>
                <Badge tone="bad">never</Badge>
              </td>
              <td className="muted">new key every render, so everything remounts every time</td>
            </tr>
            <tr>
              <td>no key</td>
              <td>
                <Badge tone="bad">never</Badge>
              </td>
              <td className="muted">React falls back to index and warns in the console</td>
            </tr>
          </tbody>
        </table>
        <p className="section__note">
          Keys only need to be unique among siblings, not globally. And they aren&apos;t passed to
          the component — reading <code>props.key</code> gives <code>undefined</code>. Pass the id
          twice if the child needs it.
        </p>
      </Section>
    </>
  );
}
