# Task 6 — Deep Linking

> Sheet description: Configure a simple deep link that opens a selected details screen

## The config mirrors the navigator tree — exactly

```js
export const linking = {
  prefixes: [Linking.createURL("/"), "day8://", "https://day8.example.com"],
  config: {
    screens: {
      Main: {
        screens: {
          HomeTab: { screens: { Home: "home", Details: "product/:id" } },
          SearchTab: "search",
          FavoritesTab: "favorites"
        }
      },
      Settings: "settings",
      NotFound: "*"
    }
  }
};
```

A mismatch produces **no error** — the link just opens the default screen, which is a confusing way
to fail. `npm run check` in this project cross-references every route name here against the actual
`<X.Screen name="…">` declarations for exactly that reason.

## Two kinds of link

```
day8://product/4
  A custom scheme. One line in app.json, works instantly.
  Does nothing if the app isn't installed, and anyone can register the same scheme.

https://day8.example.com/product/4
  A universal link (iOS) / app link (Android). Opens the app if installed,
  the website if not — what you want from a link in an email.
  Needs /.well-known/apple-app-site-association and /.well-known/assetlinks.json
  on a domain you control.
```

This project declares both in `app.json`. The scheme works; the universal link points at a domain
that doesn't exist, so it's the shape rather than a working example.

## Cold start vs warm

```js
Linking.addEventListener("url", ({ url }) => handle(url));   // app already running
const url = await Linking.getInitialURL();                    // app launched BY the link
```

`NavigationContainer`'s `linking` prop handles both. You only need these directly for analytics, or
for links that aren't routes. Handling only the first is the usual bug — the link works when the app
is open and does nothing when it isn't.

## Testing

```bash
# Android
adb shell am start -W -a android.intent.action.VIEW -d "day8://product/4"

# iOS simulator
xcrun simctl openurl booted "day8://product/4"
```

## Params from a URL are strings

`day8://product/4` → `route.params.id === "4"`. Same trap as task 5, and deep links are where it
actually bites.
