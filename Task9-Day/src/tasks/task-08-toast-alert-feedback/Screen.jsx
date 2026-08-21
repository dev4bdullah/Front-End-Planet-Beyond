import { useState } from "react";
import { View, Text, Alert, Platform, ToastAndroid } from "react-native";
import { Screen, PageHeader, SectionCard, Code, Button, Row, Badge } from "../../shared/ui";
import { useTheme } from "../../hooks";
import { useToast, TOAST_PLATFORM_NOTE } from "./lib/ToastContext";
import { type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const { toast, clear } = useToast();
  const [undone, setUndone] = useState(0);

  return (
    <Screen>
      <PageHeader
        number={8}
        title="Toast / Alert Feedback"
        brief="Use Alert or a toast pattern for success, warning, and error feedback"
        lead="React Native has no cross-platform toast. It has Alert, which blocks — and knowing which to reach for is the actual skill."
      />

      <SectionCard
        title="The four tones"
        note="Non-blocking. They appear over the content and dismiss themselves, except where that would be wrong."
      >
        <Row>
          <Button label="Success" size="sm" onPress={() => toast.success("Profile saved.")} />
          <Button
            label="Error"
            size="sm"
            variant="danger"
            onPress={() => toast.error("Couldn't reach the server.", { sticky: true })}
          />
          <Button
            label="Warning + Undo"
            size="sm"
            variant="ghost"
            onPress={() =>
              toast.warning("Photo removed.", {
                actionLabel: "Undo",
                onAction: () => {
                  setUndone(count => count + 1);
                  toast.success("Restored.");
                }
              })
            }
          />
          <Button
            label="Info"
            size="sm"
            variant="ghost"
            onPress={() => toast.info("Saved locally.")}
          />
          <Button label="Clear all" size="sm" variant="ghost" onPress={clear} />
        </Row>

        <Text style={[type.small, { color: colors.textMuted }]}>Undo pressed {undone} times.</Text>
      </SectionCard>

      <SectionCard
        title="Toast or Alert"
        note="Not interchangeable. One interrupts and one doesn't, and that's the entire decision."
      >
        <Code>{`Alert   modal, blocking, needs a tap to leave.
        → destructive confirmations, anything irreversible,
          anything the user MUST acknowledge.

Toast   passing, non-blocking, dismisses itself.
        → confirmations of things that already happened.

// The test: if the user could reasonably keep working without
// reading it, it's a toast. If they must decide something first,
// it's an Alert.`}</Code>

        <Row>
          <Button
            label="Alert: destructive confirm"
            size="sm"
            variant="ghost"
            onPress={() =>
              Alert.alert(
                "Delete your profile picture?",
                "This removes the saved file from the device. It can't be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => toast.warning("Deleted.") }
                ]
              )
            }
          />
        </Row>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Note <Text style={{ fontWeight: "700" }}>style: "destructive"</Text> — iOS renders it red,
          and <Text style={{ fontWeight: "700" }}>style: "cancel"</Text> gets bold and the Escape
          position. Android ignores both, so the button <em>order</em> has to carry the meaning as
          well.
        </Text>
      </SectionCard>

      <SectionCard
        title="What the platform gives you, and doesn't"
        note="This is why a toast has to be built rather than imported."
      >
        <Code>{`Alert.alert(...)      ✅ both platforms, looks native on each
ToastAndroid.show(...) ⚠️  Android ONLY. No action button, no styling.
ActionSheetIOS         ⚠️  iOS only.
// There is no cross-platform toast in React Native.`}</Code>

        <Row>
          <Badge label={TOAST_PLATFORM_NOTE} />
          {Platform.OS === "android" ? (
            <Button
              label="Native ToastAndroid"
              size="sm"
              variant="ghost"
              onPress={() =>
                ToastAndroid.show("The native one — no action button.", ToastAndroid.SHORT)
              }
            />
          ) : null}
        </Row>
      </SectionCard>

      <SectionCard
        title="Four decisions in this implementation"
        note="All four are in lib/ToastContext.jsx."
      >
        <Code>{`// 1. errors and anything with an action DON'T auto-dismiss
if (sticky || onAction) return undefined;   // no timer at all

// 2. the stack is capped — a bulk action shouldn't produce twelve toasts
setToasts(list => [...list, next].slice(-max));

// 3. pointerEvents="box-none" on the container, so the area around a
//    toast stays tappable. A full-width overlay that eats touches is a
//    real bug, not a cosmetic one.

// 4. announceForAccessibility + accessibilityLiveRegion, because a
//    visual toast is completely invisible to a screen reader.`}</Code>
      </SectionCard>

      <SectionCard
        title="Haptics carry the same signal"
        note="A tap pattern reaches someone who isn't looking at the screen, and costs one line."
      >
        <Code>{`import * as Haptics from "expo-haptics";

Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   // for a tap

// .catch(() => {}) — a device with no haptic engine rejects, and a
// failed vibration should never surface as an error.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Every toast here fires one. Errors get a heavier pattern than successes, which is a
          distinction users pick up without being told.
        </Text>
      </SectionCard>

      <SectionCard
        title="Placement"
        note="Bottom, above the safe area, and above the keyboard if one is open."
      >
        <Code>{`const insets = useSafeAreaInsets();
<View style={{ position: "absolute", bottom: insets.bottom + spacing.lg }} />

// Top placement collides with the notch and the status bar.
// Bottom is also nearer the thumb, which matters when the toast
// has an Undo button the user has three seconds to reach.`}</Code>
      </SectionCard>
    </Screen>
  );
}
