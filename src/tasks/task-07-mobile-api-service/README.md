# Task 7 — Mobile API Service

> Sheet description: Create reusable API service functions with timeout, error normalization, and retry helper

A phone loses signal in a lift. That single fact is why a mobile service layer needs more than the
web version.

## Structure

```
services/
├── http.js             base URL, timeout, abort, status check, ApiError, withRetry
├── productService.js   getProducts, getProductById, getCategories
└── index.js            one import path
```

Nothing here imports React, so these can be called from a hook, a test or a script.

## Errors carry a kind

```js
export class ApiError extends Error {
  constructor(message, { status, url, kind = "http" } = {}) {
    …
    this.kind = kind;   // "http" | "network" | "timeout" | "parse"
  }

  get isRetryable() {
    return this.kind === "network" || this.kind === "timeout" || this.status >= 500;
  }
}
```

A screen shouldn't parse text to decide what to show:

```jsx
{error.kind === "network" ? "You're offline" : "Something went wrong"}
```

On mobile the offline case deserves its own wording, and it's the one with no status at all.

## Timeout, because fetch doesn't have one

```js
const controller = new AbortController();
const timer = setTimeout(() => controller.abort("timeout"), timeout);

if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

try { … } finally { clearTimeout(timer); }
```

Forwarding the caller's signal is the part that's easy to miss. Without it, a screen's cleanup
passes a signal that does nothing and the response still lands on an unmounted component.

**`fetch` does not reject on 404 or 500.** It only rejects when the request never completes.

## Retry with backoff and jitter

```js
if (error instanceof ApiError && !error.isRetryable) throw error;
await sleep(baseDelay * 2 ** attempt + Math.random() * 200);
```

Retrying a 404 just makes the user wait longer for the same answer. The jitter matters more on
mobile than anywhere else: when a cell tower comes back, every phone on it retries at once, and
random spread turns a spike into a curve.

## Normalising at the boundary

`getCategories` absorbs an endpoint that has shipped as both `string[]` and `object[]`. When an API
changes shape, exactly one file needs editing — and you can find it without grepping for `fetch(`.
