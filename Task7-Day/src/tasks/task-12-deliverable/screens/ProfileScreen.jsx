import { useState } from "react";
import { ScrollView, View, Text, Switch, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, type } from "../../../theme";
import { profile } from "../../../data";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState(
    Object.fromEntries(profile.settings.map(item => [item.key, item.value]))
  );

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + 96,
        gap: spacing.lg
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg }}>
        <View style={s.avatar}>
          <Text style={{ fontSize: 34 }}>👨‍💻</Text>
        </View>
        <Text style={[type.title, { color: colors.text }]}>{profile.name}</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>{profile.handle}</Text>
        <View style={s.rolePill}>
          <Text style={[type.tiny, { color: colors.brand }]}>
            {profile.role} · {profile.location}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg }}>
        {profile.stats.map(stat => (
          <View key={stat.label} style={s.stat}>
            <Text style={[type.title, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[type.tiny, { color: colors.textFaint }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <Text style={[type.heading, { color: colors.text }]}>About</Text>
        <View style={s.card}>
          <Text style={[type.body, { color: colors.textMuted }]}>{profile.bio}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <Text style={[type.heading, { color: colors.text }]}>Settings</Text>

        {profile.settings.map(setting => (
          <View key={setting.key} style={s.settingRow}>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={[type.small, { color: colors.text, fontWeight: "600" }]}>
                {setting.label}
              </Text>
              {setting.hint ? (
                <Text style={[type.tiny, { color: colors.textFaint }]}>{setting.hint}</Text>
              ) : null}
            </View>

            {/* Switch is one of the few components that looks genuinely
                different per platform, and that's correct — it should look
                native on each. */}
            <Switch
              value={settings[setting.key]}
              onValueChange={value =>
                setSettings(previous => ({ ...previous, [setting.key]: value }))
              }
              trackColor={{ false: colors.border, true: colors.brand }}
              thumbColor="#fff"
              accessibilityLabel={setting.label}
            />
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        {["Order history", "Payment methods", "Help centre"].map(label => (
          <Pressable
            key={label}
            style={({ pressed }) => [s.linkRow, pressed && { backgroundColor: colors.sunk }]}
            android_ripple={{ color: colors.border }}
            accessibilityRole="button"
          >
            <Text style={[type.small, { color: colors.text }]}>{label}</Text>
            <Text style={{ color: colors.textFaint }}>›</Text>
          </Pressable>
        ))}

        <Pressable style={s.signOut} accessibilityRole="button">
          <Text style={[type.small, { color: colors.danger, fontWeight: "700" }]}>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  rolePill: {
    backgroundColor: colors.sunk,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: 2
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  },
  signOut: {
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger
  }
});
