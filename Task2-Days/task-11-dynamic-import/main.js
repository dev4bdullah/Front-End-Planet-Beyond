/* Task 11 — import() returns a promise, so the module downloads on demand.
   The whole point is what the Network tab shows: analytics.js is absent until you click. */

const tasks = [
  { title: "Install and configure tools", priority: "high", done: true, hours: 1 },
  { title: "Semantic markup", priority: "medium", done: true, hours: 2 },
  { title: "Responsive layout", priority: "high", done: false, hours: 4 },
  { title: "Form validation", priority: "low", done: true, hours: 3 },
  { title: "LocalStorage persistence", priority: "medium", done: false, hours: 2 },
  { title: "Async API states", priority: "high", done: false, hours: 5 }
];

const list = document.getElementById("taskList");
const output = document.getElementById("output");
const log = document.getElementById("log");
const statsBtn = document.getElementById("statsBtn");
const chartBtn = document.getElementById("chartBtn");
const exportBtn = document.getElementById("exportBtn");

// Cached module references — null until the first click
let analytics = null;
let charts = null;

function trace(message, cls = "dim") {
  const line = document.createElement("div");
  line.className = cls;
  line.textContent = `> ${message}`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

list.innerHTML = tasks
  .map(
    task => `<li>
      ${task.done ? "✔" : "○"} ${task.title}
      <span class="badge badge--${task.priority}">${task.priority}</span>
    </li>`
  )
  .join("");

/* ---------- the lazy loaders ---------- */

async function getAnalytics() {
  if (analytics) {
    trace("analytics already in memory — no second download", "wa");
    return analytics;
  }

  trace("requesting ./analytics.js ...");
  const started = performance.now();

  // This line is the task. import() is a function that returns a promise.
  analytics = await import("./analytics.js");

  trace(`analytics.js loaded in ${Math.round(performance.now() - started)}ms`, "ok");
  trace(`module evaluated at ${analytics.loadedAt}`, "dim");
  return analytics;
}

async function getCharts() {
  if (charts) return charts;
  trace("requesting ./charts.js ...");
  charts = await import("./charts.js");
  trace("charts.js loaded", "ok");
  return charts;
}

async function withLoading(button, work) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Loading...";
  try {
    await work();
  } catch (err) {
    trace(`failed: ${err.message}`, "er");
    output.textContent = `Could not load the module: ${err.message}`;
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

/* ---------- buttons ---------- */

statsBtn.addEventListener("click", () =>
  withLoading(statsBtn, async () => {
    const { getStats } = await getAnalytics();
    const s = getStats(tasks);

    output.classList.add("loaded");
    output.innerHTML = `
      <div class="stat-row"><span>Total tasks</span><b>${s.total}</b></div>
      <div class="stat-row"><span>Completed</span><b>${s.done}</b></div>
      <div class="stat-row"><span>Pending</span><b>${s.pending}</b></div>
      <div class="stat-row"><span>Completion rate</span><b>${s.rate}%</b></div>
      <div class="stat-row"><span>Total hours</span><b>${s.hours}h</b></div>
      <div class="stat-row"><span>Average per task</span><b>${s.avgHours}h</b></div>`;
  })
);

chartBtn.addEventListener("click", () =>
  withLoading(chartBtn, async () => {
    // Two modules, loaded independently — analytics may already be cached
    const [{ getStats }, { barChart }] = await Promise.all([getAnalytics(), getCharts()]);

    const entries = Object.entries(getStats(tasks).byPriority);
    const max = Math.max(...entries.map(([, value]) => value));

    output.classList.add("loaded");
    output.innerHTML = barChart(entries, max);
  })
);

exportBtn.addEventListener("click", () =>
  withLoading(exportBtn, async () => {
    const { toCSV, downloadCSV } = await getAnalytics();
    downloadCSV(toCSV(tasks));
    trace("CSV downloaded", "ok");
  })
);

trace("page loaded — analytics.js and charts.js have NOT been downloaded", "wa");
trace("open DevTools → Network, then click a button", "dim");
