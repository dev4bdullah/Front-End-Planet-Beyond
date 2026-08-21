import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { colors, type } from "../../theme";
import HomeScreen from "./screens/HomeScreen";
import ListingScreen from "./screens/ListingScreen";
import DetailsScreen from "./screens/DetailsScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONS = { Home: "🏠", Listing: "🛍️", Profile: "👤" };

function TabIcon({ route, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{ICONS[route.name] ?? "•"}</Text>
  );
}

function ShopTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        // headerShown: false — each screen draws its own header using safe
        // area insets, which is task 6's point applied
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: type.tiny,
        tabBarIcon: ({ focused }) => <TabIcon route={route} focused={focused} />
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Listing" component={ListingScreen} options={{ title: "Shop" }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

/* Details sits in a stack ABOVE the tabs, not inside one of them — so it
   covers the tab bar and gets a native back gesture, which is what a detail
   view should do on both platforms. */
export default function DeliverableNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: type.heading,
        contentStyle: { backgroundColor: colors.bg }
      }}
    >
      <Stack.Screen name="Tabs" component={ShopTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: "Product", headerBackTitle: "Back" }}
      />
    </Stack.Navigator>
  );
}
