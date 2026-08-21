import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { Screen, PageHeader, SectionCard, Code, Button, Row, Badge } from "../../shared/ui";
import { useTheme, useFavorites } from "../../hooks";
import { type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { count } = useFavorites();

  return (
    <Screen>
      <PageHeader
        number={3}
        title="Bottom Tabs"
        brief="Add tab navigation for Home, Search, Favorites, and Profile screens"
        lead="Three to five destinations, always visible, one tap apart. More than five and it stops being navigation and starts being a menu."
      />

      <SectionCard
        title="The four tabs in this app"
        note="Open the Shop section from the drawer to use them. Each is a top-level destination, not a step in a flow."
      >
        <Code>{`<Tabs.Navigator screenOptions={({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: colors.brand,
  tabBarIcon: ({ focused }) => <Icon name={route.name} focused={focused} />
})}>
  <Tabs.Screen name="HomeTab"      component={HomeStackNavigator} options={{ title: "Home" }} />
  <Tabs.Screen name="SearchTab"    component={SearchScreen} />
  <Tabs.Screen name="FavoritesTab" component={FavoritesScreen} />
  <Tabs.Screen name="ProfileTab"   component={ProfileScreen} />
</Tabs.Navigator>`}</Code>

        <Row>
          <Button
            label="Go to the Shop tabs"
            size="sm"
            onPress={() => navigation.navigate("App")}
          />
          <Badge label={`${count} favourites`} tone={count > 0 ? "success" : "neutral"} />
        </Row>
      </SectionCard>

      <SectionCard
        title="A tab holding a stack"
        note="HomeTab isn't a screen — it's a whole stack navigator. That's what lets you drill into a product and still see the tab bar."
      >
        <Code>{`<Tabs.Screen name="HomeTab" component={HomeStackNavigator} />

// Each tab keeps its own history. Drill into a product on Home,
// switch to Search, come back — you're still on the product.
// That per-tab memory is why people expect tabs to work this way.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The screen name and the tab title are deliberately different:{" "}
          <Text style={{ fontWeight: "700" }}>HomeTab</Text> vs{" "}
          <Text style={{ fontWeight: "700" }}>Home</Text>. Two routes in one tree can’t share a
          name, and the stack’s first screen is already called Home.
        </Text>
      </SectionCard>

      <SectionCard
        title="Badges"
        note="A count on a tab is the cheapest way to signal state the user can't currently see."
      >
        <Code>{`<Tabs.Screen
  name="FavoritesTab"
  component={FavoritesScreen}
  options={{ tabBarBadge: count > 0 ? count : undefined }}
/>

// undefined, not 0 — passing 0 renders a badge reading "0",
// which is worse than no badge at all.`}</Code>
      </SectionCard>

      <SectionCard
        title="Resetting a tab's stack on re-tap"
        note="Tapping the tab you're already on should go back to its root. iOS users expect this and it isn't the default."
      >
        <Code>{`<Tabs.Screen
  name="HomeTab"
  component={HomeStackNavigator}
  listeners={({ navigation }) => ({
    tabPress: event => {
      if (navigation.isFocused()) {
        event.preventDefault();
        navigation.navigate("HomeTab", { screen: "Home" });
      }
    }
  })}
/>`}</Code>
      </SectionCard>

      <SectionCard
        title="Tabs, drawer, or both"
        note="They answer different questions, and using a drawer for primary navigation is the classic mistake."
      >
        <Code>{`Tabs    → 3–5 places people live. Visible, so they're discoverable.
Drawer  → rarely-visited destinations. Hidden, so they're not.

// Hiding your main navigation behind a hamburger measurably reduces
// how often people use it. If it matters, it goes in a tab.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          This app uses both, in that order: a drawer for Settings, Help and About; tabs for the
          four places you actually go.
        </Text>
      </SectionCard>

      <SectionCard
        title="Touch targets"
        note="The tab bar is at the bottom because that's where thumbs are. Two details make it usable."
      >
        <Code>{`// 44pt minimum touch target (Apple) / 48dp (Material).
// The tab bar handles this for you; custom icons elsewhere don't —
// use hitSlop when the icon is smaller than the target.

<Pressable hitSlop={12}>…</Pressable>`}</Code>
      </SectionCard>
    </Screen>
  );
}
