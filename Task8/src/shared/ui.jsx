import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../hooks/useTheme.jsx";
import { spacing, radius, type } from "../theme";
import { shadow } from "../theme/shadows";

/* The component kit. Every piece reads colours from theme context rather than
   importing a fixed palette, which is what makes task 11's light/dark switch
   reach the whole app without a single screen changing. */

export function Screen({ children, style, scroll = true, ...rest }) {
  const { colors } = useTheme();
  const Container = scroll ? ScrollView : View;

  return (
    <Container
      style={scroll ? { flex: 1 } : [{ flex: 1, backgroundColor: colors.bg }, style]}
      contentContainerStyle={
        scroll ? [{ padding: spacing.lg, gap: spacing.md, paddingBottom: 64 }, style] : undefined
      }
      {...rest}
    >
      {children}
    </Container>
  );
}

export function PageHeader({ number, title, brief, lead }) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[type.tiny, { color: colors.brand, textTransform: "uppercase" }]}>
        Day 8 · Task {number}
      </Text>
      <Text style={[type.display, { color: colors.text }]}>{title}</Text>
      {lead ? <Text style={[type.body, { color: colors.textMuted }]}>{lead}</Text> : null}
      {brief ? (
        <View style={[s.brief, { borderLeftColor: colors.brand }]}>
          <Text style={[type.small, { color: colors.textFaint }]}>Sheet description: {brief}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function SectionCard({ title, note, children, style }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        s.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadow(1),
        style
      ]}
    >
      {title ? <Text style={[type.heading, { color: colors.text }]}>{title}</Text> : null}
      {note ? <Text style={[type.small, { color: colors.textMuted }]}>{note}</Text> : null}
      {children}
    </View>
  );
}

export function Card({ children, style, onPress }) {
  const { colors } = useTheme();
  const body = (
    <View
      style={[
        s.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadow(1),
        style
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}>
      {body}
    </Pressable>
  );
}

export function Button({ label, onPress, variant = "primary", size = "md", disabled, style }) {
  const { colors } = useTheme();

  const background =
    variant === "primary"
      ? colors.brand
      : variant === "danger"
        ? colors.danger
        : variant === "ghost"
          ? colors.sunk
          : "transparent";

  const textColor = variant === "ghost" ? colors.text : "#fff";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: colors.border }}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        s.button,
        size === "sm" && s.buttonSm,
        {
          backgroundColor: background,
          borderColor: variant === "ghost" ? colors.border : background
        },
        disabled && { opacity: 0.45 },
        pressed && !disabled && { opacity: 0.85 },
        style
      ]}
    >
      <Text
        style={[size === "sm" ? type.tiny : type.small, { color: textColor, fontWeight: "700" }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({ label, tone = "neutral", style }) {
  const { colors } = useTheme();

  const tint =
    tone === "success"
      ? colors.success
      : tone === "warning"
        ? colors.warning
        : tone === "danger"
          ? colors.danger
          : tone === "brand"
            ? colors.brand
            : colors.textMuted;

  return (
    <View style={[s.badge, { borderColor: tint, backgroundColor: colors.sunk }, style]}>
      <Text style={[type.tiny, { color: tint }]}>{label}</Text>
    </View>
  );
}

export function Row({ children, style, gap = spacing.sm }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap }, style]}>
      {children}
    </View>
  );
}

export function Code({ children, style }) {
  const { colors } = useTheme();

  return (
    <View
      style={[s.codeBlock, { backgroundColor: colors.sunk, borderColor: colors.border }, style]}
    >
      <Text style={[s.codeText, { color: colors.textMuted }]}>{children}</Text>
    </View>
  );
}

export function KeyValue({ items }) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      {items.map(([key, value]) => (
        <View key={key} style={[s.kvRow, { borderBottomColor: colors.border }]}>
          <Text style={[type.small, { color: colors.textFaint }]}>{key}</Text>
          <Text style={[type.small, { color: colors.text, fontWeight: "600", flexShrink: 1 }]}>
            {String(value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function Divider({ style }) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

/* Shared list states, used by tasks 8, 9, 12 and the deliverable, so the four
   states look identical everywhere rather than being re-invented per screen. */

export function ErrorState({ error, onRetry }) {
  const { colors } = useTheme();

  return (
    <View style={s.state}>
      <Text style={{ fontSize: 30 }}>{error?.kind === "network" ? "📡" : "⚠️"}</Text>
      <Text style={[type.heading, { color: colors.text }]}>
        {error?.kind === "network" ? "You're offline" : "Something went wrong"}
      </Text>
      <Text style={[type.small, { color: colors.textMuted, textAlign: "center" }]}>
        {error?.message ?? "Unknown error."}
      </Text>
      {error?.status ? <Badge label={`status ${error.status}`} tone="danger" /> : null}
      {onRetry ? (
        <Button label="Try again" onPress={onRetry} style={{ marginTop: spacing.sm }} />
      ) : null}
    </View>
  );
}

export function EmptyState({ title = "Nothing here", message, action }) {
  const { colors } = useTheme();

  return (
    <View style={s.state}>
      <Text style={{ fontSize: 30 }}>🔍</Text>
      <Text style={[type.heading, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[type.small, { color: colors.textMuted, textAlign: "center" }]}>
          {message}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

export function SkeletonRow({ height = 64 }) {
  const { colors } = useTheme();
  return <View style={{ height, borderRadius: radius.md, backgroundColor: colors.sunk }} />;
}

export const styles = StyleSheet.create({
  note: { fontSize: 13, lineHeight: 20 },
  codeInline: { fontWeight: "700" }
});

const s = StyleSheet.create({
  brief: { borderLeftWidth: 3, paddingLeft: spacing.md, marginTop: spacing.xs },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonSm: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  codeBlock: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
  codeText: { fontSize: 11, lineHeight: 18, fontFamily: undefined },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1
  },
  state: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg
  }
});
