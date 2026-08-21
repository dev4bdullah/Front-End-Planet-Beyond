import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Input, Select } from "@ui";
import { Modal, Tabs, Switch, useToast } from "@interactive";
import { useTasks } from "./hooks/useTasks";
import { useDebounce } from "./hooks/useDebounce";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskStats from "./components/TaskStats";

const SEED = [
  {
    id: "s1",
    title: "Finish the responsive layout",
    priority: "high",
    done: false,
    createdAt: Date.now()
  },
  {
    id: "s2",
    title: "Write the validation module",
    priority: "medium",
    done: true,
    createdAt: Date.now() - 1000
  },
  {
    id: "s3",
    title: "Review the DevTools notes",
    priority: "low",
    done: false,
    createdAt: Date.now() - 2000
  }
];

export default function Page() {
  const { tasks, add, update, remove, toggle, clear, stats, select } = useTasks(SEED);
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("created");
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [compact, setCompact] = useState(false);

  // Debounced so a fast typist doesn't re-filter on every keystroke
  const debouncedSearch = useDebounce(search, 250);
  const visible = select({ search: debouncedSearch, filter, sort });

  function handleSave(values) {
    if (editing) {
      update(editing.id, values);
      toast("Task updated", "ok");
      setEditing(null);
    } else {
      add(values);
      toast("Task added", "ok");
    }
  }

  function handleDelete() {
    remove(confirming.id);
    toast(`Deleted "${confirming.title}"`, "bad");
    if (editing?.id === confirming.id) setEditing(null);
    setConfirming(null);
  }

  return (
    <>
      <PageHeader
        number={12}
        title="Deliverable"
        brief="Build a React UI playground that documents reusable components, variants, states, and usage examples"
        lead="The playground is the eleven pages in this sidebar. This page is the application they add up to."
      />

      <Section
        title="Task manager"
        note="Every earlier task, working together: base components, interactive components, controlled forms, list rendering with stable keys, and custom hooks."
      >
        <div className="stack">
          <TaskStats stats={stats} />

          <TaskForm onSave={handleSave} editing={editing} onCancel={() => setEditing(null)} />

          <div className="row">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search tasks"
            />
            <Select
              value={sort}
              onChange={event => setSort(event.target.value)}
              placeholder=""
              aria-label="Sort tasks"
              options={[
                { value: "created", label: "Newest first" },
                { value: "priority", label: "By priority" },
                { value: "title", label: "A–Z" }
              ]}
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
            <Switch checked={compact} onChange={setCompact} label="Compact" />
          </div>

          <TaskList
            tasks={compact ? visible.slice(0, 5) : visible}
            totalCount={tasks.length}
            onToggle={toggle}
            onEdit={setEditing}
            onDelete={setConfirming}
            onReset={() => {
              setSearch("");
              setFilter("all");
            }}
          />

          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="tiny muted">
              Showing {compact ? Math.min(visible.length, 5) : visible.length} of {tasks.length}
              {search !== debouncedSearch && " · filtering…"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clear();
                toast("All tasks cleared", "warn");
              }}
            >
              Clear all
            </Button>
          </div>
        </div>

        <Modal
          open={Boolean(confirming)}
          onClose={() => setConfirming(null)}
          title="Delete this task?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          }
        >
          <p className="small">
            &quot;{confirming?.title}&quot; will be removed. This cannot be undone.
          </p>
        </Modal>
      </Section>

      <Section title="Where each task shows up">
        <table className="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Used here as</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1 · Vite setup</td>
              <td className="muted">every import above uses an alias</td>
            </tr>
            <tr>
              <td>2 · Folder structure</td>
              <td className="muted">this folder has its own components/ and hooks/</td>
            </tr>
            <tr>
              <td>3 · JSX fundamentals</td>
              <td className="muted">conditional rendering throughout, cx for class names</td>
            </tr>
            <tr>
              <td>4 · Base components</td>
              <td className="muted">Button, Input, Select, Badge, EmptyState</td>
            </tr>
            <tr>
              <td>5 · Interactive components</td>
              <td className="muted">Modal confirms deletes, Switch, Toast on every action</td>
            </tr>
            <tr>
              <td>6 · Props &amp; composition</td>
              <td className="muted">TaskList takes callbacks, never touches the data itself</td>
            </tr>
            <tr>
              <td>7 · State basics</td>
              <td className="muted">search, filter, sort, editing id, confirming record</td>
            </tr>
            <tr>
              <td>8 · Controlled forms</td>
              <td className="muted">
                TaskForm imports task 8&apos;s useForm and validators directly
              </td>
            </tr>
            <tr>
              <td>9 · List rendering</td>
              <td className="muted">stable keys, two empty states, conditional Edit button</td>
            </tr>
            <tr>
              <td>10 · Styling strategy</td>
              <td className="muted">no colour or spacing value anywhere in this file</td>
            </tr>
            <tr>
              <td>11 · DevTools</td>
              <td className="muted">useCallback in useTasks, useMemo for stats</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section
        title="The custom hooks"
        note="Logic in hooks, markup in components. That split is what makes a component readable — TaskList has no idea where the data comes from."
        code={`// useTasks.js — every rule about tasks lives here
const { tasks, add, update, remove, toggle, stats, select } = useTasks(SEED);

// useLocalStorage.js — same API as useState, survives a refresh
const [tasks, setTasks] = useLocalStorage("day3.tasks", seed);

// useDebounce.js — the cleanup is the mechanism
useEffect(() => {
  const timer = setTimeout(() => setDebounced(value), delay);
  return () => clearTimeout(timer);   // every keystroke cancels the last
}, [value, delay]);`}
      >
        <Tabs
          items={[
            {
              id: "tasks",
              label: "useTasks",
              content: (
                <p className="small">
                  Owns the array, the CRUD operations, the derived stats and the filter/sort
                  pipeline. Every action is wrapped in <code>useCallback</code> so passing them down
                  doesn&apos;t break memoisation, and <code>stats</code> is a <code>useMemo</code>{" "}
                  over the list.
                </p>
              )
            },
            {
              id: "storage",
              label: "useLocalStorage",
              content: (
                <p className="small">
                  Identical API to <code>useState</code>, so swapping one for the other is a
                  one-word change. Add a task and refresh — it&apos;s still there. The initial read
                  is lazy, so it happens once rather than on every render.
                </p>
              )
            },
            {
              id: "debounce",
              label: "useDebounce",
              content: (
                <p className="small">
                  Type quickly in the search box and watch the &quot;filtering…&quot; hint appear.
                  The cleanup is the entire mechanism: each keystroke clears the previous timer, so
                  only the last one ever fires.
                </p>
              )
            }
          ]}
        />
      </Section>

      <Section title="Try this">
        <ul className="list">
          <li className="list__item">
            Add a task, refresh the page — it persists via useLocalStorage
          </li>
          <li className="list__item">Type a 2-character title and submit — validation blocks it</li>
          <li className="list__item">Edit a task, then press Cancel — no changes kept</li>
          <li className="list__item">Delete one — a modal confirms, and Escape cancels it</li>
          <li className="list__item">
            Search for nonsense — the &quot;nothing matches&quot; state appears with a clear-filters
            action
          </li>
          <li className="list__item">
            Clear all — the other empty state appears, with different wording
          </li>
          <li className="list__item">
            Flip the theme in task 10 — every component here follows, with no code in this file
          </li>
        </ul>
        <p className="section__note">
          <Badge tone="ok">note</Badge> Tasks are stored under the key <code>day3.tasks</code> in
          localStorage. DevTools → Application → Local Storage to see the raw JSON.
        </p>
      </Section>
    </>
  );
}
