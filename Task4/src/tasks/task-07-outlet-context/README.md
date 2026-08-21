# Task 7 — Outlet Context

> Sheet description: Pass layout-level user/settings data through useOutletContext where appropriate

## Both halves

```jsx
// MainLayout — the provider
<Outlet context={{ user, settings, updateSetting }} />

// any descendant route — the consumer
const { user, settings, updateSetting } = useOutletContext();
```

That's the entire API.

## The part people miss

A nested layout does **not** pass context through automatically:

```jsx
const app = useOutletContext();
<Outlet context={app} />        // ← without this, the next layer gets undefined
```

Each layer that renders its own `Outlet` decides what the layer below receives. This project has
four such intermediate layouts, and forgetting the forward in two of them crashed the test suite
during development — which is how I found it.

## What it replaces

```jsx
// ❌ prop drilling — every layer knows about a prop it doesn't use
<MainLayout user={user}><DashboardLayout user={user}><UsersPage user={user}>

// ✅ the layers in between don't mention it
<Outlet context={{ user }} />
```

Note that `updateSetting` is passed down too. Context isn't only for data — passing the setter is
what lets a child write back to the layout. The Settings page edits `MainLayout`'s state without a
single prop.

## Which tool

| Use | When | Cost |
|-----|------|------|
| Outlet context | data owned by a layout, needed by its routes | free, already there |
| React context | needed outside the route tree too, e.g. a portal modal | a provider and a hook per concern |
| Zustand / Redux | genuinely global, updated from many places | a dependency and a mental model |
| Props | one or two levels | nothing — still the right default |

## Two limitations

**It isn't memoised.** `<Outlet context={{ user, settings }} />` creates a new object every render,
so every consumer re-renders. `useMemo` the value when that matters.

**It returns `undefined` outside a route rather than throwing** — so the failure surfaces as
"cannot read property of undefined" somewhere far from the cause. Task 11's `useApp()` wraps it
with an error that names the actual problem.
