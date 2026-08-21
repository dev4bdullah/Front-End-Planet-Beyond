/* Task 7 — one wrapper every request goes through.
   Timeout, abort, status checking, error normalisation and retry are defined
   here once, so no screen ever calls fetch directly. */

const BASE = "https://dummyjson.com";

export class ApiError extends Error {
  constructor(message, { status, url, kind = "http" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    /* kind lets a screen choose its message without parsing the text:
       "http" | "network" | "timeout" | "parse" */
    this.kind = kind;
  }

  /* A phone is offline far more often than a laptop, so the distinction
     between "no signal" and "the server said no" is worth surfacing. */
  get isRetryable() {
    return this.kind === "network" || this.kind === "timeout" || this.status >= 500;
  }
}

export function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) query.set(key, String(value));
  });

  const asString = query.toString();
  return asString ? `?${asString}` : "";
}

export async function request(path, { signal, timeout = 12000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeout);

  /* A caller's signal — from a screen unmounting — must also cancel this,
     or the cleanup does nothing and the response still lands. */
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const url = `${BASE}${path}`;
  let timedOut = false;
  const markTimeout = setTimeout(() => {
    timedOut = true;
  }, timeout);

  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options
    });

    /* fetch does NOT reject on 404 or 500 — it only rejects when the request
       never completes. Forgetting this check is the most common async bug. */
    if (!response.ok) {
      throw new ApiError(messageForStatus(response.status), {
        status: response.status,
        url,
        kind: "http"
      });
    }

    try {
      return await response.json();
    } catch {
      throw new ApiError("The server sent something that wasn't JSON.", { url, kind: "parse" });
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "AbortError") {
      // A caller-cancelled request is not a failure — let it through so the
      // hook can ignore it. A timeout IS a failure.
      if (timedOut) throw new ApiError("The request took too long.", { url, kind: "timeout" });
      throw error;
    }

    // On a device this is almost always no connectivity
    throw new ApiError("Couldn't reach the server. Check your connection.", {
      url,
      kind: "network"
    });
  } finally {
    clearTimeout(timer);
    clearTimeout(markTimeout);
  }
}

function messageForStatus(status) {
  if (status === 401) return "You need to sign in again.";
  if (status === 403) return "You don't have access to that.";
  if (status === 404) return "That doesn't exist.";
  if (status === 429) return "Too many requests — wait a moment.";
  if (status >= 500) return "The server had a problem. Try again shortly.";
  return `Request failed with ${status}.`;
}

/* Exponential backoff, retrying only what's worth retrying.
   Retrying a 404 just makes the user wait longer for the same answer. */
export async function withRetry(operation, { attempts = 3, baseDelay = 400, signal } = {}) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation({ signal, attempt });
    } catch (error) {
      lastError = error;

      if (error.name === "AbortError") throw error;
      if (error instanceof ApiError && !error.isRetryable) throw error;
      if (attempt === attempts - 1) break;

      // 400ms, 800ms, 1600ms — plus jitter, so a thundering herd of phones
      // coming back online doesn't all retry on the same tick
      const delay = baseDelay * 2 ** attempt + Math.random() * 200;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
