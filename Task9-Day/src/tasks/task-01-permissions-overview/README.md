# Task 1 — Permissions Overview

> Sheet description: Understand Android/iOS permission flow and implement clear permission request handling

## Three states, not two

```js
const { status, granted, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
```

| State | Meaning |
|-------|---------|
| `undetermined` | never asked — you may ask |
| `granted` | use the feature |
| `denied` | and `canAskAgain` says whether asking again does anything |

**On iOS, `canAskAgain` is false after a single denial.** Calling request again resolves immediately
with the same result and shows no dialog — so a button wired to it looks broken. Sending the user to
Settings is the only honest option.

Android allows a second ask; after two denials it sets "don't ask again" itself.

## Ask at the point of use, with a reason

```js
// ❌ on mount, cold
useEffect(() => { requestCameraPermissionsAsync(); }, []);

// ✅ when they tap "Take a photo", after an explanation
Alert.alert("Camera access", "So you can take a profile picture. You can say no.", [
  { text: "Not now", style: "cancel" },
  { text: "Continue", onPress: request }
]);
```

Your own rationale alert is free to show again. The system dialog, on iOS, is not — which is the
whole reason to put a screen of your own in front of it.

## Usage strings are not optional

iOS **crashes** on a permission request with no `NSxxxUsageDescription`, and the crash names neither
the permission nor the missing key. App Review rejects vague ones.

```json
"ios": { "infoPlist": { "NSCameraUsageDescription": "Day 9 needs the camera so you can take a profile picture." } },
"android": { "permissions": ["android.permission.CAMERA"] }
```

`npm run check` in this project cross-references every permission request in the code against
`app.json` for exactly this reason.

## Design for refusal

```jsx
// ❌ a dead screen
if (!granted) return <Text>Camera permission required</Text>;

// ✅ the feature degrades, the app doesn't
{granted ? <CameraButton /> : <><PickFromLibraryButton /><OpenSettingsButton /></>}
```

Task 4 does this properly with location: the screen is fully usable without the permission.
