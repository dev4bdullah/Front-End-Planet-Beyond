import { useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const RANK = { high: 0, medium: 1, low: 2 };

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* All the task logic in one hook, so the components stay presentational.
   This is the pattern that makes a component testable — the rules live here,
   the markup lives there. */

export function useTasks(seed = []) {
  const [tasks, setTasks] = useLocalStorage("day3.tasks", seed);

  const add = useCallback(
    task =>
      setTasks(list => [{ id: makeId(), done: false, createdAt: Date.now(), ...task }, ...list]),
    [setTasks]
  );

  const update = useCallback(
    (id, changes) =>
      setTasks(list => list.map(task => (task.id === id ? { ...task, ...changes } : task))),
    [setTasks]
  );

  const remove = useCallback(
    id => setTasks(list => list.filter(task => task.id !== id)),
    [setTasks]
  );

  const toggle = useCallback(
    id =>
      setTasks(list => list.map(task => (task.id === id ? { ...task, done: !task.done } : task))),
    [setTasks]
  );

  const clear = useCallback(() => setTasks([]), [setTasks]);

  const stats = useMemo(() => {
    const done = tasks.filter(task => task.done).length;
    return {
      total: tasks.length,
      done,
      open: tasks.length - done,
      rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0
    };
  }, [tasks]);

  const select = useCallback(
    ({ search = "", filter = "all", sort = "created" }) => {
      const query = search.trim().toLowerCase();

      const filtered = tasks
        .filter(task => {
          if (filter === "active") return !task.done;
          if (filter === "done") return task.done;
          if (filter === "high") return task.priority === "high";
          return true;
        })
        .filter(task => task.title.toLowerCase().includes(query));

      const sorters = {
        created: (a, b) => b.createdAt - a.createdAt,
        priority: (a, b) => RANK[a.priority] - RANK[b.priority],
        title: (a, b) => a.title.localeCompare(b.title)
      };

      return [...filtered].sort(sorters[sort]);
    },
    [tasks]
  );

  return { tasks, add, update, remove, toggle, clear, stats, select };
}
