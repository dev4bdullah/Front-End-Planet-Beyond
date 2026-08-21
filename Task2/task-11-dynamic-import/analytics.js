/* This file is NOT loaded when the page opens.
   It only arrives when someone clicks a button that needs it. */

console.log("analytics.js downloaded, parsed and executed");

// Top-level code in a module runs once, on first import
export const loadedAt = new Date().toLocaleTimeString();

export function getStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter(task => task.done).length;

  const byPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  const hours = tasks.reduce((sum, task) => sum + task.hours, 0);

  return {
    total,
    done,
    pending: total - done,
    rate: total ? Math.round((done / total) * 100) : 0,
    hours,
    avgHours: total ? (hours / total).toFixed(1) : 0,
    byPriority
  };
}

export function toCSV(tasks) {
  const header = "Title,Priority,Hours,Done";
  const rows = tasks.map(
    task => `"${task.title.replace(/"/g, '""')}",${task.priority},${task.hours},${task.done}`
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
