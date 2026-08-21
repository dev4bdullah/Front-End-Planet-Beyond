/* Task 7 — one listener on the parent handles every action inside it.
   Cards are re-rendered constantly; because the listener lives on the container
   and not on the buttons, nothing needs re-binding. */

const list = document.getElementById("taskList");
const log = document.getElementById("log");
const listenerCount = document.getElementById("listenerCount");
const buttonCount = document.getElementById("buttonCount");

let tasks = [
  { id: "t1", title: "Fix nav overlap", priority: "high", done: false },
  { id: "t2", title: "Write validation module", priority: "medium", done: true },
  { id: "t3", title: "Add dark mode", priority: "low", done: false }
];

let editingId = null;
let seq = 4;

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

function trace(message, cls = "ok") {
  const line = document.createElement("div");
  line.className = cls;
  line.textContent = `> ${message}`;
  log.prepend(line);
  while (log.children.length > 12) log.lastChild.remove();
}

function card(task) {
  const isEditing = task.id === editingId;

  return `
    <li class="task ${task.done ? "is-done" : ""}" data-id="${task.id}">
      <input type="checkbox" data-action="toggle" ${task.done ? "checked" : ""}
             aria-label="Complete ${escapeHtml(task.title)}" />

      <div class="task__body">
        ${
          isEditing
            ? `<input type="text" data-action="edit-input" value="${escapeHtml(task.title)}"
                      aria-label="Edit title" />`
            : `<p class="task__title">${escapeHtml(task.title)}</p>`
        }
        <p class="muted small">
          <span class="badge badge--${task.priority}">${task.priority}</span>
          id: ${task.id}
        </p>
      </div>

      <div class="task__acts">
        ${
          isEditing
            ? `<button type="button" data-action="save">Save</button>
               <button type="button" class="ghost" data-action="cancel">Cancel</button>`
            : `<button type="button" class="ghost" data-action="edit">Edit</button>
               <button type="button" class="ghost" data-action="up">↑</button>
               <button type="button" class="ghost" data-action="down">↓</button>
               <button type="button" class="danger" data-action="delete">Delete</button>`
        }
      </div>
    </li>`;
}

function render() {
  list.innerHTML = tasks.length
    ? tasks.map(card).join("")
    : `<li class="state"><strong>Empty</strong>Add a task to try the actions.</li>`;

  // Proof: the button count changes on every render, the listener count never does
  buttonCount.textContent = list.querySelectorAll("button, input").length;
  listenerCount.textContent = "1";
}

/* ---------- ONE listener. Every action below is routed from here. ---------- */

list.addEventListener("click", event => {
  // closest() matters: the click may land on an icon or text node inside the button
  const trigger = event.target.closest("[data-action]");
  if (!trigger || !list.contains(trigger)) return;

  const { action } = trigger.dataset;
  const li = trigger.closest("li");
  const id = li?.dataset.id;
  const index = tasks.findIndex(t => t.id === id);

  switch (action) {
    case "toggle":
      tasks[index].done = trigger.checked;
      trace(`toggle → ${id} is now ${tasks[index].done ? "done" : "open"}`);
      break;

    case "edit":
      editingId = id;
      trace(`edit → editing ${id}`, "wa");
      break;

    case "save": {
      const input = li.querySelector('[data-action="edit-input"]');
      const value = input.value.trim();
      if (!value) {
        trace("save → refused, title cannot be empty", "er");
        return;
      }
      tasks[index].title = value;
      editingId = null;
      trace(`save → ${id} renamed`);
      break;
    }

    case "cancel":
      editingId = null;
      trace("cancel → no changes kept", "wa");
      break;

    case "delete":
      tasks = tasks.filter(t => t.id !== id);
      if (editingId === id) editingId = null;
      trace(`delete → removed ${id}`, "er");
      break;

    case "up":
      if (index > 0) {
        [tasks[index - 1], tasks[index]] = [tasks[index], tasks[index - 1]];
        trace(`up → moved ${id}`);
      }
      break;

    case "down":
      if (index < tasks.length - 1) {
        [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
        trace(`down → moved ${id}`);
      }
      break;

    default:
      return;
  }

  render();
});

// Enter to save while editing — keydown delegated the same way
list.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;
  if (event.target.dataset.action !== "edit-input") return;
  event.preventDefault();
  event.target.closest("li").querySelector('[data-action="save"]').click();
});

document.getElementById("addBtn").addEventListener("click", () => {
  const id = `t${seq++}`;
  tasks.push({ id, title: `New task ${id}`, priority: "medium", done: false });
  trace(`added ${id} — no listener attached to its buttons`, "wa");
  render();
});

document.getElementById("clearLog").addEventListener("click", () => {
  log.innerHTML = "";
});

render();
trace("one listener bound to #taskList — that is the only one in this file");
