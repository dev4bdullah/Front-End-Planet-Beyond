/* Task 10 — the four states, done properly.
   loading → success | empty | error, with retry, cancellation and a race guard. */

import { getUsers, getPosts, getBroken, getEmpty } from "./api.js";

const panel = document.getElementById("panel");
const tabs = document.querySelector(".tabs");
const log = document.getElementById("log");

const sources = {
  users: { label: "users", fetcher: getUsers },
  posts: { label: "posts", fetcher: getPosts },
  empty: { label: "posts", fetcher: getEmpty },
  broken: { label: "data", fetcher: getBroken },
  offline: {
    label: "data",
    fetcher: () => fetch("https://no-such-host-9x7q.dev/x").then(r => r.json())
  },
  slow: { label: "users", fetcher: options => getUsers({ ...options, timeout: 1 }) }
};

let current = "users";
let controller = null;
let requestId = 0;

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

function trace(message, cls = "dim") {
  const line = document.createElement("div");
  line.className = cls;
  line.textContent = `> ${message}`;
  log.prepend(line);
  while (log.children.length > 14) log.lastChild.remove();
}

/* ---------- the four states, one function each ---------- */

function showLoading(label) {
  panel.setAttribute("aria-busy", "true");
  panel.innerHTML = `
    <div class="state"><div class="spinner"></div>Loading ${escapeHtml(label)}...</div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>`;
}

function showEmpty(message) {
  panel.setAttribute("aria-busy", "false");
  panel.innerHTML = `
    <div class="state">
      <strong>Nothing came back</strong>${escapeHtml(message)}
    </div>`;
}

function showError(message) {
  panel.setAttribute("aria-busy", "false");
  panel.innerHTML = `
    <div class="err-box">
      <strong>Request failed</strong>
      <p>${escapeHtml(message)}</p>
      <button type="button" id="retryBtn">Try again</button>
    </div>`;

  // Retry is part of the error state, not an afterthought
  panel.querySelector("#retryBtn").addEventListener("click", () => load(current));
}

function showSuccess(rows) {
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
    <p class="count">${rows.length} result${rows.length === 1 ? "" : "s"}</p>`;
}

/* ---------- the loader ---------- */

async function load(key) {
  current = key;
  const { label, fetcher } = sources[key];

  // Cancel whatever is still in flight
  if (controller) {
    controller.abort();
    trace("previous request aborted", "wa");
  }
  controller = new AbortController();

  // Race guard: if two loads overlap, only the newest may write to the DOM
  const id = ++requestId;

  tabs
    .querySelectorAll("button")
    .forEach(btn => btn.classList.toggle("is-active", btn.dataset.source === key));

  showLoading(label);
  trace(`request #${id} started (${key})`);

  const started = performance.now();

  try {
    const data = await fetcher({ signal: controller.signal });

    if (id !== requestId) {
      trace(`request #${id} finished late — result discarded`, "wa");
      return;
    }

    const ms = Math.round(performance.now() - started);

    if (!Array.isArray(data) || data.length === 0) {
      showEmpty(`The API returned no ${label}.`);
      trace(`request #${id} → empty (${ms}ms)`, "wa");
      return;
    }

    showSuccess(data.slice(0, 8));
    trace(`request #${id} → ${data.length} items (${ms}ms)`, "ok");
  } catch (err) {
    // An aborted request is not an error the user should see
    if (err.name === "AbortError") {
      trace(`request #${id} cancelled`, "wa");
      return;
    }

    if (id !== requestId) return;

    showError(err.message || "Could not reach the server.");
    trace(`request #${id} → ${err.name}: ${err.message}`, "er");
  }
}

tabs.addEventListener("click", event => {
  const key = event.target.dataset.source;
  if (key) load(key);
});

document.getElementById("raceBtn").addEventListener("click", () => {
  trace("firing three overlapping requests — watch only the last one land", "wa");
  load("users");
  load("posts");
  load("users");
});

document.getElementById("clearLog").addEventListener("click", () => {
  log.innerHTML = "";
});

load("users");
