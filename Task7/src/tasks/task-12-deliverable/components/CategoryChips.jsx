import { ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius, type } from "../../../theme";

export default function CategoryChips({ categories, active, onChange }) {
  return (
    /* horizontal ScrollView, not FlatList — a handful of chips doesn't need
       windowing, and FlatList's overhead would be the wrong trade */
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
    >
      {categories.map(category => {
        const selected = category === active;

        return (
          <Pressable
            key={category}
            onPress={() => onChange(category)}
            style={[s.chip, selected && s.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              style={[
                type.small,
                { color: selected ? "#fff" : colors.textMuted, fontWeight: "600" }
              ]}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderColor: colors.border
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand }
});
