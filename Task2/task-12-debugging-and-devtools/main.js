/* Task 12 — a sandbox for the three DevTools panels the sheet names:
   Console, Sources (breakpoints) and Network. Several buttons break on purpose. */

const out = document.getElementById("out");
const userList = document.getElementById("userList");

function print(message, cls = "") {
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = message;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

const team = [
  { id: 1, name: "Ayesha", role: "Frontend", tasks: 12, hours: 34 },
  { id: 2, name: "Sadiq", role: "Backend", tasks: 8, hours: 22 },
  { id: 3, name: "Abdullah", role: "Frontend", tasks: 15, hours: 41 },
  { id: 4, name: "Attique", role: "QA", tasks: 5, hours: 12 }
];

const actions = {
  /* ---------- Console ---------- */

  levels() {
    console.log("log — general output");
    console.info("info — same as log in most browsers");
    console.warn("warn — yellow, and shows in the Warnings filter");
    console.error("error — red, and carries a stack trace");
    console.debug("debug — hidden unless Verbose is enabled");
    print("Five levels sent. Use the level dropdown in Console to filter.", "ok");
    print("Note: debug only appears when Verbose is ticked.", "dim");
  },

  table() {
    console.table(team);
    console.table(team, ["name", "tasks"]);
    print("Two tables sent — the second one only shows chosen columns.", "ok");
  },

  group() {
    console.group("Team report");
    team.forEach(person => {
      console.groupCollapsed(`${person.name} (${person.role})`);
      console.log("tasks:", person.tasks);
      console.log("hours:", person.hours);
      console.log("avg per task:", (person.hours / person.tasks).toFixed(1));
      console.groupEnd();
    });
    console.groupEnd();
    print("Nested groups sent — expand them in Console.", "ok");
  },

  timing() {
    console.time("heavy-loop");
    let sum = 0;
    for (let i = 0; i < 3_000_000; i++) sum += i;
    console.timeLog("heavy-loop", "halfway marker");
    for (let i = 0; i < 2_000_000; i++) sum += i;
    console.timeEnd("heavy-loop");

    console.count("counted");
    console.count("counted");
    console.count("counted");

    print(`Loop total ${sum} — timing and counts are in Console.`, "ok");
  },

  assert() {
    const total = team.reduce((acc, p) => acc + p.tasks, 0);
    console.assert(total > 100, "Expected more than 100 tasks, got", total);
    console.trace("How did we get here?");
    print("An assertion failed on purpose, plus a stack trace.", "wa");
  },

  /* ---------- Sources ---------- */

  breakpoint() {
    const cart = [
      { item: "Keyboard", price: 45, qty: 2 },
      { item: "Mouse", price: 20, qty: 1 },
      { item: "Monitor", price: 180, qty: 1 }
    ];

    let total = 0;

    // eslint-disable-next-line no-debugger
    debugger; // execution pauses here when DevTools is open

    for (const line of cart) {
      total += line.price * line.qty;
    }

    print(`Cart total ${total}. Step through it in Sources with F10.`, "ok");
  },

  stepInto() {
    function normalise(name) {
      return name.trim().toLowerCase();
    }

    function initials(name) {
      return name
        .split(" ")
        .map(part => part[0])
        .join("")
        .toUpperCase();
    }

    function build(person) {
      return { slug: normalise(person.name), badge: initials(person.name) };
    }

    const result = team.map(build);
    console.log("Breakpoint the map line, then press F11 to step into build()", result);
    print("Set a breakpoint on the team.map(build) line in Sources.", "ok");
  },

  conditional() {
    // Right-click the line number below → Add conditional breakpoint → person.tasks > 10
    team.forEach(person => {
      const load = person.hours / person.tasks;
      console.log(`${person.name}: ${load.toFixed(2)}h per task`);
    });
    print("Try a conditional breakpoint: person.tasks > 10", "ok");
    print("Right-click the line number in Sources → Add conditional breakpoint.", "dim");
  },

  /* ---------- Network ---------- */

  async success() {
    print("GET /users ...", "dim");
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      const data = await res.json();

      userList.innerHTML = data
        .slice(0, 4)
        .map(
          user =>
            `<li><strong>${user.name}</strong><span class="muted small">${user.email}</span></li>`
        )
        .join("");

      print(`${res.status} ${res.statusText} — ${data.length} users`, "ok");
      print("Network → click the request → Headers, Payload, Response, Timing.", "dim");
    } catch (err) {
      print(`Failed: ${err.message}`, "er");
    }
  },

  async notFound() {
    print("GET /no-such-endpoint ...", "dim");
    const res = await fetch("https://jsonplaceholder.typicode.com/no-such-endpoint");
    print(`Status ${res.status} — and fetch did NOT throw. Check res.ok yourself.`, "er");
  },

  async dnsFail() {
    print("GET an unreachable host ...", "dim");
    try {
      await fetch("https://this-host-does-not-exist-9x7q.dev/data");
    } catch (err) {
      print(`${err.name}: ${err.message}`, "er");
      print("In Network this shows as (failed) with no status code at all.", "dim");
    }
  },

  async slow() {
    print("Throttle the connection first: Network → No throttling → Slow 3G", "wa");
    const started = performance.now();
    await fetch("https://jsonplaceholder.typicode.com/photos?_limit=100");
    print(`Took ${Math.round(performance.now() - started)}ms`, "ok");
  },

  /* ---------- errors ---------- */

  typeError() {
    const user = { name: "Ayesha" };
    try {
      console.log(user.profile.email); // profile is undefined
    } catch (err) {
      console.error(err);
      print(`${err.name}: ${err.message}`, "er");
      print("Click the file link on the right of the Console error to jump to the line.", "dim");
    }
  },

  jsonError() {
    try {
      JSON.parse("{ broken json }");
    } catch (err) {
      console.warn("Caught safely:", err.message);
      print(`Caught: ${err.message} — the app keeps running.`, "wa");
    }
  },

  uncaught() {
    print("Throwing an uncaught error — check Console for the red entry.", "er");
    setTimeout(() => {
      throw new Error("This one is deliberately not caught");
    }, 0);
  }
};

document.querySelector(".shell").addEventListener("click", event => {
  const key = event.target.dataset.run;
  if (!key) return;
  actions[key]();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  out.innerHTML = "";
  console.clear();
});

console.log("%cDevTools lab ready", "color:#4f46e5;font-size:15px;font-weight:bold");
print("Press F12 and work through the sections above.", "dim");
