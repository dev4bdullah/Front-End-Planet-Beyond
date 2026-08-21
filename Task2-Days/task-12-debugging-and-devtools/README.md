# Task 12 — Debugging & DevTools

> Sheet description: Use Console, Sources, and Network tabs to inspect state, breakpoints, failed requests, and response payloads

## Run it

Right-click `index.html` → **Open with Live Server**, then press `F12` **before** clicking anything.
Several buttons break on purpose and half the point is invisible without DevTools open.

## 1 · Console

| Button | Shows |
|--------|-------|
| Log levels | `log`, `info`, `warn`, `error`, `debug` — then filter by level |
| console.table | array of objects as a grid, plus column selection |
| Nested groups | `group` / `groupCollapsed` / `groupEnd` |
| time & count | `time`, `timeLog`, `timeEnd`, `count` |
| assert & trace | a failing assertion and a stack trace |

`console.debug` only appears when **Verbose** is ticked in the level dropdown — that catches
everyone once.

## 2 · Sources

**Trigger debugger** — execution freezes on the `debugger` statement. Hover `total` and `cart` in
the Scope panel, press `F10` to step over each loop pass and watch `total` climb, then `F8` to
resume.

**Step into** — find `team.map(build)` in Sources, click the line number to set a breakpoint, click
the button again, press `F11` to go inside `build()`.

**Conditional breakpoint** — right-click a line number → Add conditional breakpoint →
`person.tasks > 10`. It only pauses for the two people who match. This is the technique that turns
a 500-iteration loop from unusable into trivial.

## 3 · Network

Compare the three failure modes — they look identical in an alert box and completely different here:

| | Status | Response body | Network row |
|---|---|---|---|
| 404 | 404 | yes | red, with a status |
| Unreachable host | none | none | `(failed)`, no status |
| Throttled | 200 | yes | long bar in the Waterfall |

Also worth noting: the 404 button proves that **`fetch` does not throw on a bad status**. You have
to check `res.ok` yourself.

## Shortcuts

| Key | Does |
|-----|------|
| `F8` | resume |
| `F10` | step over |
| `F11` | step into |
| `Shift+F11` | step out |
| `Ctrl+P` | open file by name |
| `Ctrl+Shift+F` | search all loaded files |
| `Esc` | drawer Console from any panel |

## When to reach for which

- **A value is wrong** → breakpoint just before it's used, read the Scope panel
- **Data isn't appearing** → Network first: did it fire, what status, what's in Response
- **Works sometimes** → conditional breakpoint on the failing case
- **A click does nothing** → Elements → Event Listeners
- **Something is slow** → Performance tab, record, look for long tasks

`console.log` is fine and everyone uses it. But it's edit, reload, repeat — a breakpoint shows you
every variable in scope at once without changing a line of code.
