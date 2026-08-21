/* Task 13 — the deliverable. Entry point: holds state and wires everything together.
   Notice what it never does: touch localStorage, call fetch, or write innerHTML.
   Each of those belongs to its own module. */

import { makeId, isOverdue, normalise, daysFromNow, debounce, PRIORITY_RANK } from "./utils.js";
import { validateTitle, validatePriority, validateDueDate } from "./validation.js";
import { loadState, saveState, clearState } from "./storage.js";
import { getUsers, getPosts, getBroken } from "./api.js";
import {
  renderStats,
  renderTasks,
  renderCount,
  apiLoading,
  apiEmpty,
  apiError,
  apiSuccess
} from "./render.js";

const state = loadState();
let editingId = null;
let apiSource = "users";
let apiController = null;
let apiRequestId = 0;
let analytics = null; // stays null until the Analytics button is clicked

const $ = id => document.getElementById(id);

const form = $("taskForm");
const list = $("taskList");
const searchBox = $("search");
const sortBox = $("sort");
const submitBtn = $("submitBtn");
const cancelBtn = $("cancelBtn");
const themeBtn = $("themeBtn");
const apiPanel = $("apiPanel");
const statsPanel = $("statsPanel");
const filterWrap = document.querySelector(".filters");
const apiTabs = document.querySelector(".api-tabs");

const fields = [
  { id: "title", err: "titleError", check: validateTitle },
  { id: "priority", err: "priorityError", check: validatePriority },
  { id: "dueDate", err: "dueDateError", check: validateDueDate }
];

/* ---------- state → screen ---------- */

function persist() {
  saveState(state);
  render();
}

function visibleTasks() {
  const query = normalise(state.search);

  const filtered = state.tasks
    .filter(task => {
      if (state.filter === "active") return !task.done;
      if (state.filter === "done") return task.done;
      if (state.filter === "high") return task.priority === "high";
      if (state.filter === "overdue") return isOverdue(task);
      return true;
    })
    .filter(task => normalise(task.title).includes(query));

  const sorters = {
    created: (a, b) => b.createdAt - a.createdAt,
    due: (a, b) => a.dueDate.localeCompare(b.dueDate),
    priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
    title: (a, b) => a.title.localeCompare(b.title)
  };

  return [...filtered].sort(sorters[state.sort]);
}

function render() {
  document.body.classList.toggle("dark", state.theme === "dark");
  themeBtn.textContent = state.theme === "dark" ? "☀️" : "🌙";

  sortBox.value = state.sort;
  if (document.activeElement !== searchBox) searchBox.value = state.search;

  filterWrap
    .querySelectorAll("button")
    .forEach(btn => btn.classList.toggle("is-active", btn.dataset.filter === state.filter));

  renderStats($("stats"), state.tasks);

  const shown = visibleTasks();
  renderTasks(list, shown, state.tasks.length, editingId);
  renderCount($("count"), shown.length, state.tasks.length);
}

/* ---------- form (task 8) ---------- */

function showError(field, message) {
  const input = $(field.id);
  $(field.err).textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateField(field) {
  const message = field.check($(field.id).value);
  showError(field, message);
  return message === "";
}

function resetForm() {
  form.reset();
  fields.forEach(field => showError(field, ""));
  editingId = null;
  submitBtn.textContent = "Add task";
  cancelBtn.hidden = true;
}

fields.forEach(field => $(field.id).addEventListener("input", () => validateField(field)));

form.addEventListener("submit", event => {
  event.preventDefault();

  const results = fields.map(validateField);
  if (results.includes(false)) {
    $(fields[results.indexOf(false)].id).focus();
    return;
  }

  const data = {
    title: $("title").value.trim(),
    priority: $("priority").value,
    dueDate: $("dueDate").value
  };

  if (editingId) {
    Object.assign(
      state.tasks.find(task => task.id === editingId),
      data
    );
  } else {
    state.tasks.push({ id: makeId(), ...data, done: false, createdAt: Date.now() });
  }

  resetForm();
  persist();
  $("title").focus();
});

cancelBtn.addEventListener("click", () => {
  resetForm();
  render();
});

/* ---------- one delegated listener for the whole list (task 7) ---------- */

list.addEventListener("click", event => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;

  const id = trigger.closest("li").dataset.id;
  const task = state.tasks.find(item => item.id === id);
  if (!task) return;

  switch (trigger.dataset.action) {
    case "toggle":
      task.done = trigger.checked;
      break;

    case "delete":
      state.tasks = state.tasks.filter(item => item.id !== id);
      if (editingId === id) resetForm();
      break;

    case "edit":
      editingId = id;
      $("title").value = task.title;
      $("priority").value = task.priority;
      $("dueDate").value = task.dueDate;
      submitBtn.textContent = "Save changes";
      cancelBtn.hidden = false;
      fields.forEach(field => showError(field, ""));
      $("title").focus();
      break;

    default:
      return;
  }

  persist();
});

/* ---------- toolbar ---------- */

// Debounced so a fast typist doesn't trigger a write per keystroke (task 5)
const commitSearch = debounce(value => {
  state.search = value;
  persist();
}, 250);

searchBox.addEventListener("input", event => commitSearch(event.target.value));

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

/* ---------- API panel (task 10) ---------- */

const apiSources = {
  users: { label: "users", fetcher: getUsers },
  posts: { label: "posts", fetcher: getPosts },
  broken: { label: "data", fetcher: getBroken }
};

async function loadApi() {
  const { label, fetcher } = apiSources[apiSource];

  apiController?.abort();
  apiController = new AbortController();
  const id = ++apiRequestId;

  apiTabs
    .querySelectorAll("button")
    .forEach(btn => btn.classList.toggle("is-active", btn.dataset.source === apiSource));

  apiLoading(apiPanel, label);

  try {
    const data = await fetcher({ signal: apiController.signal });
    if (id !== apiRequestId) return; // a newer request already won

    if (!Array.isArray(data) || !data.length) {
      apiEmpty(apiPanel, `The API returned no ${label}.`);
      return;
    }

    apiSuccess(apiPanel, data.slice(0, 6));
  } catch (err) {
    if (err.name === "AbortError" || id !== apiRequestId) return;
    apiError(apiPanel, err.message || "Could not reach the server.", loadApi);
  }
}

apiTabs.addEventListener("click", event => {
  const source = event.target.dataset.source;
  if (!source) return;
  apiSource = source;
  loadApi();
});

/* ---------- lazy analytics (task 11) ---------- */

async function getAnalytics() {
  analytics ??= await import("./analytics.js");
  return analytics;
}

$("statsBtn").addEventListener("click", async event => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const module = await getAnalytics();
    statsPanel.hidden = false;
    module.renderStats(statsPanel, module.getStats(state.tasks));
  } catch (err) {
    statsPanel.hidden = false;
    statsPanel.textContent = `Could not load analytics: ${err.message}`;
  } finally {
    button.disabled = false;
  }
});

$("exportBtn").addEventListener("click", async event => {
  if (!state.tasks.length) {
    alert("Add a task first.");
    return;
  }
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const { toCSV, downloadCSV } = await getAnalytics();
    downloadCSV(toCSV(state.tasks));
  } finally {
    button.disabled = false;
  }
});

/* ---------- data buttons ---------- */

$("seedBtn").addEventListener("click", () => {
  [
    ["Finish the responsive layout", "high", 1],
    ["Write the validation module", "medium", 3],
    ["Push Day 2 to GitHub", "high", -1],
    ["Review the DevTools notes", "low", 7],
    ["Refactor the render function", "medium", -3]
  ].forEach(([title, priority, offset], index) => {
    state.tasks.push({
      id: makeId(),
      title,
      priority,
      dueDate: daysFromNow(offset),
      done: index === 1,
      createdAt: Date.now() - index * 1000
    });
  });
  persist();
});

$("clearBtn").addEventListener("click", () => {
  if (!confirm("Delete every task and reset all settings?")) return;
  clearState();
  location.reload();
});

/* ---------- go ---------- */

render();
loadApi();
