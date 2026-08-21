/* Task 8 — validation that runs on blur, clears as you fix, and blocks submit.
   Every message is linked to its input with aria-describedby, so a screen reader
   announces it as part of the field. */

import {
  validateTitle,
  validatePriority,
  validateDueDate,
  validateHours,
  validateEmail
} from "./validation.js";

const form = document.getElementById("taskForm");
const list = document.getElementById("taskList");
const summary = document.getElementById("summary");
const status = document.getElementById("status");

const fields = [
  { id: "title", check: validateTitle },
  { id: "priority", check: validatePriority },
  { id: "dueDate", check: validateDueDate },
  { id: "hours", check: validateHours },
  { id: "email", check: validateEmail }
];

// A field is only validated live once the user has finished with it the first time.
// Validating from the first keystroke means "T" is instantly an error, which reads as hostile.
const touched = new Set();

let tasks = [];

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

function setError(field, message) {
  const input = document.getElementById(field.id);
  const box = document.getElementById(`${field.id}Error`);

  box.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validate(field, { force = false } = {}) {
  const message = field.check(document.getElementById(field.id).value);
  if (force || touched.has(field.id)) setError(field, message);
  return message === "";
}

function updateSummary(messages) {
  if (!messages.length) {
    summary.hidden = true;
    summary.innerHTML = "";
    return;
  }

  summary.hidden = false;
  summary.innerHTML = `
    <strong>${messages.length} field${messages.length > 1 ? "s need" : " needs"} attention</strong>
    <ul>${messages.map(m => `<li><a href="#${m.id}">${escapeHtml(m.text)}</a></li>`).join("")}</ul>`;
}

function renderTasks() {
  list.innerHTML = tasks.length
    ? tasks
        .map(
          task => `
        <li>
          <div class="row">
            <span class="badge badge--${task.priority}">${task.priority}</span>
            <strong>${escapeHtml(task.title)}</strong>
          </div>
          <p class="muted small">
            due ${task.dueDate} · ${task.hours}h${task.email ? ` · notify ${escapeHtml(task.email)}` : ""}
          </p>
        </li>`
        )
        .join("")
    : `<li class="state"><strong>No tasks yet</strong>Submit the form to add one.</li>`;
}

/* ---------- wiring ---------- */

fields.forEach(field => {
  const input = document.getElementById(field.id);

  // Mark as touched on blur, then validate from that point on
  input.addEventListener("blur", () => {
    touched.add(field.id);
    validate(field);
  });

  // Once touched, clear the error the moment it becomes valid
  input.addEventListener("input", () => {
    if (touched.has(field.id)) validate(field);
  });
});

form.addEventListener("submit", event => {
  event.preventDefault();

  // On submit everything is treated as touched
  fields.forEach(field => touched.add(field.id));

  const results = fields.map(field => ({
    id: field.id,
    ok: validate(field, { force: true }),
    text: field.check(document.getElementById(field.id).value)
  }));

  const failed = results.filter(result => !result.ok);
  updateSummary(failed);

  if (failed.length) {
    // Move focus to the first broken field — otherwise a keyboard user has to hunt
    document.getElementById(failed[0].id).focus();
    status.textContent = `Not submitted — ${failed.length} field(s) invalid.`;
    status.className = "small er";
    return;
  }

  tasks.unshift({
    title: document.getElementById("title").value.trim(),
    priority: document.getElementById("priority").value,
    dueDate: document.getElementById("dueDate").value,
    hours: Number(document.getElementById("hours").value),
    email: document.getElementById("email").value.trim()
  });

  form.reset();
  touched.clear();
  fields.forEach(field => setError(field, ""));
  updateSummary([]);

  status.textContent = "Task added.";
  status.className = "small ok-text";
  renderTasks();
});

document.getElementById("fillBtn").addEventListener("click", () => {
  const soon = new Date();
  soon.setDate(soon.getDate() + 5);

  document.getElementById("title").value = "Ship the validation module";
  document.getElementById("priority").value = "high";
  document.getElementById("dueDate").value = soon.toISOString().slice(0, 10);
  document.getElementById("hours").value = "4";
  document.getElementById("email").value = "team@example.com";

  fields.forEach(field => setError(field, ""));
  touched.clear();
  updateSummary([]);
  status.textContent = "Filled with valid values — now press Add task.";
  status.className = "small muted";
});

document.getElementById("breakBtn").addEventListener("click", () => {
  const past = new Date();
  past.setDate(past.getDate() - 10);

  document.getElementById("title").value = "ab";
  document.getElementById("priority").value = "";
  document.getElementById("dueDate").value = past.toISOString().slice(0, 10);
  document.getElementById("hours").value = "-2";
  document.getElementById("email").value = "not an email";

  status.textContent = "Filled with invalid values — press Add task to see every message.";
  status.className = "small muted";
});

renderTasks();
