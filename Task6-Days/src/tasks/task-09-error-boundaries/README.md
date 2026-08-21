# Task 9 — Error Boundaries

> Sheet description: Add route/page-level error boundaries to prevent full app crashes

Without a boundary, one thrown error unmounts the entire React tree and the user gets a blank white
page. That's the default behaviour, and it's why this task exists.

## Class components, still

There is no hook equivalent of `componentDidCatch`. An error boundary must be a class.

```jsx
static getDerivedStateFromError(error) { return { error }; }   // during render, no side effects
componentDidCatch(error, info) { log(error, info.componentStack); }  // after commit, log here
```

## What it catches — and doesn't

| Caught | Not caught |
|--------|------------|
| render | event handlers |
| lifecycle methods | `setTimeout` callbacks |
| constructors | promises / async-await |
| | errors thrown by the boundary itself |

The page has a widget for the second column. The fix for those is ordinary `try/catch` or an error
state — not a boundary.

## Three levels

```jsx
<ErrorBoundary level="page"><App /></ErrorBoundary>              // 1. root, last resort
<ErrorBoundary level="page" name={slug}><Page /></ErrorBoundary> // 2. per route
<ErrorBoundary name="Revenue chart"><Chart /></ErrorBoundary>    // 3. per widget
```

This project wires all three. The route-level one lives in `src/router/routes.jsx`, which is why
breaking a page never costs you the sidebar — `routes.test.jsx` asserts exactly that.

## The reset key

```jsx
if (!this.state.error) return <div key={this.state.count}>{children}</div>;
```

Bumping a key on reset remounts the subtree cleanly, so a component that crashed during mount gets a
genuine second attempt rather than re-rendering with its broken state.

Note the honest limitation: pressing **Try again** while the underlying cause is still there
re-throws immediately. A boundary can only recover if something changed.

## Custom fallbacks

```jsx
<ErrorBoundary fallback={({ error, reset }) => <ChartShell onRetry={reset} />}>
```

A boundary around a chart can render an empty chart shell rather than a red box.

## In development

You'll see React's own error overlay on top of the fallback. That's Vite, not a bug — dismiss it and
the boundary is underneath. It doesn't appear in a production build.

## Tested

`ErrorBoundary.test.jsx` covers children rendering, catching, `onError`, recovery and custom
fallbacks. `console.error` is spied on because React logs every caught error — with
`restoreAllMocks` in `afterEach`, or the mock leaks into other files and swallows real errors.
