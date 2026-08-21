import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, type } from "../theme";
import { TASKS, GROUPS } from "../shared/tasks";

const Stack = createNativeStackNavigator();

function TaskListScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + 96,
        paddingHorizontal: spacing.lg,
        gap: spacing.lg
      }}
    >
      <View style={{ gap: spacing.xs }}>
        <Text style={[type.tiny, { color: colors.brand, textTransform: "uppercase" }]}>
          Day 7 · React Native Basics
        </Text>
        <Text style={[type.display, { color: colors.text }]}>Twelve tasks</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>
          Eleven explainers plus the deliverable, which lives in the App tab.
        </Text>
      </View>

      {GROUPS.map(group => (
        <View key={group} style={{ gap: spacing.sm }}>
          <Text style={[type.tiny, { color: colors.textFaint, textTransform: "uppercase" }]}>
            {group}
          </Text>

          {TASKS.filter(task => task.group === group).map(task => (
            <Pressable
              key={task.key}
              onPress={() => navigation.navigate(task.key)}
              style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.sunk }]}
              android_ripple={{ color: colors.border }}
              accessibilityRole="button"
              accessibilityLabel={`Task ${task.num}, ${task.title}`}
            >
              <Text style={s.num}>{String(task.num).padStart(2, "0")}</Text>
              <Text style={[type.body, { color: colors.text, flex: 1 }]}>{task.label}</Text>
              <Text style={{ color: colors.textFaint }}>›</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

export default function TasksNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: type.heading,
        contentStyle: { backgroundColor: colors.bg }
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />

      {TASKS.map(task => (
        <Stack.Screen
          key={task.key}
          name={task.key}
          component={task.component}
          options={{ title: `${String(task.num).padStart(2, "0")} · ${task.title}` }}
        />
      ))}

      {/* Task 9's prose is a separate route, because a FlatList must not be
          nested inside a ScrollView — which is one of the things it teaches */}
      <Stack.Screen
        name="task09notes"
        component={TASKS.find(task => task.num === 9).notes}
        options={{ title: "09 · FlatList notes" }}
      />
    </Stack.Navigator>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  num: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"]
  }
});
