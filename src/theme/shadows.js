import { Platform } from "react-native";

/* Task 7 — shadows are the clearest example of a real platform difference.

   iOS uses shadowColor / shadowOffset / shadowOpacity / shadowRadius.
   Android ignores all four and uses `elevation`, which also controls z-order.
   Passing iOS shadow props on Android is silently ignored; passing elevation
   on iOS does nothing. */

export function shadow(level = 1) {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: level * 2 },
      shadowOpacity: 0.18 + level * 0.04,
      shadowRadius: level * 4
    },
    android: {
      elevation: level * 2
    },
    default: {}
  });
}
