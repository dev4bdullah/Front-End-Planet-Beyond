import { useCallback, useState } from "react";
import { View, Text, AppState } from "react-native";
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
import { useTheme, useAppState } from "../../hooks";
import { spacing, type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const [log, setLog] = useState([]);
  const [secretVisible, setSecretVisible] = useState(true);

  /* useCallback with an empty dep array gives a stable identity without
     touching a ref during render. */
  const note = useCallback(
    message =>
      setLog(list => [`${new Date().toLocaleTimeString()} — ${message}`, ...list].slice(0, 10)),
    []
  );

  const { state, counts } = useAppState({
    onForeground: () => note("came to the foreground — refetch here"),
    onBackground: () => note("went to the background — save drafts here")
  });

  return (
    <Screen>
      <PageHeader
        number={10}
        title="App Lifecycle Basics"
        brief="Use AppState to understand foreground/background behavior for the screen"
        lead="Switch to another app and come back. Everything below is what a real app should be doing at that moment."
      />

      <SectionCard
        title="Live state"
        note="Press the home button, or open the app switcher, then return. On iOS you'll see 'inactive' flash between the two."
      >
        <Row>
          <Badge
            label={state}
            tone={state === "active" ? "success" : state === "background" ? "danger" : "warning"}
          />
          <Badge label={`foregrounded ${counts.foregrounded}×`} />
          <Badge label={`backgrounded ${counts.backgrounded}×`} />
        </Row>

        <View style={{ gap: 2 }}>
          {log.length ? (
            log.map((line, index) => (
              <Text key={index} style={[type.tiny, { color: colors.textMuted }]}>
                &gt; {line}
              </Text>
            ))
          ) : (
            <Text style={[type.tiny, { color: colors.textFaint }]}>
              &gt; leave the app and come back
            </Text>
          )}
        </View>

        <Button label="Clear log" size="sm" variant="ghost" onPress={() => setLog([])} />
      </SectionCard>

      <SectionCard
        title="Four states, three that matter"
        note="The one people get wrong is `inactive`, which is not the same as backgrounded."
      >
        <Code>{`active       on screen, receiving input
inactive     iOS ONLY — a brief in-between: a call arriving, the app
             switcher, a notification banner, a system permission dialog
background   not visible
unknown      initial value on some platforms

// Treating \`inactive\` as \`background\` makes an app pause every time a
// notification slides down. Users notice that.`}</Code>
      </SectionCard>

      <SectionCard
        title="The transition, not the state"
        note="Almost nothing cares what the state IS. Things care that it CHANGED, and in which direction."
      >
        <Code>{`const previous = useRef(AppState.currentState);

AppState.addEventListener("change", next => {
  const wasBackground = previous.current.match(/inactive|background/);

  if (wasBackground && next === "active")  onForeground();
  if (previous.current === "active" && next.match(/inactive|background/)) onBackground();

  previous.current = next;
});`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Without the ref, you can’t tell background→active apart from inactive→active, and you’ll
          refetch twice on iOS every single time.
        </Text>
      </SectionCard>

      <SectionCard
        title="subscription.remove(), not removeEventListener"
        note="The old API was removed in RN 0.65. A lot of tutorials still show it, and it throws."
      >
        <Code>{`// ❌ removed
AppState.removeEventListener("change", handler);

// ✅
const subscription = AppState.addEventListener("change", handler);
return () => subscription.remove();`}</Code>
      </SectionCard>

      <SectionCard
        title="What to actually do on each transition"
        note="These are the four that come up in nearly every app."
      >
        <KeyValue
          items={[
            ["→ background", "save drafts, pause timers and video, stop polling"],
            ["→ foreground", "refetch anything time-sensitive, re-check permissions"],
            [
              "→ background (sensitive apps)",
              "blur the screen, so the app-switcher thumbnail doesn't leak it"
            ],
            ["→ foreground (auth)", "re-lock behind biometrics after a long absence"]
          ]}
        />

        <Row>
          <Button
            label={secretVisible ? "Hide on background" : "Showing normally"}
            size="sm"
            variant="ghost"
            onPress={() => setSecretVisible(value => !value)}
          />
        </Row>

        <View
          style={{
            padding: spacing.md,
            borderRadius: 10,
            backgroundColor: colors.sunk,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Text style={[type.small, { color: colors.textMuted }]}>Account balance</Text>
          <Text style={[type.title, { color: colors.text }]}>
            {secretVisible && state === "active" ? "$12,480.00" : "••••••"}
          </Text>
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            {secretVisible
              ? "Open the app switcher — the value blanks before the screenshot is taken."
              : "Masking disabled."}
          </Text>
        </View>
      </SectionCard>

      <SectionCard
        title="Permissions can change while you're away"
        note="A user can leave, revoke camera access in Settings, and come back. Your cached 'granted' is now a lie."
      >
        <Code>{`useAppState({
  onForeground: async () => {
    const { granted } = await ImagePicker.getCameraPermissionsAsync();
    setCameraAllowed(granted);      // re-check, don't trust the old value
  }
});`}</Code>
      </SectionCard>

      <SectionCard title="What AppState is not" note="It's about the whole app, not this screen.">
        <Code>{`AppState            the APP went to the background
useFocusEffect      this SCREEN was navigated away from
                    (React Navigation — different thing entirely)

// A screen can be unfocused while the app is fully active.
// Use useFocusEffect for per-screen work, AppState for app-wide work.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Current AppState.currentState: {AppState.currentState}
        </Text>
      </SectionCard>
    </Screen>
  );
}
