// Entry point. This file wires the other five together and holds the state.
// Notice it never touches localStorage, fetch or innerHTML directly — it delegates.

import { makeId } from "./utils.js";
import { validateTitle, validatePriority } from "./validation.js";
import { load, save, clear } from "./storage.js";
import { fetchTodos } from "./api.js";
import { renderTasks, renderTodos, showError } from "./render.js";

const form = document.getElementById("taskForm");
const list = document.getElementById("taskList");
const titleInput = document.getElementById("title");
const priorityInput = document.getElementById("priority");
const titleError = document.getElementById("titleError");
const priorityError = document.getElementById("priorityError");
const todoBox = document.getElementById("todoBox");

let tasks = load();

function refresh() {
  save(tasks);
  renderTasks(list, tasks);
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const titleMsg = validateTitle(titleInput.value);
  const priorityMsg = validatePriority(priorityInput.value);

  titleError.textContent = titleMsg;
  priorityError.textContent = priorityMsg;
  titleInput.classList.toggle("invalid", Boolean(titleMsg));
  priorityInput.classList.toggle("invalid", Boolean(priorityMsg));

  if (titleMsg || priorityMsg) return;

  tasks.push({
    id: makeId(),
    title: titleInput.value.trim(),
    priority: priorityInput.value,
    createdAt: new Date().toISOString()
  });

  form.reset();
  refresh();
});

list.addEventListener("click", event => {
  if (event.target.dataset.action !== "delete") return;
  const id = event.target.closest("li").dataset.id;
  tasks = tasks.filter(task => task.id !== id);
  refresh();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  clear();
  tasks = [];
  refresh();
});

document.getElementById("loadBtn").addEventListener("click", async () => {
  todoBox.innerHTML = `<div class="dim">Loading...</div>`;
  try {
    renderTodos(todoBox, await fetchTodos(5));
  } catch (err) {
    showError(todoBox, err.message);
  }
});

refresh();
