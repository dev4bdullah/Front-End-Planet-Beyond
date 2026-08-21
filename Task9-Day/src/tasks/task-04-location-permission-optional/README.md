# Task 4 — Location Permission Optional

> Sheet description: Request location permission and show coordinates only if permission is granted

The word in the title is **optional**. This screen is fully usable if you decline — that's the
exercise.

## Optional means the app works without it

```jsx
// ❌ a dead end
if (!granted) return <Text>Location permission required</Text>;

// ✅ a different route to the same goal
{coords ? <Coordinates coords={coords} /> : <ManualLocationPicker />}
```

Roughly a fifth of users decline location on first ask. A screen that stops working for them is a
screen that stops working for a fifth of your users.

## Three checks, not one

```js
const enabled = await Location.hasServicesEnabledAsync();          // device-level
const { granted, canAskAgain } = await Location.requestForegroundPermissionsAsync();  // app-level
const position = await Location.getCurrentPositionAsync({ … });    // can still time out indoors
```

Each fails differently and each needs its own message. "Location unavailable" for all three tells
the user nothing about what to do.

## Accuracy is a battery decision

| Accuracy | Roughly | Cost |
|----------|---------|------|
| `Lowest` | ~3 km | cell tower, near-free |
| `Balanced` | ~100 m | wifi + cell — right for "which city" |
| `High` | ~10 m | GPS |
| `Highest` | best | GPS at full rate, visibly drains the battery |

This screen uses `Balanced`. Showing a city name to five decimals of GPS precision would be spending
the user's battery on nothing.

## Foreground and background are different permissions

`requestBackgroundPermissionsAsync` requires a written justification in App Review, shows the user a
persistent indicator, and is rejected outright if the feature doesn't genuinely need it. Ask for
foreground unless you're building navigation or geofencing.
