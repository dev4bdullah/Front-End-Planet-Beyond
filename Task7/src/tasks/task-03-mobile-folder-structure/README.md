# Task 3 — Mobile Folder Structure

> Sheet description: Create components, screens, navigation, hooks, services, utils, constants, and assets folders

## The structure here

```
src/
├── App.jsx                 providers + navigation container
├── navigation/             RootNavigator, TasksNavigator
├── theme/                  colors, spacing, radius, type, shadows
├── data/                   sample products and profile
├── shared/                 ui.jsx — the component kit
└── tasks/
    └── task-NN-slug/
        ├── Screen.jsx
        ├── screens/        (task 12 only)
        └── components/     (task 12 only)
```

## Screens vs components

**A screen is something a navigator points at.** It owns the safe area, the scroll container and the
data for one view.

**A component is everything else.** It takes props and knows nothing about navigation.

The test: if it calls `useSafeAreaInsets` or reads `route.params`, it's a screen. `ProductCard` in
task 12 takes an `onPress` rather than calling `navigation.navigate` itself, which is what lets it
appear on both Home and Listing.

## Grouped by feature, not by type

Every task folder holds its own screens and components. Deleting a feature means deleting a folder —
the same argument as Day 3, and it holds harder on mobile where a feature spans a screen, a couple
of components and often a hook.

## What's different from a web project

| Web | React Native |
|-----|--------------|
| `public/` served as-is | `assets/`, bundled and referenced with `require` |
| CSS files | `StyleSheet.create` objects |
| `pages/` or routes | `navigation/` and screen components |
| `index.html` | none — there's no document |

`require("../assets/logo.png")` is resolved at **build** time, which is why the path can't be a
variable. Task 8 covers what that rules out.
