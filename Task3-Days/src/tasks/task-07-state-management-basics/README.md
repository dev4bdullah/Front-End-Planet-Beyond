# Task 7 — State Management Basics

> Sheet description: Use useState for counters, toggles, tabs, forms, modals, and selected records

## Eight kinds of state on one page

number, boolean, string, id reference, modal flag, object, array, and lazy-initialised.

## The three mistakes that cause most useState bugs

**1 · `setCount(count + 1)` instead of `setCount(c => c + 1)`**

`count` is captured when the component rendered. Call it three times in one handler and all three
read the same stale value — you get +1, not +3. The page has two buttons side by side so you can
watch the difference.

**2 · Mutating an object in state**

React compares by reference. `settings.notify = false` keeps the same object, so React sees no
change and skips the render. Always `setSettings(prev => ({ ...prev, notify: false }))`.

Arrays follow the same rule:

```js
setItems(prev => [...prev, item]);                     // add
setItems(prev => prev.filter(i => i !== target));      // remove
setItems(prev => prev.map(i => i === old ? next : i)); // update
```

**3 · Storing a value you could calculate**

The filtered list on this page is derived during render. Keeping it in a second `useState` means
two sources of truth and a `useEffect` to sync them — which is where the bugs come from.

## Store the id, not the object

```jsx
const [selectedId, setSelectedId] = useState(null);
const selected = team.find(p => p.id === selectedId);
```

Storing the whole object means holding a stale copy the moment the source data changes. An id always
resolves to the current version.

## Lazy initial state

```jsx
useState(expensiveCall())        // runs on EVERY render, result discarded
useState(() => expensiveCall())  // runs once
```

The page computes a 50,000-iteration loop at mount. Every button re-renders the component and that
loop has never run again.
