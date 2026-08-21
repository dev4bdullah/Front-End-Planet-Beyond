# Task 2 — Stack Navigation

> Sheet description: Create stack flow for Home, Listing, Details, Auth, and Settings screens

## Four verbs

```js
navigation.navigate("Details", { id: 4 })
// Already in the stack? Go BACK to it and update its params. Otherwise push.
// What you want most of the time.

navigation.push("Details", { id: 4 })
// ALWAYS another copy. Right for Product → Related → Related.

navigation.replace("Home")
// Swaps the current screen. The canonical use: after login, so back
// doesn't return to the form.

navigation.popToTop()   navigation.goBack()
```

Task 2's screen has a "push a copy" button — press it three times and walk back through three
identical screens. That's the difference from `navigate` made visible.

## native-stack, not stack

```
@react-navigation/native-stack   ✅ the platform's own navigator
@react-navigation/stack          JS-based, more customisable, slower
```

native-stack gets real `UINavigationController` and Fragment transitions, so the animations, the iOS
back-swipe and the header behaviour are the platform's rather than an imitation.

## Dynamic headers

```jsx
options={({ route }) => ({ title: route.params?.title ?? `Product ${route.params?.id}` })}

// or once the data arrives
useLayoutEffect(() => navigation.setOptions({ title: product.title }), [navigation, product]);
```

`useLayoutEffect`, not `useEffect` — it applies before paint, so the header doesn't flash the old
title for a frame.

## Auth: conditional screens, not navigate

```jsx
{user ? <Stack.Screen name="Main" … /> : <Stack.Screen name="Auth" … />}
```

Changing `user` swaps the tree and resets history. There's no login screen left to go "back" to, and
no `navigate()` call to forget on one of the four paths out of login.

This app has no auth, so that's the one pattern here described rather than demonstrated — inventing
a fake login would have added a screen nobody needs.

## The stack in this app

```
HomeTab (a bottom tab)
└── HomeStack
    ├── Home        the catalogue
    └── Details     pushed — keeps the tab bar visible
```

Details sits inside the tab's stack, not at the root. At the root it would cover the tab bar, which
is right for a modal and wrong here.
