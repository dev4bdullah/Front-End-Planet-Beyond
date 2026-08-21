# Task 3 — Modern JavaScript Syntax

> Sheet description: Implement let/const, arrow functions, template literals, destructuring, rest/spread, optional chaining, and nullish coalescing

## Run it

Right-click `index.html` → **Open with Live Server**, then click through the six buttons.
Every line printed is a real evaluated result, not a hardcoded string.

## What's demonstrated

| Section | Shows |
|---------|-------|
| `let` / `const` | block vs function scope in a loop, and that `const` locks the binding not the contents |
| Arrow functions | concise bodies, returning object literals, and lexical `this` |
| Template literals | interpolation, embedded expressions, multiline, tagged templates |
| Destructuring | objects, arrays, renaming, defaults, nested with fallback, in parameters, rest |
| Rest & spread | merging objects, copying arrays, rest params, omitting a key, `Math.max(...arr)` |
| `?.` and `??` | safe property access, optional calls, and the `0`/`""` trap |

## The three that cause real bugs

**`var` in a loop.** All the closures share one binding, so they all report the final value.
`let` gives each iteration its own — click the first button to see `[0,1,2]` against `[3,3,3]`.

**Arrow functions as object methods.** An arrow has no `this` of its own. That's exactly what you
want in a callback and exactly what you don't want on a method.

**`||` versus `??`.** `||` treats `0` and `""` as missing, so `quantity || 1` silently turns a
deliberate zero into one. `??` only falls back on `null` and `undefined`.

## Small things worth knowing

- `n => ({ a: n })` — the parens are required, or the braces read as a function body
- `const { meta: { city } = {} } = user` — the `= {}` stops a missing `meta` throwing
- `const { id, ...rest } = user` — the cleanest way to drop one key
- Spread copies one level deep only; nested objects are still shared references
