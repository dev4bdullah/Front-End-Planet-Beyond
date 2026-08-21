# Task 9 — Context API

> Sheet description: Create ThemeContext, AuthContext, and ToastContext for app-level state

## Four providers, one concern each

```jsx
<ThemeProvider>
  <AuthProvider>
    <ToastProvider>
      <CrudProvider>{children}</CrudProvider>
    </ToastProvider>
  </AuthProvider>
</ThemeProvider>
```

Order matters where one consumes another. `CrudProvider` is innermost because nothing above it
needs the records; `ToastProvider` sits above it so a CRUD action can raise a toast.

| Context | Owns |
|---------|------|
| ThemeContext | light/dark, persisted, applied as a class on `<html>` |
| AuthContext | the current user, and a `can()` permission check |
| ToastContext | raising notifications |
| CrudContext | the records and the reducer (task 10) |

## Permissions as a function, not a role comparison

```js
const can = useCallback(action => Boolean(user && PERMISSIONS[user.role]?.includes(action)), [user]);

{can("delete") && <button>Delete</button>}
```

Components ask what they're allowed to do, not what role the user has. Adding a role is one entry in
`PERMISSIONS`; comparing `role === "admin"` in forty components is not.

## The three mistakes

**1 · No memo on the value.** Every consumer re-renders whenever the provider does.

**2 · One giant AppContext.** A theme toggle then re-renders every component reading the records.
Hence four contexts rather than one.

**3 · Returning `undefined` outside the provider.** The failure surfaces as "cannot read property of
undefined" pointing at an innocent component. Every hook here throws a named error instead:

```js
if (!context) throw new Error("useAuth must be used inside an <AuthProvider>");
```

Two lines that save an afternoon.

## When context is the wrong tool

Context is not a state manager — it's a way of passing a value down without props. No batching, no
selectors, and any change re-renders every consumer.

| Situation | Use |
|-----------|-----|
| One or two levels | props |
| Rarely-changing app-wide value | context |
| Frequently-changing, read by many | context + reducer, or a store |
| Server data | TanStack Query |
| Form state | react-hook-form |
