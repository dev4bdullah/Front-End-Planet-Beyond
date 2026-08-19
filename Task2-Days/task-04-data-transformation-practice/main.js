/* Task 4 — every array method applied to the same dataset, with the result shown. */

import { tasks, PRIORITY_RANK } from "./data.js";

const out = document.getElementById("out");

function heading(text) {
  const div = document.createElement("div");
  div.className = "wa";
  div.textContent = `\n── ${text} ──`;
  out.appendChild(div);
}

function log(code, result, cls = "") {
  const line = document.createElement("div");
  line.className = "k";
  line.textContent = code;
  out.appendChild(line);

  const value = document.createElement("div");
  value.className = cls || "v";
  value.textContent = `   ${typeof result === "string" ? result : JSON.stringify(result, null, 0)}`;
  out.appendChild(value);
}

const demos = {
  map() {
    heading("map — same length, transformed items");

    log(
      "tasks.map(t => t.title)",
      tasks
        .map(t => t.title)
        .slice(0, 3)
        .concat("...")
    );

    log(
      "tasks.map(t => ({ id, label }))",
      tasks.slice(0, 3).map(({ id, title, priority }) => ({ id, label: `[${priority}] ${title}` }))
    );

    // Deriving a field rather than mutating the original
    log(
      "add a computed field",
      tasks
        .slice(0, 3)
        .map(t => ({ ...t, overdue: t.status !== "done" && t.due < "2026-08-17" }))
        .map(t => `${t.id}:${t.overdue}`)
    );
  },

  filter() {
    heading("filter — fewer items, unchanged shape");

    log(
      "status === 'active'",
      tasks.filter(t => t.status === "active").map(t => t.id)
    );
    log(
      "priority === 'high'",
      tasks.filter(t => t.priority === "high").map(t => t.title)
    );
    log(
      "hours > 3",
      tasks.filter(t => t.hours > 3).map(t => `${t.title} (${t.hours}h)`)
    );

    // Chained filters read better than one long condition
    log(
      "active AND high",
      tasks
        .filter(t => t.status === "active")
        .filter(t => t.priority === "high")
        .map(t => t.id)
    );

    log("has an assignee", tasks.filter(t => t.assignee).length + " of " + tasks.length);
  },

  find() {
    heading("find / findIndex / indexOf");

    log("find(t => t.id === 5)", tasks.find(t => t.id === 5)?.title);
    log(
      "findIndex(t => t.id === 5)",
      tasks.findIndex(t => t.id === 5)
    );
    log("find with no match", String(tasks.find(t => t.id === 999)));
    log(
      "first overdue active",
      tasks.find(t => t.status === "active" && t.due < "2026-08-17")?.title
    );

    log("find returns the item, filter returns an array", "that's the whole difference", "dim");
  },

  someEvery() {
    heading("some / every — booleans, and they short-circuit");

    log(
      "some(t => t.priority === 'high')",
      tasks.some(t => t.priority === "high")
    );
    log(
      "every(t => t.hours > 0)",
      tasks.every(t => t.hours > 0)
    );
    log(
      "every(t => t.status === 'done')",
      tasks.every(t => t.status === "done")
    );
    log(
      "some(t => !t.assignee)",
      tasks.some(t => !t.assignee)
    );
    log(
      "every task has a title",
      tasks.every(t => Boolean(t.title?.trim()))
    );

    log(
      "empty array: every() is true, some() is false",
      [[].every(Boolean), [].some(Boolean)],
      "dim"
    );
  },

  reduce() {
    heading("reduce — collapse a list into one value");

    log(
      "total hours",
      tasks.reduce((sum, t) => sum + t.hours, 0)
    );

    log(
      "count by status",
      tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {})
    );

    log(
      "group by assignee",
      Object.entries(
        tasks.reduce((acc, t) => {
          const key = t.assignee ?? "unassigned";
          (acc[key] ||= []).push(t.id);
          return acc;
        }, {})
      ).map(([k, v]) => `${k}: ${v.join(",")}`)
    );

    log(
      "hours per priority",
      tasks.reduce((acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + t.hours;
        return acc;
      }, {})
    );

    log("unique tags (flat + Set)", [...new Set(tasks.flatMap(t => t.tags))]);

    log(
      "longest task title",
      tasks.reduce((longest, t) => (t.title.length > longest.length ? t.title : longest), "")
    );

    log("always pass the initial value — reduce() on [] without one throws", "", "dim");
  },

  sort() {
    heading("sort — mutates, so copy first");

    log(
      "by priority rank",
      [...tasks]
        .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
        .map(t => `${t.priority[0]}${t.id}`)
    );

    log(
      "by due date",
      [...tasks]
        .sort((a, b) => a.due.localeCompare(b.due))
        .map(t => t.due)
        .slice(0, 4)
    );
    log(
      "by hours, descending",
      [...tasks].sort((a, b) => b.hours - a.hours).map(t => t.hours)
    );
    log(
      "by title A–Z",
      [...tasks].sort((a, b) => a.title.localeCompare(b.title)).map(t => t.title[0])
    );

    log(
      "two keys: priority then due",
      [...tasks]
        .sort(
          (a, b) =>
            PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.due.localeCompare(b.due)
        )
        .map(t => `${t.priority[0]}-${t.due.slice(5)}`)
    );

    log("default sort is alphabetical, so [10,9,1] becomes", [10, 9, 1].sort(), "er");
    log(
      "always pass a comparator for numbers",
      [10, 9, 1].sort((a, b) => a - b),
      "ok"
    );
  },

  chained() {
    heading("chaining — the pattern you'll actually write");

    const report = tasks
      .filter(t => t.status === "active")
      .filter(t => t.assignee)
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
      .map(t => `${t.assignee}: ${t.title} (${t.hours}h)`);

    report.forEach(line => log("", line, "ok"));

    log(
      "workload summary",
      Object.entries(
        tasks
          .filter(t => t.status === "active" && t.assignee)
          .reduce((acc, t) => {
            acc[t.assignee] = (acc[t.assignee] || 0) + t.hours;
            return acc;
          }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .map(([who, hours]) => `${who}: ${hours}h`)
    );
  }
};

document.querySelector(".demos").addEventListener("click", event => {
  const key = event.target.dataset.demo;
  if (!key) return;
  demos[key]();
  out.scrollTop = out.scrollHeight;
});

document.getElementById("allBtn").addEventListener("click", () => {
  out.innerHTML = "";
  Object.values(demos).forEach(fn => fn());
});

document.getElementById("clearBtn").addEventListener("click", () => {
  out.innerHTML = "";
});

// Also render the raw dataset so you can check the results against it
document.getElementById("dataBody").innerHTML = tasks
  .map(
    t => `<tr>
      <td>${t.id}</td>
      <td>${t.title}</td>
      <td>${t.assignee ?? "<span class='muted'>none</span>"}</td>
      <td><span class="badge badge--${t.priority}">${t.priority}</span></td>
      <td>${t.status}</td>
      <td>${t.hours}</td>
      <td>${t.due}</td>
    </tr>`
  )
  .join("");

demos.map();
