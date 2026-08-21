import { ScrollView, View, Text, Switch, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useFavorites, useAsyncStorage } from "../../../hooks";
import { spacing, radius, type } from "../../../theme";
import { profile } from "../../../data";
import { Button, Badge, Row } from "../../../shared/ui";

export default function ProfileScreen() {
  const { colors, mode, resolved, cycle, system } = useTheme();
  const insets = useSafeAreaInsets();
  const { count, clear } = useFavorites();

  const [prefs, setPrefs] = useAsyncStorage("day8.prefs", {
    notifications: true,
    dataSaver: false,
    analytics: false
  });

  const set = (key, value) => setPrefs(current => ({ ...current, [key]: value }));

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + 96,
        gap: spacing.lg
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ alignItems: "center", gap: spacing.sm }}>
        <View style={[s.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 34 }}>👨‍💻</Text>
        </View>
        <Text style={[type.title, { color: colors.text }]}>{profile.name}</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>{profile.handle}</Text>
        <Badge label={`${profile.role} · ${profile.location}`} tone="brand" />
      </View>

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        {profile.stats.map(stat => (
          <View
            key={stat.label}
            style={[s.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[type.title, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[type.tiny, { color: colors.textFaint }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.heading, { color: colors.text }]}>Appearance</Text>
        <View style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[type.small, { color: colors.text, fontWeight: "600" }]}>Theme</Text>
            <Text style={[type.tiny, { color: colors.textFaint }]}>
              {mode === "system"
                ? `Following the system (${system ?? "unknown"} → ${resolved})`
                : `Forced ${mode}`}
            </Text>
          </View>
          <Button label={mode} size="sm" variant="ghost" onPress={cycle} />
        </View>
        <Text style={[type.tiny, { color: colors.textFaint }]}>
          Three modes, not two — a phone already has a global preference, and ignoring it is a small
          rudeness. Persisted to AsyncStorage.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.heading, { color: colors.text }]}>Preferences</Text>
        {[
          ["notifications", "Push notifications", "Order updates and price drops"],
          ["dataSaver", "Data saver", "Load smaller images on mobile data"],
          ["analytics", "Share analytics", "Anonymous usage statistics"]
        ].map(([key, label, hint]) => (
          <View
            key={key}
            style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[type.small, { color: colors.text, fontWeight: "600" }]}>{label}</Text>
              <Text style={[type.tiny, { color: colors.textFaint }]}>{hint}</Text>
            </View>
            <Switch
              value={prefs[key]}
              onValueChange={value => set(key, value)}
              trackColor={{ false: colors.border, true: colors.brand }}
              thumbColor="#fff"
              accessibilityLabel={label}
            />
          </View>
        ))}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.heading, { color: colors.text }]}>Storage</Text>
        <Row>
          <Badge label={`${count} favourites`} tone={count > 0 ? "success" : "neutral"} />
          <Badge label="3 keys" />
        </Row>
        <Button label="Clear favourites" variant="danger" onPress={clear} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  stat: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: "center",
    gap: 2
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  }
});
