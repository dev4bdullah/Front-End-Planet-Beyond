/* Task 9 — tasks, filter, search, sort and theme all persisted as ONE object.
   Every mutation goes through persist(), so there is no path that changes state
   without saving it. */

import { loadState, saveState, clearState, rawState, storageSize, isAvailable } from "./storage.js";

const state = loadState();

const list = document.getElementById("taskList");
const searchBox = document.getElementById("search");
const sortBox = document.getElementById("sort");
const filterWrap = document.querySelector(".filters");
const themeBtn = document.getElementById("themeBtn");
const rawBox = document.getElementById("raw");
const sizeBox = document.getElementById("size");
const saveStatus = document.getElementById("saveStatus");
const countBox = document.getElementById("count");

const RANK = { high: 0, medium: 1, low: 2 };

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

/* ---------- the one write path ---------- */

function persist() {
  const result = saveState(state);

  saveStatus.textContent = result.ok
    ? `Saved at ${new Date().toLocaleTimeString()}`
    : result.message;
  saveStatus.className = result.ok ? "small ok-text" : "small er";

  render();
}

function visible() {
  const query = state.search.trim().toLowerCase();

  const filtered = state.tasks
    .filter(task => {
      if (state.filter === "active") return !task.done;
      if (state.filter === "done") return task.done;
      if (state.filter === "high") return task.priority === "high";
      return true;
    })
    .filter(task => task.title.toLowerCase().includes(query));

  const sorters = {
    created: (a, b) => b.createdAt - a.createdAt,
    priority: (a, b) => RANK[a.priority] - RANK[b.priority],
    title: (a, b) => a.title.localeCompare(b.title)
  };

  return [...filtered].sort(sorters[state.sort]);
}

function render() {
  document.body.classList.toggle("dark", state.theme === "dark");
  themeBtn.textContent = state.theme === "dark" ? "☀️ Light" : "🌙 Dark";

  searchBox.value = state.search;
  sortBox.value = state.sort;

  filterWrap
    .querySelectorAll("button")
    .forEach(btn => btn.classList.toggle("is-active", btn.dataset.filter === state.filter));

  const rows = visible();

  list.innerHTML = rows.length
    ? rows
        .map(
          task => `
        <li class="task ${task.done ? "is-done" : ""}" data-id="${task.id}">
          <input type="checkbox" data-action="toggle" ${task.done ? "checked" : ""}
                 aria-label="Complete ${escapeHtml(task.title)}" />
          <div class="task__body">
            <p class="task__title">${escapeHtml(task.title)}</p>
            <p class="muted small">
              <span class="badge badge--${task.priority}">${task.priority}</span>
            </p>
          </div>
          <button type="button" class="danger" data-action="delete">Delete</button>
        </li>`
        )
        .join("")
    : `<li class="state"><strong>${
        state.tasks.length ? "Nothing matches" : "No tasks yet"
      }</strong>${
        state.tasks.length ? "Try clearing the search or filter." : "Add one above."
      }</li>`;

  countBox.textContent = state.tasks.length
    ? `Showing ${rows.length} of ${state.tasks.length}`
    : "";

  // Show exactly what sits in localStorage right now
  const raw = rawState();
  rawBox.textContent = raw ? JSON.stringify(JSON.parse(raw), null, 2) : "(nothing stored)";
  sizeBox.textContent = `${storageSize()} bytes`;
}

/* ---------- events: each one changes state, then persists ---------- */

document.getElementById("taskForm").addEventListener("submit", event => {
  event.preventDefault();

  const input = document.getElementById("title");
  const title = input.value.trim();
  if (!title) return;

  state.tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    title,
    priority: document.getElementById("priority").value || "medium",
    done: false,
    createdAt: Date.now()
  });

  event.target.reset();
  persist();
  input.focus();
});

list.addEventListener("click", event => {
  const action = event.target.dataset.action;
  if (!action) return;

  const id = event.target.closest("li").dataset.id;

  if (action === "toggle") {
    state.tasks.find(task => task.id === id).done = event.target.checked;
  }

  if (action === "delete") {
    state.tasks = state.tasks.filter(task => task.id !== id);
  }

  persist();
});

searchBox.addEventListener("input", event => {
  state.search = event.target.value;
  persist();
});

sortBox.addEventListener("change", event => {
  state.sort = event.target.value;
  persist();
});

filterWrap.addEventListener("click", event => {
  if (!event.target.dataset.filter) return;
  state.filter = event.target.dataset.filter;
  persist();
});

themeBtn.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  persist();
});

document.getElementById("seedBtn").addEventListener("click", () => {
  [
    ["Fix nav overlap on mobile", "high"],
    ["Write the validation module", "medium"],
    ["Add dark mode toggle", "low"],
    ["Build API error states", "high"]
  ].forEach(([title, priority], i) => {
    state.tasks.push({
      id: `seed${i}${Date.now().toString(36)}`,
      title,
      priority,
      done: i === 1,
      createdAt: Date.now() - i * 1000
    });
  });
  persist();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (!confirm("Delete all tasks and reset every setting?")) return;
  clearState();
  location.reload();
});

document.getElementById("corruptBtn").addEventListener("click", () => {
  localStorage.setItem("day2.task09.state", "{ this is not valid json");
  alert("Storage deliberately corrupted. Refresh the page — it recovers instead of crashing.");
});

// Two tabs open? Keep them in sync. The storage event only fires in OTHER tabs.
window.addEventListener("storage", event => {
  if (event.key !== "day2.task09.state") return;
  saveStatus.textContent = "Updated from another tab — refresh to load it.";
  saveStatus.className = "small wa-text";
});

if (!isAvailable()) {
  saveStatus.textContent = "localStorage is unavailable — changes will not survive a refresh.";
  saveStatus.className = "small er";
}

render();
