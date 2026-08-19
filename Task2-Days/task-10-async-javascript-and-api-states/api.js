/* The network layer. One wrapper so every request shares the same timeout,
   abort support and error message format. */

const BASE = "https://jsonplaceholder.typicode.com";

export async function request(path, { signal, timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // Let a caller's signal cancel this request too
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(`${BASE}${path}`, { signal: controller.signal });

    // fetch does NOT reject on 404 or 500 — you have to check res.ok yourself
    if (!res.ok) throw new Error(`Server responded with ${res.status} ${res.statusText}`);

    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export const getUsers = options => request("/users", options);
export const getPosts = options => request("/posts?_limit=8", options);
export const getBroken = options => request("/this-endpoint-does-not-exist", options);
export const getEmpty = options => request("/posts?_limit=0", options);
