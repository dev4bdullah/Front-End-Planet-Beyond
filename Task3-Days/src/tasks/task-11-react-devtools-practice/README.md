# Task 11 — React DevTools Practice

> Sheet description: Inspect component tree, props, state changes, and re-render behavior in React DevTools

## Install first

React Developer Tools for Chrome or Firefox. Two new DevTools panels appear:

- **Components** — the tree, with props, state and hooks for whatever you select
- **Profiler** — record an interaction, see which components rendered, why, and for how long

In Components → settings gear → General → tick **Highlight updates when components render**. Every
re-render then flashes an outline on screen. It's the fastest way to spot something rendering when
it shouldn't.

## The five exercises

**1 · memo, and why it usually doesn't help.** Four cards side by side, each counting its own
renders. Type in the input and watch: the plain child climbs, the memoised one stays at 1, the
memoised one receiving `{{ mode: "compact" }}` climbs anyway, and the one receiving a `useCallback`
function stays put.

That third card is the point. `memo` compares props by reference, and a new object literal is a new
reference every render — so `memo` does nothing except add a comparison.

**2 · Read state and props.** Select the page in Components and watch the hooks list update as you
click. You can double-click a state value and edit it directly — the fastest way to test a
component in a state that's hard to reach by clicking.

**3 · The Profiler.** Record, type a few letters, stop. Yellow and orange bars are slower renders,
grey means the component didn't render. Tick **Record why each component rendered** to have it name
the exact prop that caused it.

**4 · useMemo.** A 200,000-iteration loop that runs once at mount. Type in the box — the page
re-renders constantly and the loop has never run again.

**5 · Effects and cleanup.** Change the topic and watch the console. Cleanup for the old topic runs
**before** the effect for the new one. That ordering is what stops subscriptions leaking.

## StrictMode double-firing

In development every effect fires twice. That's `<React.StrictMode>` deliberately mounting,
unmounting and remounting each component to surface missing cleanup. It does **not** happen in
production builds — and if double-firing breaks your component, the cleanup is genuinely wrong.

## Debugging by symptom

| Symptom | Where to look |
|---------|---------------|
| re-renders constantly | Profiler → "why did this render" → usually an unstable object or function prop |
| state isn't updating | Components → watch the hook on click — often a mutation instead of a replacement |
| list flickers or loses input | check the keys (task 9 demonstrates this exactly) |
| effect fires too often | dependency array holding something recreated each render |
| props arriving undefined | Components → select the child, read its props |

## The honest caveat

Most components don't need `memo` or `useMemo`. Measure in the Profiler first. Wrapping everything
adds its own comparison cost and a lot of noise — and makes the genuinely slow component harder to
find.
