/* Task 6 — the only file that touches the DOM. Data in, markup out. */

import { escapeHtml, formatDate, isOverdue, pluralise } from "./utils.js";

export function renderStats(box, tasks) {
  const done = tasks.filter(task => task.done).length;
  const overdue = tasks.filter(isOverdue).length;
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  box.innerHTML = `
    <div class="stat"><b>${tasks.length}</b><span>Total</span></div>
    <div class="stat"><b>${done}</b><span>Done</span></div>
    <div class="stat"><b>${tasks.length - done}</b><span>Open</span></div>
    <div class="stat ${overdue ? "stat--bad" : ""}">
      <b>${overdue || `${rate}%`}</b><span>${overdue ? "Overdue" : "Complete"}</span>
    </div>`;
}

export function renderTasks(list, shown, totalCount, editingId) {
  if (!shown.length) {
    list.innerHTML = `
      <li class="state">
        <strong>${totalCount ? "Nothing matches" : "No tasks yet"}</strong>
        ${totalCount ? "Try clearing the search or filter." : "Add your first one above."}
      </li>`;
    return;
  }

  list.innerHTML = shown
    .map(task => {
      const late = isOverdue(task);
      const editing = task.id === editingId;

      return `
      <li class="task p-${task.priority} ${task.done ? "is-done" : ""} ${editing ? "is-editing" : ""}"
          data-id="${task.id}">
        <input type="checkbox" data-action="toggle" ${task.done ? "checked" : ""}
               aria-label="Complete ${escapeHtml(task.title)}" />

        <div class="task__body">
          <p class="task__title">${escapeHtml(task.title)}</p>
          <p class="task__meta">
            <span class="badge badge--${task.priority}">${task.priority}</span>
            <span class="${late ? "overdue" : "muted"}">due ${formatDate(task.dueDate)}</span>
          </p>
        </div>

        <div class="task__acts">
          <button type="button" class="ghost" data-action="edit">${editing ? "Editing" : "Edit"}</button>
          <button type="button" class="danger" data-action="delete">Delete</button>
        </div>
      </li>`;
    })
    .join("");
}

export function renderCount(box, shownCount, totalCount) {
  box.textContent = totalCount ? `Showing ${shownCount} of ${pluralise(totalCount, "task")}` : "";
}

/* ---------- the four API states (task 10) ---------- */

export function apiLoading(panel, label) {
  panel.setAttribute("aria-busy", "true");
  panel.innerHTML = `
    <div class="state"><div class="spinner"></div>Loading ${escapeHtml(label)}...</div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>`;
}

export function apiEmpty(panel, message) {
  panel.setAttribute("aria-busy", "false");
  panel.innerHTML = `<div class="state"><strong>Nothing came back</strong>${escapeHtml(message)}</div>`;
}

export function apiError(panel, message, onRetry) {
  panel.setAttribute("aria-busy", "false");
  panel.innerHTML = `
    <div class="err-box">
      <strong>Request failed</strong>
      <p>${escapeHtml(message)}</p>
      <button type="button" id="retryBtn">Try again</button>
    </div>`;
  panel.querySelector("#retryBtn").addEventListener("click", onRetry);
}

export function apiSuccess(panel, rows) {
  panel.setAttribute("aria-busy", "false");
  panel.innerHTML = `
    <ul class="plain">
      ${rows
        .map(
          row => `<li>
            <strong>${escapeHtml(row.name ?? row.title)}</strong>
            <p class="muted small">${escapeHtml(row.email ?? row.body)}</p>
          </li>`
        )
        .join("")}
    </ul>
    <p class="count">${rows.length} shown</p>`;
}
