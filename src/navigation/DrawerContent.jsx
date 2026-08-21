import { View, Text, Pressable, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useTheme, useFavorites } from "../hooks";
import { spacing, radius, type } from "../theme";
import { profile } from "../data";

/* Task 4 — a custom drawer body.

   DrawerItemList renders the registered screens; everything around it is
   yours. The header and footer are the reason to write a custom content
   component at all. */

export default function DrawerContent(props) {
  const { colors, mode, cycle } = useTheme();
  const { count } = useFavorites();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 0 }}
      style={{ backgroundColor: colors.surface }}
    >
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <View style={[s.avatar, { backgroundColor: colors.sunk, borderColor: colors.border }]}>
          <Text style={{ fontSize: 24 }}>👨‍💻</Text>
        </View>
        <Text style={[type.heading, { color: colors.text }]}>{profile.name}</Text>
        <Text style={[type.tiny, { color: colors.textFaint }]}>{profile.handle}</Text>
        <View style={[s.pill, { backgroundColor: colors.brandSoft }]}>
          <Text style={[type.tiny, { color: colors.brand }]}>{count} favourites</Text>
        </View>
      </View>

      <View style={{ paddingTop: spacing.sm }}>
        <DrawerItemList {...props} />
      </View>

      <View style={[s.footer, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={cycle}
          style={[s.footerBtn, { backgroundColor: colors.sunk, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={`Theme: ${mode}. Tap to change.`}
        >
          <Text style={[type.small, { color: colors.text }]}>Theme</Text>
          <Text style={[type.tiny, { color: colors.brand }]}>{mode}</Text>
        </Pressable>

        <Text style={[type.tiny, { color: colors.textFaint, textAlign: "center" }]}>
          Day 8 · React Navigation & APIs
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    gap: spacing.xs,
    borderBottomWidth: 1
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    marginTop: spacing.xs
  },
  footer: { padding: spacing.lg, gap: spacing.sm, borderTopWidth: 1, marginTop: spacing.md },
  footerBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  }
});
