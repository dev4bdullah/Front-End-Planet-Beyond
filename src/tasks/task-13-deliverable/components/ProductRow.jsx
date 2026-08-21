import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme, useFavorites } from "../../../hooks";
import { spacing, radius, type } from "../../../theme";
import { formatPrice, titleCase } from "../../../data";

/* Takes onPress rather than navigation, so the same row works on Home,
   Search and Favorites. A component that navigates itself can only be used
   where that destination makes sense. */

export default function ProductRow({ product, onPress }) {
  const { colors } = useTheme();
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(product.id);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.border }}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatPrice(product.price)}`}
      style={({ pressed }) => [
        s.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={[s.thumb, { backgroundColor: colors.sunk }]}>
        <Text style={{ fontSize: 22 }}>{product.emoji ?? "📦"}</Text>
      </View>

      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[type.small, { color: colors.text, fontWeight: "700" }]} numberOfLines={1}>
          {product.title}
        </Text>
        <Text style={[type.tiny, { color: colors.textFaint }]} numberOfLines={1}>
          {titleCase(product.category ?? "")} · ★ {product.rating ?? "—"}
        </Text>
      </View>

      <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>
        {formatPrice(product.price)}
      </Text>

      {/* hitSlop, because a 20pt icon is below the 44pt minimum touch target */}
      <Pressable
        onPress={() => toggle(product.id)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={saved ? "Remove from favourites" : "Add to favourites"}
        accessibilityState={{ selected: saved }}
      >
        <Text style={{ fontSize: 18 }}>{saved ? "❤️" : "🤍"}</Text>
      </Pressable>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center"
  }
});
