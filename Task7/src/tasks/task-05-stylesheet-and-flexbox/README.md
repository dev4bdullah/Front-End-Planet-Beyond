# Task 5 — StyleSheet & Flexbox

> Sheet description: Use StyleSheet.create, Flexbox, spacing tokens, typography, shadows, and responsive sizing

## Six web habits that don't exist here

| Web | React Native |
|-----|--------------|
| `display: flex` | every View is already flex |
| `flex-direction: row` default | **`column`** is the default |
| `position: static` default | `relative` is the default |
| cascading / inheritance | none, except text inside text |
| `px`, `rem`, `%` units | unitless density-independent points |
| `float`, `grid`, `z-index` layering | none — grid absent, z-index unreliable |

**`flexDirection` defaulting to `column`** is the one that bites daily. Half of "why is my row
stacked vertically" is this.

## StyleSheet.create

```js
const s = StyleSheet.create({ card: { padding: 12 } });
```

It validates keys at startup — a typo like `paddingHorizontl` throws instead of being silently
ignored, which is what an inline object would do.

Inline objects are not a crime; they're just a new object every render, so a `memo`'d child sees a
changed prop.

## Style arrays

```jsx
style={[s.card, isActive && s.cardActive, { width }]}
```

Later entries win, and `false`/`null` are skipped — so the `&&` pattern is safe. This is the
composition mechanism, since there's no cascade.

## Tokens

`src/theme/index.js` holds `colors`, `spacing` (a 4pt scale), `radius`, `type` and `layout`.
Everything imports from there.

`type` uses numeric sizes rather than named CSS classes, because there is no stylesheet to name
them in. Font sizes in React Native are **unitless** and scale with the device's font setting
unless you opt out — which you usually shouldn't.

## Shadows need a platform check

```js
Platform.select({
  ios:     { shadowColor, shadowOffset, shadowOpacity, shadowRadius },
  android: { elevation: 2 }
});
```

iOS shadow props do nothing on Android; `elevation` does nothing on iOS. `theme/shadows.js` wraps
both behind `shadow(level)`, so no screen has to remember.

## Responsive sizing

```js
const { width } = useWindowDimensions();
const columns = width > 600 ? 3 : 2;
```

`useWindowDimensions` re-renders on rotation. `Dimensions.get("window")` does not — it's read once
and then stale, which is why a rotated tablet shows a broken layout.

There are no media queries. Breakpoints are `if` statements.
