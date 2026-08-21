/* Runs every helper and prints the result — this doubles as a test sheet. */

import * as u from "./utils.js";

const out = document.getElementById("out");

function row(call, result) {
  const line = document.createElement("div");
  line.innerHTML = `<span class="k">${call}</span><span class="dim">  →  </span><span class="v">${u.escapeHtml(
    typeof result === "string" ? `"${result}"` : JSON.stringify(result)
  )}</span>`;
  out.appendChild(line);
}

function heading(text) {
  const div = document.createElement("div");
  div.className = "wa";
  div.textContent = `\n── ${text} ──`;
  out.appendChild(div);
}

const sample = {
  id: 1,
  title: "Fix the focus trap in the modal dialog before release",
  assignee: "Abdullah",
  priority: "high",
  dueDate: u.daysFromNow(-2),
  done: false
};

heading("ids");
row("makeId()", u.makeId());
row('makeId("task")', u.makeId("task"));
row('slugify("Fix the Nav — Mobile!")', u.slugify("Fix the Nav — Mobile!"));

heading("dates");
row('formatDate(today, "short")', u.formatDate(u.daysFromNow(0), "short"));
row('formatDate(today, "medium")', u.formatDate(u.daysFromNow(0)));
row('formatDate(today, "long")', u.formatDate(u.daysFromNow(0), "long"));
row('formatDate("not a date")', u.formatDate("not a date"));
row("relativeTime(+3 days)", u.relativeTime(u.daysFromNow(3)));
row("relativeTime(-1 day)", u.relativeTime(u.daysFromNow(-1)));
row("daysFromNow(7)", u.daysFromNow(7));
row("isOverdue(sample)", u.isOverdue(sample));
row("isOverdue({ ...sample, done: true })", u.isOverdue({ ...sample, done: true }));

heading("labels");
row('statusLabel("active")', u.statusLabel("active"));
row('statusLabel("nonsense")', u.statusLabel("nonsense"));
row('titleCase("in_progress-now")', u.titleCase("in_progress-now"));
row("truncate(sample.title, 30)", u.truncate(sample.title, 30));
row('pluralise(1, "task")', u.pluralise(1, "task"));
row('pluralise(4, "task")', u.pluralise(4, "task"));
row('pluralise(2, "person", "people")', u.pluralise(2, "person", "people"));

heading("search");
row('normalise("  Fix   THE  Nav ")', u.normalise("  Fix   THE  Nav "));
row('matchesSearch(sample, "MODAL", ["title"])', u.matchesSearch(sample, "MODAL", ["title"]));
row('matchesSearch(sample, "zzz", ["title"])', u.matchesSearch(sample, "zzz", ["title"]));
row('matchesSearch(sample, "", ["title"])', u.matchesSearch(sample, "", ["title"]));

heading("sorting");
const people = [
  { name: "Sadiq", hours: 8, priority: "medium" },
  { name: "Ayesha", hours: 12, priority: "high" },
  { name: "Attique", hours: 5, priority: "low" }
];
row(
  '[...people].sort(byKey("name"))',
  [...people].sort(u.byKey("name")).map(p => p.name)
);
row(
  'byKey("hours", "desc")',
  [...people].sort(u.byKey("hours", "desc")).map(p => p.hours)
);
row(
  "byPriority",
  [...people].sort(u.byPriority).map(p => p.priority)
);

heading("numbers");
row("clamp(150, 0, 100)", u.clamp(150, 0, 100));
row("clamp(-5, 0, 100)", u.clamp(-5, 0, 100));
row("percent(3, 8)", u.percent(3, 8));
row("percent(3, 0)", u.percent(3, 0));

heading("misc");
row('escapeHtml("<img onerror=alert(1)>")', u.escapeHtml("<img onerror=alert(1)>"));
row(
  "groupBy(people, p => p.priority)",
  Object.fromEntries(
    Object.entries(u.groupBy(people, p => p.priority)).map(([k, v]) => [k, v.map(p => p.name)])
  )
);

// debounce needs the DOM to show anything useful
const debounceOut = document.getElementById("debounceOut");
let raw = 0;
const debounced = u.debounce(value => {
  debounceOut.textContent = `raw keystrokes: ${raw} · debounced calls fired with: "${value}"`;
}, 400);

document.getElementById("debounceInput").addEventListener("input", event => {
  raw += 1;
  debounceOut.textContent = `raw keystrokes: ${raw} · waiting 400ms...`;
  debounced(event.target.value);
});
