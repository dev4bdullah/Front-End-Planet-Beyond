import { useState } from "react";
import { View, Text, Platform } from "react-native";
import { Screen, PageHeader, SectionCard, Code, Button, Row, Badge } from "../../shared/ui";
import { useTheme } from "../../hooks";
import { useToast } from "../task-08-toast-alert-feedback/lib/ToastContext";
import BottomSheet, { CenterModal } from "./lib/BottomSheet";
import { type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <Screen>
      <PageHeader
        number={9}
        title="Modal / Bottom Sheet"
        brief="Build a reusable modal or bottom-sheet style component for actions and confirmations"
        lead="Two shapes, one Modal underneath. The shape you pick should follow from what you're asking."
      />

      <SectionCard
        title="Open both"
        note="The sheet is for choosing an action; the dialog is for confirming one. Try the Android back button on each."
      >
        <Row>
          <Button label="Bottom sheet" onPress={() => setSheet(true)} />
          <Button label="Confirmation dialog" variant="ghost" onPress={() => setConfirm(true)} />
        </Row>
      </SectionCard>

      <SectionCard
        title="Why RN's Modal, not an absolute View"
        note="Three things you'd otherwise rebuild, badly."
      >
        <Code>{`<Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>

// 1. It renders in a SEPARATE NATIVE WINDOW, so it sits above
//    everything — including a navigation header, which an absolutely
//    positioned View inside a screen cannot do.
// 2. onRequestClose wires up Android's hardware back button.
// 3. statusBarTranslucent lets it cover the status bar on Android.`}</Code>
      </SectionCard>

      <SectionCard
        title="The backdrop must not wrap the sheet"
        note="A one-line structural mistake that makes the sheet impossible to use."
      >
        <Code>{`// ❌ every tap on the sheet closes it, because the tap bubbles
<Pressable onPress={onClose}>
  <View style={sheet}>{children}</View>
</Pressable>

// ✅ siblings
<Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
<Animated.View style={sheet}>{children}</Animated.View>`}</Code>
      </SectionCard>

      <SectionCard
        title="useNativeDriver, and what it costs"
        note="It moves the animation off the JS thread, so it stays smooth while JS is busy — but only for some properties."
      >
        <Code>{`Animated.timing(translate, {
  toValue: visible ? 0 : 1,
  duration: 220,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true      // ✅ transform and opacity only
}).start();

// Animating height, width or backgroundColor with useNativeDriver
// THROWS. Those have to run on the JS thread — which is exactly when
// a slow render makes the animation stutter.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Which is why the sheet animates <Text style={{ fontWeight: "700" }}>translateY</Text>{" "}
          rather than its height, and the backdrop would fade with{" "}
          <Text style={{ fontWeight: "700" }}>opacity</Text> rather than a colour.
        </Text>
      </SectionCard>

      <SectionCard
        title="Android's back button"
        note="On Android, back is a system-level gesture people use constantly. A modal that ignores it feels broken."
      >
        <Code>{`<Modal onRequestClose={onClose}>          // the basic wiring

// For nested or conditional cases, subscribe explicitly:
BackHandler.addEventListener("hardwareBackPress", () => {
  onClose();
  return true;         // true = "handled", so the screen doesn't also pop
});
// return false would close the sheet AND navigate back. Both.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Running on {Platform.OS}. On iOS there’s no equivalent — the dismiss gesture is a swipe or
          the backdrop, which is why both are wired here.
        </Text>
      </SectionCard>

      <SectionCard
        title="Sheet or dialog"
        note="Not interchangeable, and the choice signals something before the user reads a word."
      >
        <Code>{`Bottom sheet   a list of ACTIONS. Dismissible by tapping away.
               Bottom of the screen — near the thumb.
               "Here are your options."

Centre dialog  a DECISION with consequences. Deliberately central,
               deliberately interrupting.
               "Are you sure?"

// A destructive confirmation in a bottom sheet is too easy to
// dismiss by accident — which is the opposite of what it's for.`}</Code>
      </SectionCard>

      <SectionCard
        title="Accessibility"
        note="Two props that decide whether a screen reader treats this as a layer or as more content."
      >
        <Code>{`accessibilityViewIsModal={true}   // iOS: everything behind is hidden
                                   // from VoiceOver, so it can't wander out

// The grabber is decorative — it gets no label, so it isn't
// announced as an unlabelled element.

// The backdrop Pressable DOES get accessibilityLabel="Close", or
// there's no way to dismiss without sight of the sheet.`}</Code>
      </SectionCard>

      <SectionCard
        title="When to reach for a library"
        note="This one is about 140 lines and covers the common case. There's a point where it stops being enough."
      >
        <Code>{`// @gorhom/bottom-sheet adds:
//   snap points (peek / half / full)
//   drag-to-dismiss with velocity
//   a scrollable body that hands scroll back to the sheet
//   keyboard-aware resizing

// All of those need gesture-handler and reanimated worklets.
// Build it yourself for a simple action sheet; take the dependency
// the moment you want a draggable one.`}</Code>
      </SectionCard>

      <BottomSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title="Profile photo"
        subtitle="Tap outside, swipe down, or press back to dismiss."
        actions={
          <>
            <Button
              label="Choose from library"
              onPress={() => {
                setSheet(false);
                toast.info("Library would open.");
              }}
            />
            <Button
              label="Take a photo"
              variant="ghost"
              onPress={() => {
                setSheet(false);
                toast.info("Camera would open.");
              }}
            />
            <Button
              label="Remove"
              variant="danger"
              onPress={() => {
                setSheet(false);
                setConfirm(true);
              }}
            />
            <Button label="Cancel" variant="ghost" onPress={() => setSheet(false)} />
          </>
        }
      >
        <Text style={[type.small, { color: colors.textMuted }]}>
          A sheet is for picking an action. Nothing here is destructive without a second step.
        </Text>
      </BottomSheet>

      <CenterModal
        visible={confirm}
        onClose={() => setConfirm(false)}
        title="Remove your photo?"
        message="This deletes the saved file from the device. It can't be undone."
        actions={
          <>
            {/* Cancel first, so it's the one a thumb reaches without aiming */}
            <Button label="Keep it" variant="ghost" onPress={() => setConfirm(false)} />
            <Button
              label="Remove"
              variant="danger"
              onPress={() => {
                setConfirm(false);
                toast.warning("Photo removed.", {
                  actionLabel: "Undo",
                  onAction: () => toast.success("Restored.")
                });
              }}
            />
          </>
        }
      />
    </Screen>
  );
}
