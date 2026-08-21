/* Task 12 — a simulated API with a controllable latency and failure rate,
   so the optimistic path and the rollback path can both be demonstrated on
   demand rather than by waiting for a real outage. */

let settings = { latency: 900, failureRate: 0 };

export function configure(next) {
  settings = { ...settings, ...next };
}

export function getSettings() {
  return { ...settings };
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function call(label, payload) {
  await wait(settings.latency);

  if (Math.random() < settings.failureRate) {
    const error = new Error(`${label} failed — the server returned 500.`);
    error.name = "ApiError";
    throw error;
  }

  return payload;
}

export const fakeApi = {
  create: record => call("Create", record),
  update: (id, changes) => call("Update", { id, ...changes }),
  remove: id => call("Delete", { id })
};
