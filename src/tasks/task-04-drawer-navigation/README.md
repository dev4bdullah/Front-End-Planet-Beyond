# Task 4 — Drawer Navigation

> Sheet description: Add drawer navigation for Settings, Help, About, and Logout actions

## Two native dependencies, or nothing happens

```bash
npx expo install react-native-gesture-handler react-native-reanimated
```

```js
// index.js — FIRST line
import "react-native-gesture-handler";
```

Miss it and the drawer renders correctly, opens from a button, and ignores every swipe — with no
warning. It's the most-reported "drawer doesn't work" issue and it's always this.

This app also wraps the tree in `GestureHandlerRootView`, which the newer versions require.

## Nesting order is a design decision

```
Drawer                    ← Settings, Help, About
└── Tabs                  ← Home, Search, Favourites, Profile
    └── Stack             ← Home → Details
```

The rarer the destination, the further out it sits. Inverting it — tabs containing a drawer — gives
every tab its own drawer, which is almost never what anyone means.

## Custom content

```jsx
<DrawerContentScrollView {...props}>
  <ProfileHeader />              {/* yours */}
  <DrawerItemList {...props} />  {/* the registered screens */}
  <ThemeToggle />                {/* yours */}
</DrawerContentScrollView>
```

Spreading `props` into **both** is what keeps active-item highlighting working. Dropping them
renders the list with nothing selected.

## drawerType

```jsx
drawerType="front"      // slides over the content — the phone default
drawerType="back"       // content slides away
drawerType="permanent"  // always visible — tablets, landscape

const { width } = useWindowDimensions();
drawerType={width > 900 ? "permanent" : "front"}
```

## Logout is an action, not a destination

The sheet lists Logout beside Settings and Help, but it behaves differently — there's no screen to
navigate to. Clearing the user makes task 2's conditional tree swap to the auth stack. Navigating to
a "Logout" screen leaves a route in history that the back gesture can return to.

This app has no auth, so the drawer footer holds a theme toggle instead — same mechanic, an action
rather than a route.
