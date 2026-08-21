import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius, type } from "../theme";
import { shadow } from "../theme/shadows";

/* Shared primitives used by every task screen. Deliberately small — task 4
   covers the built-in components these are built from. */

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style, onPress }) {
  const content = <View style={[styles.card, style]}>{children}</View>;

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      /* android_ripple is the platform-correct press feedback on Android;
         the style callback handles iOS. Task 7 goes into this. */
      android_ripple={{ color: colors.brandSoft }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function SectionCard({ title, note, children, style }) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        {children}
      </View>
    </View>
  );
}

export function PageHeader({ number, title, brief, lead }) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>DAY 7 · TASK {number}</Text>
      <Text style={styles.pageTitle}>{title}</Text>
      {lead ? <Text style={styles.lead}>{lead}</Text> : null}
      {brief ? <Text style={styles.brief}>Sheet description: {brief}</Text> : null}
    </View>
  );
}

export function Button({ label, onPress, variant = "primary", size = "md", disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={disabled ? undefined : { color: "rgba(255,255,255,0.16)" }}
      /* hitSlop enlarges the touch target without changing the layout —
         a 32pt button is below the 44pt minimum without it. */
      hitSlop={8}
      style={({ pressed }) => [
        styles.btn,
        styles[`btn_${variant}`],
        size === "sm" && styles.btn_sm,
        disabled && styles.btn_disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
    >
      <Text
        style={[
          styles.btnLabel,
          styles[`btnLabel_${variant}`],
          size === "sm" && styles.btnLabel_sm
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({ label, tone = "neutral", style }) {
  return (
    <View style={[styles.badge, styles[`badge_${tone}`], style]}>
      <Text style={[styles.badgeText, styles[`badgeText_${tone}`]]}>{label}</Text>
    </View>
  );
}

export function Row({ children, style, gap = spacing.sm }) {
  return <View style={[styles.row, { gap }, style]}>{children}</View>;
}

export function Code({ children, style }) {
  return (
    <View style={[styles.codeBlock, style]}>
      <Text style={styles.codeText}>{children}</Text>
    </View>
  );
}

export function KeyValue({ items }) {
  return (
    <View style={styles.kv}>
      {items.map(([key, value]) => (
        <View key={key} style={styles.kvRow}>
          <Text style={styles.kvKey}>{key}</Text>
          <Text style={styles.kvValue}>{String(value)}</Text>
        </View>
      ))}
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  header: { gap: spacing.xs, marginBottom: spacing.sm },
  eyebrow: { ...type.tiny, color: colors.brand },
  pageTitle: { ...type.display, color: colors.text },
  lead: { ...type.body, color: colors.textMuted, lineHeight: 22 },
  brief: {
    ...type.small,
    color: colors.textFaint,
    borderLeftWidth: 2,
    borderLeftColor: colors.brand,
    paddingLeft: spacing.sm,
    lineHeight: 19
  },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow(1)
  },
  sectionHead: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  sectionTitle: { ...type.heading, color: colors.text },
  sectionBody: { padding: spacing.lg, gap: spacing.md },
  note: { ...type.small, color: colors.textMuted, lineHeight: 20 },

  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs
  },

  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },

  btn: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: colors.brand
  },
  btn_primary: { backgroundColor: colors.brand },
  btn_ghost: { backgroundColor: colors.sunk, borderColor: colors.border },
  btn_danger: { backgroundColor: colors.danger },
  btn_success: { backgroundColor: colors.success },
  btn_sm: { minHeight: 34, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  btn_disabled: { opacity: 0.45 },

  btnLabel: { ...type.body, fontWeight: "700", color: "#fff" },
  btnLabel_ghost: { color: colors.text },
  btnLabel_primary: { color: "#fff" },
  btnLabel_danger: { color: "#fff" },
  btnLabel_success: { color: "#07120a" },
  btnLabel_sm: { ...type.small, fontWeight: "700" },

  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.sunk,
    alignSelf: "flex-start"
  },
  badge_neutral: { backgroundColor: colors.sunk },
  badge_brand: { backgroundColor: colors.brandSoft },
  badge_success: { backgroundColor: "rgba(34,197,94,0.16)" },
  badge_warning: { backgroundColor: "rgba(245,158,11,0.16)" },
  badge_danger: { backgroundColor: "rgba(239,68,68,0.16)" },

  badgeText: { ...type.tiny, color: colors.textMuted },
  badgeText_neutral: { color: colors.textMuted },
  badgeText_brand: { color: colors.brand },
  badgeText_success: { color: colors.success },
  badgeText_warning: { color: colors.warning },
  badgeText_danger: { color: colors.danger },

  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },

  codeBlock: {
    backgroundColor: colors.sunk,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  },
  codeText: { ...type.mono, color: "#c7d2fe", lineHeight: 19 },

  kv: { gap: spacing.xs },
  kvRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  kvKey: { ...type.small, color: colors.textFaint },
  kvValue: { ...type.small, color: colors.text, flexShrink: 1, textAlign: "right" },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }
});
