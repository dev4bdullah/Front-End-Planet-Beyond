/* Task 9 — one wrapper every request goes through, so timeout, abort, status
   checking and error message format are defined once rather than per call. */

const BASE = "https://dummyjson.com";

export class ApiError extends Error {
  constructor(message, { status, url } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

export async function request(path, { signal, timeout = 10000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // A caller's signal (from a useEffect cleanup) must also cancel this request,
  // so both the timeout and the unmount can abort it.
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const url = `${BASE}${path}`;

  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options
    });

    // fetch does NOT reject on 404 or 500 — you have to check this yourself.
    if (!response.ok) {
      throw new ApiError(`Request failed with ${response.status} ${response.statusText}`, {
        status: response.status,
        url
      });
    }

    return await response.json();
  } catch (error) {
    // An abort is not an error the user should ever see — let it through
    // untouched so callers can identify it by name.
    if (error.name === "AbortError") throw error;
    if (error instanceof ApiError) throw error;

    // A network failure has no status at all, which is worth distinguishing
    throw new ApiError(error.message || "Could not reach the server.", { url });
  } finally {
    clearTimeout(timer);
  }
}

export function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) query.set(key, value);
  });

  const asString = query.toString();
  return asString ? `?${asString}` : "";
}
