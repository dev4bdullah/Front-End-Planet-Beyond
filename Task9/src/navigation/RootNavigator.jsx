import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { useTheme } from "../hooks";
import { type } from "../theme";
import TasksNavigator from "./TasksNavigator";
import ProfileScreen from "../tasks/task-13-deliverable/screens/ProfileScreen";

const Tabs = createBottomTabNavigator();

const ICONS = { Tasks: "📋", Profile: "👤" };

export default function RootNavigator() {
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
      <Tabs.Screen name="Tasks" component={TasksNavigator} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: "Deliverable" }} />
    </Tabs.Navigator>
  );
}
