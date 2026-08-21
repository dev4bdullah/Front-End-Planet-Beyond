import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../hooks";
import { spacing, radius, type } from "../theme";
import { TASKS, GROUPS } from "../shared/tasks";

const Stack = createNativeStackNavigator();

function TaskListScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + 64,
        paddingHorizontal: spacing.lg,
        gap: spacing.lg
      }}
    >
      <View style={{ gap: spacing.xs }}>
        <Text style={[type.tiny, { color: colors.brand, textTransform: "uppercase" }]}>
          Day 9 · Native Features & UX
        </Text>
        <Text style={[type.display, { color: colors.text }]}>Thirteen tasks</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>
          Twelve explainers plus the deliverable, on the Profile tab.
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
              android_ripple={{ color: colors.border }}
              accessibilityRole="button"
              accessibilityLabel={`Task ${task.num}, ${task.title}`}
              style={({ pressed }) => [
                s.row,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={[s.num, { color: colors.textFaint }]}>
                {String(task.num).padStart(2, "0")}
              </Text>
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
  const { colors } = useTheme();

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
    </Stack.Navigator>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  num: { fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"] }
});
