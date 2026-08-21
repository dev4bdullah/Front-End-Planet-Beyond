/* Task 6 — the data is the source of truth. The DOM is just a picture of it.
   Change the array, call render(), done. No manual DOM patching anywhere. */

const list = document.getElementById("taskList");
const statsBox = document.getElementById("stats");
const countBox = document.getElementById("count");
const renderCount = document.getElementById("renderCount");

let renders = 0;

const priorities = ["high", "medium", "low"];
const titles = [
  "Fix nav overlap on mobile",
  "Write the validation module",
  "Add dark mode toggle",
  "Build API error states",
  "Refactor the render function",
  "Cache API responses",
  "Fix focus trap in modal",
  "Update the README"
];

// ---------- the single source of truth ----------
let tasks = [
  { id: "t1", title: "Fix nav overlap on mobile", priority: "high", done: true, hours: 2 },
  { id: "t2", title: "Write the validation module", priority: "medium", done: false, hours: 3 },
  { id: "t3", title: "Add dark mode toggle", priority: "low", done: false, hours: 4 }
];

let view = "all";

// ---------- helpers ----------

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

function makeId() {
  return "t" + Math.random().toString(36).slice(2, 8);
}

function visible() {
  if (view === "active") return tasks.filter(t => !t.done);
  if (view === "done") return tasks.filter(t => t.done);
  return tasks;
}

// ---------- one card, built from one task ----------
// Returning a string keeps this a pure function of its input.

function taskCard(task) {
  return `
    <li class="task ${task.done ? "is-done" : ""}" data-id="${task.id}">
      <input type="checkbox" data-action="toggle" ${task.done ? "checked" : ""}
             aria-label="Mark ${escapeHtml(task.title)} complete" />
      <div class="task__body">
        <p class="task__title">${escapeHtml(task.title)}</p>
        <p class="muted small">
          <span class="badge badge--${task.priority}">${task.priority}</span>
          ${task.hours}h estimated
        </p>
      </div>
      <button type="button" class="ghost" data-action="delete">Delete</button>
    </li>`;
}

// ---------- the only function that writes to the DOM ----------

function render() {
  renders += 1;
  renderCount.textContent = renders;

  const rows = visible();

  // The empty state is part of render, not a special case handled elsewhere
  list.innerHTML = rows.length
    ? rows.map(taskCard).join("")
    : `<li class="state"><strong>Nothing to show</strong>${
        tasks.length ? "No tasks match this filter." : "Add your first task above."
      }</li>`;

  const done = tasks.filter(t => t.done).length;
  const hours = tasks.reduce((sum, t) => sum + t.hours, 0);

  statsBox.innerHTML = `
    <div class="stat"><b>${tasks.length}</b><span>Total</span></div>
    <div class="stat"><b>${done}</b><span>Done</span></div>
    <div class="stat"><b>${tasks.length - done}</b><span>Open</span></div>
    <div class="stat"><b>${hours}h</b><span>Estimated</span></div>`;

  countBox.textContent = tasks.length ? `Showing ${rows.length} of ${tasks.length}` : "";

  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.filter === view);
  });
}

// ---------- actions: every one mutates data, then calls render ----------

document.getElementById("addBtn").addEventListener("click", () => {
  tasks.push({
    id: makeId(),
    title: titles[Math.floor(Math.random() * titles.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    done: false,
    hours: 1 + Math.floor(Math.random() * 6)
  });
  render();
});

document.getElementById("sortBtn").addEventListener("click", () => {
  const rank = { high: 0, medium: 1, low: 2 };
  tasks = [...tasks].sort((a, b) => rank[a.priority] - rank[b.priority]);
  render();
});

document.getElementById("completeBtn").addEventListener("click", () => {
  tasks = tasks.map(t => ({ ...t, done: true }));
  render();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  tasks = [];
  render();
});

// One listener for the whole list — that's task 7's subject, previewed here
list.addEventListener("click", event => {
  const action = event.target.dataset.action;
  if (!action) return;

  const id = event.target.closest("li").dataset.id;

  if (action === "toggle") {
    tasks = tasks.map(t => (t.id === id ? { ...t, done: event.target.checked } : t));
  }

  if (action === "delete") {
    tasks = tasks.filter(t => t.id !== id);
  }

  render();
});

document.querySelector(".filters").addEventListener("click", event => {
  if (!event.target.dataset.filter) return;
  view = event.target.dataset.filter;
  render();
});

render();
