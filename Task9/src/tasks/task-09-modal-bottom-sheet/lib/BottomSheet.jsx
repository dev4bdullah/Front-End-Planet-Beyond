import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  BackHandler,
  Platform
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../hooks/useTheme.jsx";
import { spacing, radius, type } from "../../../theme";

/* Task 9 — a reusable bottom sheet built on RN's own Modal.

   Why Modal rather than an absolutely-positioned View: Modal renders in a
   separate native window, so it sits above everything including a navigation
   header, and it takes the hardware back button on Android for free. */

export default function BottomSheet({ visible, onClose, title, subtitle, children, actions }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  /* useState's lazy initialiser, not useRef().current — reading .current
     during render isn't allowed, and the Animated.Value must be created
     exactly once. */
  const [translate] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.timing(translate, {
      toValue: visible ? 0 : 1,
      duration: visible ? 220 : 160,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      /* useNativeDriver moves the animation to the UI thread, so it keeps
         running smoothly even while JS is busy. Only transform and opacity
         qualify — animating height or backgroundColor here throws. */
      useNativeDriver: true
    }).start();
  }, [visible, translate]);

  /* Android's hardware back should close the sheet, not leave the screen.
     Modal handles this via onRequestClose, but a nested sheet needs the
     explicit subscription — and returning true means "handled". */
  useEffect(() => {
    if (!visible || Platform.OS !== "android") return undefined;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose?.();
      return true;
    });

    return () => subscription.remove();
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* The backdrop is a Pressable so a tap outside dismisses. The sheet
          itself is NOT inside it, or every tap on the sheet would close it. */}
      <Pressable
        style={[s.backdrop, { backgroundColor: colors.overlay }]}
        onPress={onClose}
        accessibilityLabel="Close"
      />

      <Animated.View
        style={[
          s.sheet,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingBottom: insets.bottom + spacing.lg,
            transform: [
              {
                translateY: translate.interpolate({ inputRange: [0, 1], outputRange: [0, 600] })
              }
            ]
          }
        ]}
        accessibilityViewIsModal
      >
        <View style={[s.grabber, { backgroundColor: colors.border }]} />

        {title ? (
          <View style={{ gap: 2 }}>
            <Text style={[type.heading, { color: colors.text }]}>{title}</Text>
            {subtitle ? (
              <Text style={[type.small, { color: colors.textMuted }]}>{subtitle}</Text>
            ) : null}
          </View>
        ) : null}

        {children}

        {actions ? <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>{actions}</View> : null}
      </Animated.View>
    </Modal>
  );
}

/* A centred dialog, for confirmations. Same Modal, different geometry —
   which is the argument for keeping both in one file. */
export function CenterModal({ visible, onClose, title, message, actions }) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[s.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />

      <View style={s.centerWrap} pointerEvents="box-none">
        <View
          style={[s.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityViewIsModal
        >
          <Text style={[type.heading, { color: colors.text }]}>{title}</Text>
          {message ? (
            <Text style={[type.small, { color: colors.textMuted }]}>{message}</Text>
          ) : null}
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>{actions}</View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.xs
  },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  dialog: {
    width: "100%",
    maxWidth: 380,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm
  }
});
