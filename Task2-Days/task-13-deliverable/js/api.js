/* Task 10 — the only file that knows about the network. */

const BASE = "https://jsonplaceholder.typicode.com";

export async function request(path, { signal, timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(`${BASE}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export const getUsers = options => request("/users", options);
export const getPosts = options => request("/posts?_limit=8", options);
export const getBroken = options => request("/no-such-endpoint", options);
