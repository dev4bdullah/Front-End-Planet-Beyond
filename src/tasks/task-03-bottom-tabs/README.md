# Task 3 — Bottom Tabs

> Sheet description: Add tab navigation for Home, Search, Favorites, and Profile screens

Three to five destinations, always visible, one tap apart. More than five and it stops being
navigation and starts being a menu.

## A tab holding a stack

```jsx
<Tabs.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: "Home" }} />
```

`HomeTab` isn't a screen — it's a whole stack navigator. That's what lets you drill into a product
and still see the tab bar, and what gives each tab its own history.

Note the naming: `HomeTab` vs `Home`. Two routes in one tree can't share a name, and the stack's
first screen is already called `Home`.

## Badges

```jsx
options={{ tabBarBadge: count > 0 ? count : undefined }}
```

`undefined`, not `0` — passing 0 renders a badge reading "0", which is worse than no badge.

## Re-tapping a tab should reset its stack

iOS users expect this and it isn't the default:

```jsx
listeners={({ navigation }) => ({
  tabPress: event => {
    if (navigation.isFocused()) {
      event.preventDefault();
      navigation.navigate("HomeTab", { screen: "Home" });
    }
  }
})}
```

## Tabs or drawer

| Tabs | Drawer |
|------|--------|
| 3–5 places people live | rarely-visited destinations |
| Visible, so discoverable | hidden, so not |

Hiding primary navigation behind a hamburger measurably reduces how often people use it. If it
matters, it goes in a tab.

## Touch targets

44pt minimum (Apple) / 48dp (Material). The tab bar handles this; custom icons elsewhere don't — use
`hitSlop` when the icon is smaller than the target.
