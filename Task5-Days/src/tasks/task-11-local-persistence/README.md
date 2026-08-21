# Task 11 — Local Persistence

> Sheet description: Save CRUD records, filters, and UI preferences in localStorage through reusable hooks

## Three hooks

| Hook | Job |
|------|-----|
| `useLocalStorage` | `useState` that survives a refresh, with try/catch on both sides |
| `usePersistedReducer` | `useReducer` + versioned persistence |
| `useUiPreferences` | view mode, density, page size — kept in a separate key |

## Separate keys, deliberately

| Key | Holds |
|-----|-------|
| `day5.crud` | records, entity, filter, sort |
| `day5.ui.v1` | view mode, density, page size |
| `day5.theme` | light or dark |
| `day5.auth` | the pretend signed-in user |

Records change rarely and are large; UI preferences change constantly and are tiny. One key for both
means rewriting the whole dataset every time someone toggles a view.

## Transient state is stripped before saving

```js
persist: ({ records, entity, filter, sort }) => ({ records, entity, filter, sort })
```

`pending`, `failed`, `selected` and `search` are deliberately not persisted. Persisting an in-flight
operation means the app reloads believing a request is still running. There's a test asserting those
keys are absent from storage.

## A version number

```js
if (!saved || saved.__v !== version) return initial;
```

When the shape changes, old data is discarded rather than merged into a half-migrated object. The
page has buttons to fake a version mismatch and to corrupt the JSON outright — refresh after either
and the app starts from seed data with a console warning instead of a white screen.

## The mount guard

```js
const mounted = useRef(false);

useEffect(() => {
  if (!mounted.current) { mounted.current = true; return; }   // skip the write on mount
  write(key, { __v: version, data: persist(state) });
}, [state, key, version]);
```

Not an optimisation. Without it, mounting immediately overwrites saved data with the default state
on any run where hydration was rejected — the bug that makes persistence look like it "works
sometimes".

## Three facts about localStorage

- **Strings only** — hence `JSON.stringify` in, `JSON.parse` out
- **Synchronous** — writing a large object on every keystroke blocks the main thread
- **Not secure** — any script on the page can read it. Never store tokens.

It also throws: private mode on older Safari, and a full quota. Every read and write here is wrapped.
