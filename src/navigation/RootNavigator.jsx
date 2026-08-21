import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { useTheme } from "../hooks";
import { type } from "../theme";
import DrawerContent from "./DrawerContent";
import TasksNavigator from "./TasksNavigator";
import DeliverableTabs from "../tasks/task-13-deliverable/Navigator";
import { SettingsScreen, HelpScreen, AboutScreen, NotFoundScreen } from "./SimpleScreens";

const Drawer = createDrawerNavigator();
const RootStack = createNativeStackNavigator();

const ICONS = { Tasks: "📋", App: "📱" };

/* Task 3 + 4 — a drawer wrapping the tabs.

   The order matters and is a real design decision:

     Drawer  → rare destinations (settings, help, about)
       Tabs  → the 3–5 places people actually live
         Stack → drilling into a detail

   Inverting it — tabs containing a drawer — gives every tab its own drawer,
   which is almost never what anyone means. */
function MainDrawer() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: { backgroundColor: colors.surface, width: 290 },
        drawerActiveTintColor: colors.brand,
        drawerInactiveTintColor: colors.textMuted,
        drawerActiveBackgroundColor: colors.brandSoft,
        drawerLabelStyle: type.small,
        // Only the Home tab swipes open the drawer — otherwise the gesture
        // fights the back-swipe on a pushed detail screen
        swipeEdgeWidth: 40
      }}
    >
      <Drawer.Screen
        name="App"
        component={DeliverableTabs}
        options={{
          title: "Shop",
          drawerIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>🛍️</Text>
          )
        }}
      />
      <Drawer.Screen
        name="Tasks"
        component={TasksNavigator}
        options={{
          title: "Task screens",
          drawerIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>{ICONS.Tasks}</Text>
          )
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 18 }}>⚙️</Text> }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 18 }}>❓</Text> }}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 18 }}>ℹ️</Text> }}
      />
    </Drawer.Navigator>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg }
      }}
    >
      <RootStack.Screen name="Main" component={MainDrawer} options={{ headerShown: false }} />
      <RootStack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Not found" }}
      />
    </RootStack.Navigator>
  );
}
