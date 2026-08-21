# Task 10 — AsyncStorage Persistence

> Sheet description: Save theme, onboarding flag, favorites, and small profile preferences in AsyncStorage

localStorage's asynchronous cousin. That one word changes how every consumer has to be written.

## There is no synchronous first read

```js
// Web — the first render can already be correct
const [theme] = useState(() => localStorage.getItem("theme") ?? "dark");

// React Native — the first render CANNOT know
const [theme, setTheme] = useState("dark");
useEffect(() => { AsyncStorage.getItem("theme").then(…); }, []);
```

Which is why an app briefly shows the default before swapping — the flash of wrong theme on launch.
The fix is to hold the splash until `hydrated` is true, which is what `App.jsx` does here, rather
than rendering the wrong thing and correcting it.

## Don't write before the read finishes

```js
useEffect(() => {
  if (!hydrated) return;    // ← without this, the DEFAULT overwrites the stored
                            //   value on every launch
  AsyncStorage.setItem(key, JSON.stringify(value));
}, [key, value, hydrated]);
```

This is the bug that makes persistence look like it "works sometimes": mount writes the default, the
read returns that default, and the real value is gone. It looks like the write failed when actually
it succeeded — with the wrong data.

## Strings only, and it can throw

```js
const raw = await AsyncStorage.getItem(key);
const value = raw === null ? fallback : JSON.parse(raw);
```

`getItem` returns `null` for a missing key, not `undefined`. Checking `if (!raw)` also swallows a
legitimately stored `""` or `false`.

Every call is a promise that can reject, and corrupt JSON shouldn't crash launch — hence the
try/catch in `useAsyncStorage`.

## Batch APIs

```js
await AsyncStorage.multiGet([...]);   // one round trip to native, not ten
await AsyncStorage.multiSet([...]);
await AsyncStorage.getAllKeys();
```

The task screen uses `getAllKeys` + `multiGet` to show the live contents of storage rather than
describing it.

## What does NOT belong here

| Don't store | Use instead |
|-------------|-------------|
| tokens, passwords | `expo-secure-store` (Keychain / Keystore) |
| large datasets, images | `expo-sqlite`, `expo-file-system` |

AsyncStorage is **unencrypted**, and Android's default backend has a ~6MB total limit. A theme, a
flag, a list of ids and a few preferences is exactly what it's for.
