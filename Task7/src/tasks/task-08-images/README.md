# Task 8 — Images

> Sheet description: Render local assets, remote images, placeholders, and fallback UI for failed image loads

## Local and remote are different APIs

```jsx
<Image source={require("../assets/logo.png")} />   // local — resolved at BUILD time
<Image source={{ uri: "https://…" }} />             // remote — needs explicit dimensions
```

**`require` cannot take a variable.** The path is resolved by Metro when the bundle is built, so
`require(iconPath)` doesn't work and never will. A map of static requires is the workaround:

```js
const ICONS = { home: require("./home.png"), user: require("./user.png") };
```

## A remote image has three states

Loading, loaded, failed — and the third is the one people skip. On a bad connection it's what most
users see.

```jsx
onLoadStart={() => setStatus("loading")}
onLoad={()      => setStatus("loaded")}
onError={()     => setStatus("failed")}
```

The screen implements a `RemoteImage` component wrapping all three, with a spinner overlay and an
emoji fallback.

## Remote images need explicit dimensions

A local asset carries its own size. A remote one doesn't — the layout has to be decided before the
image arrives, or the page reflows when it lands.

Setting the size up front also prevents layout shift, which matters more on mobile because a shift
can move a button out from under a thumb that's already descending.

## resizeMode

| Value | Does |
|-------|------|
| `cover` | fills the box, crops the overflow — the usual choice |
| `contain` | fits inside, leaves letterboxing |
| `stretch` | distorts — almost never right |
| `center` | no scaling |

## @2x and @3x

```
logo.png      logo@2x.png      logo@3x.png
```

Metro picks by device pixel ratio automatically. You reference `logo.png` and the right one ships.

## Accessibility

```jsx
<Image accessible accessibilityLabel="Product photo of a mechanical keyboard" />
```

An unlabelled image is announced as "image", which tells nobody anything. A decorative one should
set `accessibilityElementsHidden` instead, so it's skipped rather than announced uselessly.

## expo-image

Worth knowing about: it adds caching, blurhash placeholders and transitions. `expo-image` is a
drop-in for most uses. This project stays on the built-in `Image` because the point here is what the
core API does.
