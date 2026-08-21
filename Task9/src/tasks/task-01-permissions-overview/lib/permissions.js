import { Alert, Linking, Platform } from "react-native";

/* Task 1 — one place that knows how a permission request should behave.

   The three-state model matters more than the API. A permission is:

     undetermined — never asked. You may ask.
     granted      — you may use the feature.
     denied       — and on iOS, asking again does NOTHING. The system dialog
                    will not appear a second time; the only route is Settings.

   Treating denied as "ask again" produces a button that silently does nothing,
   which is the most common permissions bug on iOS. */

export const STATUS = {
  undetermined: { label: "Not asked yet", tone: "neutral" },
  granted: { label: "Granted", tone: "success" },
  denied: { label: "Denied", tone: "danger" },
  limited: { label: "Limited", tone: "warning" },
  unavailable: { label: "Unavailable here", tone: "neutral" }
};

/* Wraps an Expo permission module into a single shape, so a screen doesn't
   care whether it's talking to image-picker or location. */
export function describe(response) {
  if (!response) return { status: "undetermined", canAskAgain: true, granted: false };

  return {
    status: response.granted ? "granted" : (response.status ?? "undetermined"),
    // false on iOS after a denial — the system will not show the dialog again
    canAskAgain: response.canAskAgain ?? true,
    granted: Boolean(response.granted)
  };
}

/* The rationale step. Asking cold, with no explanation, is how you get denied
   — and on iOS a denial is close to permanent. */
export function explainThenRequest({ title, message, onRequest, onCancel }) {
  Alert.alert(title, message, [
    { text: "Not now", style: "cancel", onPress: onCancel },
    { text: "Continue", onPress: onRequest }
  ]);
}

/* The only route back from a hard denial. */
export function offerSettings({ feature }) {
  Alert.alert(
    `${feature} is turned off`,
    `You've denied this permission, so the system won't ask again. You can turn it on in Settings.`,
    [
      { text: "Not now", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() }
    ]
  );
}

export const PERMISSION_NOTES = [
  {
    key: "ios-denial-is-final",
    title: "On iOS, denied means denied",
    body: "requestPermissionsAsync() resolves immediately with the same denial and shows no dialog. canAskAgain tells you this before you waste the call."
  },
  {
    key: "android-twice",
    title: "Android allows a second ask",
    body: "After two denials Android sets 'don't ask again' itself. shouldShowRequestPermissionRationale is the underlying signal; Expo surfaces it as canAskAgain."
  },
  {
    key: "strings-required",
    title: "Missing usage strings are a store rejection",
    body: "iOS requires an NSxxxUsageDescription for every permission. Without it the app crashes on request; with a vague one, review rejects it."
  },
  {
    key: "ask-late",
    title: "Ask at the point of use",
    body: "A permission prompt on first launch, before the user knows what the app does, is the highest-denial-rate pattern there is."
  }
];

export const PLATFORM_LABEL = Platform.select({
  ios: "iOS",
  android: "Android",
  default: "this platform"
});
