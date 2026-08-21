import { useState } from "react";
import { View, Text, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  Screen,
  PageHeader,
  SectionCard,
  Code,
  Button,
  Row,
  Badge,
  KeyValue
} from "../../shared/ui";
import { useTheme } from "../../hooks";
import { type, spacing } from "../../theme";
import {
  STATUS,
  describe,
  explainThenRequest,
  offerSettings,
  PERMISSION_NOTES,
  PLATFORM_LABEL
} from "./lib/permissions";

const CHECKS = [
  {
    key: "photos",
    label: "Photo library",
    get: ImagePicker.getMediaLibraryPermissionsAsync,
    ask: ImagePicker.requestMediaLibraryPermissionsAsync
  },
  {
    key: "camera",
    label: "Camera",
    get: ImagePicker.getCameraPermissionsAsync,
    ask: ImagePicker.requestCameraPermissionsAsync
  },
  {
    key: "location",
    label: "Location",
    get: Location.getForegroundPermissionsAsync,
    ask: Location.requestForegroundPermissionsAsync
  }
];

export default function TaskScreen() {
  const { colors } = useTheme();
  const [states, setStates] = useState({});

  async function check(entry) {
    const response = await entry.get();
    setStates(current => ({ ...current, [entry.key]: describe(response) }));
  }

  async function request(entry) {
    const current = states[entry.key];

    /* The branch that matters: if the system won't ask again, requesting is a
       no-op. Sending the user to Settings is the only honest option. */
    if (current && !current.granted && !current.canAskAgain) {
      offerSettings({ feature: entry.label });
      return;
    }

    explainThenRequest({
      title: `${entry.label} access`,
      message: `Day 9 uses ${entry.label.toLowerCase()} for one screen only. You can say no and the rest of the app still works.`,
      onRequest: async () => {
        const response = await entry.ask();
        setStates(state => ({ ...state, [entry.key]: describe(response) }));
      }
    });
  }

  return (
    <Screen>
      <PageHeader
        number={1}
        title="Permissions Overview"
        brief="Understand Android/iOS permission flow and implement clear permission request handling"
        lead="Three states, not two — and the third one is why so many permission buttons silently do nothing."
      />

      <SectionCard
        title="Check and request, for real"
        note="These call the actual system APIs. Check first to see the current state without prompting; request shows a rationale before the system dialog."
      >
        {CHECKS.map(entry => {
          const state = states[entry.key];
          const status = state ? (STATUS[state.status] ?? STATUS.undetermined) : null;

          return (
            <View key={entry.key} style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
              <Row>
                <Text style={[type.small, { color: colors.text, fontWeight: "700", flex: 1 }]}>
                  {entry.label}
                </Text>
                {status ? (
                  <Badge label={status.label} tone={status.tone} />
                ) : (
                  <Badge label="unchecked" />
                )}
              </Row>

              {state ? (
                <Text style={[type.tiny, { color: colors.textFaint }]}>
                  status: {state.status} · canAskAgain: {String(state.canAskAgain)}
                </Text>
              ) : null}

              <Row>
                <Button label="Check" size="sm" variant="ghost" onPress={() => check(entry)} />
                <Button
                  label={
                    state && !state.granted && !state.canAskAgain ? "Open Settings" : "Request"
                  }
                  size="sm"
                  onPress={() => request(entry)}
                />
              </Row>
            </View>
          );
        })}

        <Text style={[type.small, { color: colors.textMuted }]}>
          Running on {PLATFORM_LABEL}. In Expo Go some permissions behave slightly differently from
          a real build, because the request comes from the Expo Go app rather than yours.
        </Text>
      </SectionCard>

      <SectionCard
        title="The three states"
        note="Every permission API in Expo returns the same shape, and the third field is the one people ignore."
      >
        <Code>{`const { status, granted, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();

undetermined  never asked        → you may ask
granted       allowed            → use the feature
denied        refused            → and canAskAgain tells you whether asking
                                    again will do anything at all`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          On iOS, <Text style={{ fontWeight: "700" }}>canAskAgain</Text> is false after a single
          denial. Calling request again resolves immediately with the same result and shows no
          dialog — so a button that calls it looks broken.
        </Text>
      </SectionCard>

      <SectionCard
        title="Ask at the point of use, with a reason"
        note="A prompt on first launch, before the user knows what the app does, has the highest denial rate of any pattern."
      >
        <Code>{`// ❌ on mount, cold
useEffect(() => { requestCameraPermissionsAsync(); }, []);

// ✅ when they tap "Take a photo", after an explanation
Alert.alert("Camera access",
  "So you can take a profile picture. You can say no — the rest of the app still works.",
  [{ text: "Not now", style: "cancel" }, { text: "Continue", onPress: request }]
);`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The rationale alert is free to show again. The system dialog, on iOS, is not — which is
          the whole reason to put your own screen in front of it.
        </Text>
      </SectionCard>

      <SectionCard title="Platform differences worth knowing">
        {PERMISSION_NOTES.map(note => (
          <View key={note.key} style={{ gap: 2, paddingVertical: spacing.xs }}>
            <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>
              {note.title}
            </Text>
            <Text style={[type.small, { color: colors.textMuted }]}>{note.body}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard
        title="The usage strings are not optional"
        note="iOS crashes on a permission request with no usage description, and App Review rejects vague ones."
      >
        <Code>{`// app.json
"ios": {
  "infoPlist": {
    "NSCameraUsageDescription": "Day 9 needs the camera so you can take a profile picture.",
    "NSPhotoLibraryUsageDescription": "…so you can choose a profile picture.",
    "NSLocationWhenInUseUsageDescription": "…shows your coordinates. This is optional."
  }
},
"android": {
  "permissions": ["android.permission.CAMERA", "android.permission.ACCESS_FINE_LOCATION"]
}

// Or let the config plugin write them:
"plugins": [["expo-image-picker", { "cameraPermission": "…" }]]`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          “This app needs camera access” is a rejection. Say what you do with it and why the user
          benefits.
        </Text>
      </SectionCard>

      <SectionCard
        title="Design for refusal"
        note="A permission you can't get is a normal state, not an error. The app should stay useful."
      >
        <Code>{`// ❌ a dead screen
if (!granted) return <Text>Camera permission required</Text>;

// ✅ the feature degrades, the app doesn't
{granted
  ? <CameraButton />
  : <View>
      <PickFromLibraryButton />       {/* a different route to the same goal */}
      <Button onPress={openSettings}>Enable camera in Settings</Button>
    </View>}`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Task 4 does this properly with location: the screen works fully without the permission and
          simply offers more when it’s granted.
        </Text>
      </SectionCard>
    </Screen>
  );
}
