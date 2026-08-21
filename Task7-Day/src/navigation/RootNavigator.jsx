import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { colors, type } from "../theme";
import TasksNavigator from "./TasksNavigator";
import DeliverableNavigator from "../tasks/task-12-deliverable/Navigator";

const Tabs = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: type.tiny
      }}
    >
      <Tabs.Screen
        name="Tasks"
        component={TasksNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>📋</Text>
          )
        }}
      />
      <Tabs.Screen
        name="App"
        component={DeliverableNavigator}
        options={{
          title: "Deliverable",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>📱</Text>
          )
        }}
      />
    </Tabs.Navigator>
  );
}
