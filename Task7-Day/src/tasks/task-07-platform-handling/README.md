# Task 7 — Platform Handling

> Sheet description: Use Platform.select for small iOS/Android styling or behavior differences

## Three tools

```js
Platform.OS                                   // "ios" | "android" | "web"
Platform.select({ ios: a, android: b })        // pick a value
Platform.select({ ios: a, default: b })        // with a fallback

// and file extensions, resolved by Metro at build time
Button.ios.jsx
Button.android.jsx
import Button from "./Button";                 // no extension — Metro picks
```

## Differences worth honouring

| Thing | iOS | Android |
|-------|-----|---------|
| Shadow | `shadowColor` + friends | `elevation` |
| Press feedback | opacity fade | ripple |
| Font | San Francisco | Roboto |
| Monospace | `Menlo` | `monospace` |
| Keyboard avoidance | needs `padding` | the window resizes itself |
| Back button | swipe gesture only | a hardware/gesture back |

## Differences not worth honouring

Making an Android app look like iOS. A ripple on Android and a fade on iOS is correct; forcing both
to fade makes the Android build feel like a cheap port.

The rule: **match the platform where the platform has a convention, and match your brand
everywhere else.**

## The `Version` trap

```js
Platform.Version    // a NUMBER on Android (API level, e.g. 34)
                    // a STRING on iOS      (e.g. "17.4")
```

So `Platform.Version >= 30` is meaningful on Android and nonsense on iOS. Always branch on
`Platform.OS` first.

## When to use a platform-specific file

`Platform.select` for a value. A separate `.ios.jsx` / `.android.jsx` file once the *logic* diverges
— at that point a component full of conditionals is harder to read than two files.
