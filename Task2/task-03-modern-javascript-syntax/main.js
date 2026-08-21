/* Task 3 — every modern syntax feature, each one printed so you can see the result. */

const out = document.getElementById("out");

function log(label, value, cls = "") {
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = value === undefined ? label : `${label}  →  ${format(value)}`;
  out.appendChild(div);
}

function format(value) {
  if (typeof value === "string") return `"${value}"`;
  return JSON.stringify(value);
}

function heading(text) {
  const div = document.createElement("div");
  div.className = "wa";
  div.textContent = `\n── ${text} ──`;
  out.appendChild(div);
}

const users = [
  { id: 1, name: "Ayesha", role: "Frontend", tasks: 12, meta: { city: "Lahore" } },
  { id: 2, name: "Sadiq", role: "Backend", tasks: 8 },
  { id: 3, name: "Abdullah", role: "Frontend", tasks: 15, meta: { city: "Lahore" } }
];

const demos = {
  /* ---------- 1 ---------- */
  scoping() {
    heading("let / const vs var");

    // let is block-scoped, so each iteration captures its own binding
    const fns = [];
    for (let i = 0; i < 3; i++) fns.push(() => i);
    log(
      "let inside a loop",
      fns.map(fn => fn()),
      "ok"
    );

    // var is function-scoped — all three closures share one binding
    const varFns = [];
    for (var j = 0; j < 3; j++) varFns.push(() => j);
    log(
      "var inside a loop",
      varFns.map(fn => fn()),
      "er"
    );

    // const locks the binding, not the contents
    const config = { theme: "light" };
    config.theme = "dark";
    log("const object mutated", config, "ok");
    log("but config = {} would throw", "TypeError: Assignment to constant variable", "dim");
  },

  /* ---------- 2 ---------- */
  arrows() {
    heading("arrow functions");

    const double = n => n * 2;
    const add = (a, b) => a + b;
    const makeUser = name => ({ name, active: true }); // parens return an object literal

    log("n => n * 2", double(21));
    log("(a, b) => a + b", add(20, 22));
    log("name => ({ ... })", makeUser("Abdullah"));

    // The real difference: `this` comes from where the function was written
    const timer = {
      label: "timer",
      arrow() {
        return [1].map(() => this.label)[0];
      },
      regular() {
        return [1].map(function () {
          return this?.label;
        })[0];
      }
    };
    log("arrow keeps outer this", timer.arrow(), "ok");
    log("function () gets its own this", String(timer.regular()), "er");
  },

  /* ---------- 3 ---------- */
  templates() {
    heading("template literals");

    const user = users[2];
    log("interpolation", `${user.name} has ${user.tasks} tasks`);
    log("expression inside", `${user.tasks > 10 ? "busy" : "free"}`);
    log("multiline", "line one\nline two — no \\n concatenation needed");

    const tag = (strings, ...values) =>
      strings.reduce((acc, str, i) => acc + str + (values[i] ? `[${values[i]}]` : ""), "");
    log("tagged template", tag`user ${user.name} in ${user.role}`);
  },

  /* ---------- 4 ---------- */
  destructuring() {
    heading("destructuring");

    const { name, role, tasks } = users[0];
    log("object", { name, role, tasks });

    // rename + default in one go
    const { name: who, department = "Engineering" } = users[1];
    log("rename + default", { who, department });

    // nested, with a default so a missing meta doesn't throw
    const { meta: { city } = {} } = users[1];
    log("nested with fallback", String(city));

    const [first, , third] = users;
    log("array, skipping one", [first.name, third.name]);

    const [a, b] = [1, 2];
    log("swap without a temp", (([x, y]) => [y, x])([a, b]));

    // destructuring in the parameter list
    const describe = ({ name: n, tasks: t = 0 }) => `${n}: ${t}`;
    log("in a parameter", describe(users[1]));
  },

  /* ---------- 5 ---------- */
  spread() {
    heading("rest & spread");

    const base = { theme: "light", size: "md" };
    const override = { ...base, size: "lg" }; // later keys win
    log("object spread", override);

    log("array spread", [...[1, 2], ...[3, 4]]);
    log("copy, not reference", [...[1, 2]]);

    const sum = (...nums) => nums.reduce((a, n) => a + n, 0);
    log("rest parameters", sum(1, 2, 3, 4, 5));

    const { id, ...withoutId } = users[1];
    log(`rest in destructuring (dropped id ${id})`, withoutId);

    log("spread beats Math.max.apply", Math.max(...users.map(u => u.tasks)));
  },

  /* ---------- 6 ---------- */
  safeAccess() {
    heading("optional chaining & nullish coalescing");

    const user = users[1]; // this one has no meta

    log("user.meta?.city", String(user.meta?.city), "ok");
    log("without ?. it would throw", "TypeError: Cannot read properties of undefined", "dim");

    log("?? fallback", user.meta?.city ?? "unknown");
    log("optional call", String(user.getName?.()));
    log("optional index", String(users?.[99]?.name));

    // The distinction people get wrong: || rejects 0 and "", ?? does not
    const count = 0;
    log("0 || 10", count || 10, "er");
    log("0 ?? 10", count ?? 10, "ok");

    const label = "";
    log('"" || "none"', label || "none", "er");
    log('"" ?? "none"', label ?? "none", "ok");
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

demos.scoping();
