import { ScrollView, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../hooks";
import { spacing, type } from "../theme";
import { SectionCard, Button, Badge } from "../shared/ui";

/* Task 4 — the drawer's secondary destinations. Deliberately small: a drawer
   is for things you visit rarely, which is exactly what these are. */

function Shell({ title, children }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + 64,
        gap: spacing.md
      }}
    >
      <Text style={[type.display, { color: colors.text }]}>{title}</Text>
      {children}
    </ScrollView>
  );
}

export function SettingsScreen() {
  const { mode, resolved, system, cycle } = useTheme();

  return (
    <Shell title="Settings">
      <SectionCard
        title="Theme"
        note="Persisted with AsyncStorage, resolved through context. Changing it here reaches every screen without a single one importing a palette."
      >
        <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
          <Badge label={`mode: ${mode}`} tone="brand" />
          <Badge label={`system: ${system ?? "unknown"}`} />
          <Badge label={`resolved: ${resolved}`} tone="success" />
        </View>
        <Button label="Cycle theme" onPress={cycle} />
      </SectionCard>

      <SectionCard
        title="Why this screen is in the drawer"
        note="A drawer holds destinations you visit occasionally and don't want costing a permanent tab slot. Settings is the canonical example."
      >
        <Text />
      </SectionCard>
    </Shell>
  );
}

export function HelpScreen() {
  return (
    <Shell title="Help">
      <SectionCard
        title="Getting around"
        note="Swipe from the left edge, or tap the ☰ badge on Home, to open the drawer. The bottom tabs stay put while the drawer covers them."
      >
        <Text />
      </SectionCard>
      <SectionCard
        title="Deep links"
        note="Task 6 lists the URLs this app answers to. day8://product/4 opens a product directly, even from a cold start."
      >
        <Text />
      </SectionCard>
    </Shell>
  );
}

export function AboutScreen() {
  const { colors } = useTheme();

  return (
    <Shell title="About">
      <SectionCard
        title="Day 8 — React Navigation & APIs"
        note="Thirteen tasks: navigation containers, stacks, tabs, a drawer, route params, deep linking, an API service layer, data screens, pull-to-refresh, AsyncStorage, custom hooks, search and favourites."
      >
        <Text style={[type.small, { color: colors.textMuted }]}>
          Built with Expo, React Navigation 7 and dummyjson.com.
        </Text>
      </SectionCard>
    </Shell>
  );
}

export function NotFoundScreen({ route }) {
  const { colors } = useTheme();

  return (
    <Shell title="Not found">
      <SectionCard
        title="No route matched"
        note="A deep link pointed at something this app doesn't have. Handling that explicitly beats silently opening the home screen, which looks like the link was ignored."
      >
        <Text style={[type.tiny, { color: colors.textFaint }]}>
          params: {JSON.stringify(route?.params ?? {})}
        </Text>
      </SectionCard>
    </Shell>
  );
}
