# Task 3 — Profile Image Flow

> Sheet description: Preview selected image, allow replace/remove, and persist selected profile data locally

Picking the image was task 2. Keeping it after a restart is a different problem.

## A picker URI is not durable

```js
// ❌ the picker returns a path in a CACHE directory the OS may clear
setProfile({ uri: result.assets[0].uri });

// ✅ copy it somewhere persistent
const target = `${FileSystem.documentDirectory}profile/avatar-${Date.now()}.jpg`;
await FileSystem.copyAsync({ from: result.assets[0].uri, to: target });
```

`documentDirectory` is backed up and persistent. `cacheDirectory` is neither — and it's exactly
where the picker puts things. This is the bug that looks like it works and then doesn't, days later.

## Why the filename has a timestamp

```js
// ❌ same path every time — the file changes, the URI doesn't, so <Image>
//    keeps showing the CACHED old picture. It looks like the save failed.
const target = `${documentDirectory}avatar.jpg`;

// ✅ a new URI means a genuine reload
const target = `${documentDirectory}profile/avatar-${Date.now()}.jpg`;
```

…and delete the previous file, or they accumulate forever.

## Storage split

| Where | What | Size |
|-------|------|------|
| AsyncStorage | `{ uri, savedAt }` | ~80 bytes |
| FileSystem | the actual JPEG | ~200 KB |

Base64 in AsyncStorage would work for one small image and then hit Android's ~6MB limit, having also
loaded the whole thing into JS memory to get there.

## Handle the file being gone

```jsx
<Image source={{ uri: profile.uri }} onError={() => setMissing(true)} />
```

Storage cleared, restored from backup, an OS cleanup — the stored path can outlive the file. Without
`onError` the avatar renders as an empty box with no way for the user to work out that re-picking
would fix it.
