/* Task 11 — loaded with import() only when the Analytics button is clicked.
   Watch the Network tab: this file is absent on first paint. */

console.log("analytics.js loaded on demand");

export function getStats(tasks) {
  const done = tasks.filter(task => task.done).length;

  const byPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  return {
    total: tasks.length,
    done,
    pending: tasks.length - done,
    rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    byPriority
  };
}

export function renderStats(box, stats) {
  const entries = Object.entries(stats.byPriority);
  const max = Math.max(1, ...entries.map(([, count]) => count));

  box.innerHTML = `
    <div class="stat-row"><span>Total</span><b>${stats.total}</b></div>
    <div class="stat-row"><span>Completed</span><b>${stats.done}</b></div>
    <div class="stat-row"><span>Pending</span><b>${stats.pending}</b></div>
    <div class="stat-row"><span>Completion rate</span><b>${stats.rate}%</b></div>
    <ul class="bars">
      ${entries
        .map(
          ([label, count]) => `
        <li>
          <span class="bars__label">${label}</span>
          <span class="bars__track"><span class="bars__fill" style="width:${(count / max) * 100}%"></span></span>
          <span class="bars__value">${count}</span>
        </li>`
        )
        .join("")}
    </ul>`;
}

export function toCSV(tasks) {
  const header = "Title,Priority,Due date,Done";
  const rows = tasks.map(
    task => `"${task.title.replace(/"/g, '""')}",${task.priority},${task.dueDate},${task.done}`
  );
  return [header, ...rows].join("\n");
}

export function downloadCSV(csv, filename = "tasks.csv") {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
