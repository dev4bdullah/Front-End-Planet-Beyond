import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { useTheme } from "../../hooks";
import { type } from "../../theme";
import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";
import SearchScreen from "./screens/SearchScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Tabs = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const ICONS = { HomeTab: "🏠", SearchTab: "🔍", FavoritesTab: "❤️", ProfileTab: "👤" };

/* Task 2 — a stack inside a tab.

   Details lives in the Home tab's stack, not at the root, so pushing it keeps
   the tab bar visible and the back gesture returns to the list. Putting it at
   the root would cover the tabs, which is right for a modal and wrong here. */
function HomeStackNavigator() {
  const { colors } = useTheme();

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: type.heading,
        contentStyle: { backgroundColor: colors.bg }
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen
        name="Details"
        component={DetailsScreen}
        /* The title comes from the route params, so the header says which
           product before the fetch finishes. */
        options={({ route }) => ({
          title: route.params?.title ?? `Product ${route.params?.id ?? ""}`,
          headerBackTitle: "Back"
        })}
      />
    </HomeStack.Navigator>
  );
}

export default function DeliverableTabs() {
  const { colors } = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: type.tiny,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
            {ICONS[route.name] ?? "•"}
          </Text>
        )
      })}
    >
      <Tabs.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: "Home" }} />
      <Tabs.Screen name="SearchTab" component={SearchScreen} options={{ title: "Search" }} />
      <Tabs.Screen name="FavoritesTab" component={FavoritesScreen} options={{ title: "Saved" }} />
      <Tabs.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tabs.Navigator>
  );
}
