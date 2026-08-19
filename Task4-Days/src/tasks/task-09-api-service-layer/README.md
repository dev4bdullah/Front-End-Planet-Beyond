# Task 9 — API Service Layer

> Sheet description: Create reusable fetch or axios service functions with centralized error handling

## Structure

```
services/
├── http.js             the wrapper — base URL, timeout, abort, status check, ApiError
├── productService.js   getProducts, getProductById, getCategories
├── userService.js      getUsers, getUserById
└── index.js            one import path
```

Nothing in `services/` imports React. They're plain async functions, so they can be called from a
hook, a test, or a Node script without change.

## What the wrapper centralises

| Handled once | Instead of |
|--------------|-----------|
| Base URL | a hardcoded string in every component |
| `res.ok` checking | forgetting it in three of five places |
| Timeout | `fetch` has none — a dead request hangs forever |
| Abort forwarding | cleanup that silently doesn't cancel anything |
| Error shape | sometimes a string, sometimes an object, sometimes a Response |

**`fetch` does not reject on 404 or 500.** It only rejects when the request never completes. That's
the single most common async bug, and centralising the check is the reason to have this file at all.

## A custom error class

```js
export class ApiError extends Error {
  constructor(message, { status, url } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}
```

Callers can branch on `error.status === 401` without parsing a message string. A network failure has
**no status at all** — that absence is itself the signal, and the page shows the two differently.

## Abort forwarding

```js
if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });
```

The wrapper has its own controller for the timeout, and a caller's signal must be able to cancel it
too. Without this line, a `useEffect` cleanup passes a signal that does nothing.

## Normalising at the boundary

The categories endpoint has shipped as both `string[]` and `object[]`. The service normalises it, so
no component ever handles both shapes. When an API changes, exactly one file needs editing — and
you can find it without grepping for `fetch(`.

## fetch or axios

Once you've written this wrapper the gap is small, which is the point. Swapping the file for axios
would change nothing in any component, because none of them import either directly. **That's the
test of whether a service layer is doing its job.**
