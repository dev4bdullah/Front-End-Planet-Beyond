// The only file that touches the DOM. Everything here takes data in and puts markup out.

import { escapeHtml, formatDate } from "./utils.js";

export function renderTasks(list, tasks) {
  if (!tasks.length) {
    list.innerHTML = `<li class="state"><strong>No tasks yet</strong>Add one above.</li>`;
    return;
  }

  list.innerHTML = tasks
    .map(
      task => `
      <li data-id="${task.id}">
        <div class="row">
          <span class="badge badge--${task.priority}">${task.priority}</span>
          <strong>${escapeHtml(task.title)}</strong>
          <button type="button" class="ghost" data-action="delete" style="margin-left:auto">
            Delete
          </button>
        </div>
        <p class="muted small">added ${formatDate(task.createdAt)}</p>
      </li>`
    )
    .join("");
}

export function renderTodos(box, todos) {
  box.innerHTML = todos
    .map(todo => `<div>${todo.completed ? "✔" : "○"} ${escapeHtml(todo.title)}</div>`)
    .join("");
}

export function showError(box, message) {
  box.innerHTML = `<div class="er">${escapeHtml(message)}</div>`;
}
