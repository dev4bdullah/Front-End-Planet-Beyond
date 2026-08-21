import * as Linking from "expo-linking";

/* Task 6 — the linking config maps URLs onto the navigator tree.

   The shape of `screens` has to mirror the shape of the navigators exactly.
   Getting it wrong produces no error — the link simply opens the app on its
   default screen, which is a genuinely confusing way to fail. */

export const linking = {
  prefixes: [
    Linking.createURL("/"), // exp://… in Expo Go, day8:// in a build
    "day8://",
    "https://day8.example.com"
  ],

  config: {
    screens: {
      /* Root drawer */
      Main: {
        screens: {
          /* Bottom tabs inside the drawer */
          HomeTab: {
            screens: {
              Home: "home",
              Details: "product/:id" // day8://product/4
            }
          },
          SearchTab: "search",
          FavoritesTab: "favorites",
          ProfileTab: "profile"
        }
      },
      Settings: "settings",
      Help: "help",
      About: "about",
      NotFound: "*"
    }
  }
};

/* Used by task 6's screen to show what a given route resolves to. */
export function urlFor(path) {
  return Linking.createURL(path);
}
