// Deliberately written to prove the tooling works, not to do anything clever.

const out = document.getElementById("out");

function line(text, cls = "") {
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = text;
  out.appendChild(div);
}

// ESLint's `no-var` and `prefer-const` both fire if you change these
const project = {
  name: "day2-javascript-project",
  type: "module",
  tooling: ["ESLint", "Prettier", "Live Server"]
};

line("Module loaded successfully.", "ok");
line(`Project: ${project.name}`, "k");
line(`Type: ${project.type} — import/export available`, "k");
line(`Tooling: ${project.tooling.join(", ")}`, "k");
line("");
line("If you can read this, three things are true:", "dim");
line("  1. the browser found main.js", "dim");
line('  2. type="module" parsed without error', "dim");
line("  3. you are serving over http, not file://", "dim");

document.getElementById("errBtn").addEventListener("click", () => {
  try {
    // Intentional: shows how a real error surfaces in the Console
    null.crash();
  } catch (err) {
    line(`${err.name}: ${err.message}`, "er");
    console.error("Thrown on purpose so you can see the stack trace:", err);
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  out.innerHTML = "";
  line("Cleared.", "dim");
});
