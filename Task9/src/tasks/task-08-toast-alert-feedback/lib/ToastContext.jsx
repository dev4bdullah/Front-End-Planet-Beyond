import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform, AccessibilityInfo } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../../hooks/useTheme.jsx";
import { spacing, radius, type } from "../../../theme";
import { shadow } from "../../../theme/shadows";

/* Task 8 — a toast system, because React Native has no cross-platform one.

   ToastAndroid exists and is Android-only. Alert is modal and blocking. A
   toast has to be built, and the interesting decisions are about when NOT to
   use it. */

const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children, duration = 3500, max = 3 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => setToasts(list => list.filter(toast => toast.id !== id)), []);

  const push = useCallback(
    (tone, message, options = {}) => {
      const id = ++nextId;

      /* Haptics carry the same signal as the colour, for anyone who doesn't
         see the toast at all. Errors get a heavier tap than successes. */
      if (tone === "error")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      else if (tone === "success")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      else if (tone === "warning")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

      // A screen reader gets the message spoken; a visual toast alone is invisible to it
      AccessibilityInfo.announceForAccessibility?.(message);

      setToasts(list => [...list, { id, tone, message, ...options }].slice(-max));
      return id;
    },
    [max]
  );

  const value = useMemo(
    () => ({
      toast: {
        success: (message, options) => push("success", message, options),
        error: (message, options) => push("error", message, options),
        warning: (message, options) => push("warning", message, options),
        info: (message, options) => push("info", message, options)
      },
      dismiss,
      clear: () => setToasts([])
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} duration={duration} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss, duration }) {
  const insets = useSafeAreaInsets();

  if (!toasts.length) return null;

  return (
    /* pointerEvents="box-none" so the area around a toast stays tappable —
       a full-width overlay that swallows touches is a real bug, not a nicety. */
    <View
      style={[s.viewport, { bottom: insets.bottom + spacing.lg }]}
      pointerEvents="box-none"
      accessibilityLiveRegion="polite"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} duration={duration} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

function ToastItem({ id, tone, message, actionLabel, onAction, sticky, duration, onDismiss }) {
  const { colors } = useTheme();

  useEffect(() => {
    // Errors and anything with an action wait for the user
    if (sticky || onAction) return undefined;

    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, sticky, onAction, onDismiss]);

  const tint =
    tone === "success"
      ? colors.success
      : tone === "error"
        ? colors.danger
        : tone === "warning"
          ? colors.warning
          : colors.brand;

  return (
    <View
      style={[
        s.toast,
        { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: tint },
        shadow(2)
      ]}
    >
      <Text style={[type.small, { color: colors.text, flex: 1 }]}>{message}</Text>

      {onAction ? (
        <Pressable
          onPress={() => {
            onAction();
            onDismiss(id);
          }}
          hitSlop={10}
          accessibilityRole="button"
        >
          <Text style={[type.tiny, { color: tint, fontWeight: "700" }]}>
            {actionLabel ?? "Undo"}
          </Text>
        </Pressable>
      ) : null}

      <Pressable onPress={() => onDismiss(id)} hitSlop={10} accessibilityLabel="Dismiss">
        <Text style={{ color: colors.textFaint, fontSize: 16 }}>×</Text>
      </Pressable>
    </View>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a <ToastProvider>");
  return context;
}

export const TOAST_PLATFORM_NOTE = Platform.select({
  android: "ToastAndroid exists natively, but it can't hold an action button.",
  ios: "iOS has no system toast at all — this is the only option.",
  default: "No system toast on this platform."
});

const s = StyleSheet.create({
  viewport: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  }
});
