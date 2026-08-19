# Task 10 — Async JavaScript & API States

> Sheet description: Fetch users/posts from JSONPlaceholder with async/await, loading, empty, success, and error states

## Run it

Right-click `index.html` → **Open with Live Server**. Six buttons trigger every state on demand —
you don't have to wait for a real failure to see the error path.

| Button | State it triggers |
|--------|-------------------|
| Users / Posts | loading → success |
| Empty | loading → empty |
| 404 | error, bad status |
| No network | error, DNS failure |
| Timeout | error, 1ms timeout |

## The four states

| State | When | What the user sees |
|-------|------|--------------------|
| Loading | request in flight | spinner + skeletons, so the layout doesn't jump |
| Success | data came back with items | the list and a count |
| Empty | request worked, array was empty | a plain explanation — **not** an error |
| Error | 404, 500, timeout, no network | the reason plus a working Retry |

Empty and error are genuinely different. "No results found" is a normal outcome; "Request failed"
means something broke. Merging them tells the user their data is missing when it simply isn't there.

## Four things worth copying

**`fetch` doesn't reject on 404 or 500.** It only rejects when the request never completes. You have
to check `res.ok` yourself — this is the single most common async bug in beginner code.

**`AbortController` for cancellation.** Switching tabs aborts the previous request rather than
leaving it to land later.

**A timeout, because `fetch` has none.** A request with no response hangs forever by default.
`setTimeout` + `controller.abort()` is the whole fix.

**An incrementing request id.** Even with aborts, guard the write: `if (id !== requestId) return`
stops a stale response overwriting fresh data. Press **Fire 3 overlapping requests** and watch the
log — two get aborted and only the newest reaches the screen.

## The shape to remember

```js
async function load() {
  showLoading();
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(res.status);   // easy to forget
    const data = await res.json();
    data.length ? showSuccess(data) : showEmpty();
  } catch (err) {
    if (err.name === "AbortError") return;      // not a real error
    showError(err.message);
  }
}
```

## In DevTools

Open the **Network** tab and compare the three failure modes: the 404 shows a red status with a
response body, the DNS failure shows `(failed)` with no status at all, and the timeout shows the
request as cancelled. They're three different problems and the panel names each one.
