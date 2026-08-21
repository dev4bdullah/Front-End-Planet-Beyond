import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius, type } from "../../../theme";
import { shadow } from "../../../theme/shadows";
import { formatPrice } from "../../../data";

export default function ProductCard({ product, onPress, width }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.card, { width }, pressed && s.pressed]}
      android_ripple={{ color: colors.border }}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
    >
      <View style={s.thumb}>
        <Text style={{ fontSize: 34 }}>{product.emoji}</Text>
      </View>

      <View style={{ gap: 2, padding: spacing.md }}>
        <Text style={[type.small, { color: colors.text, fontWeight: "700" }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[type.tiny, { color: colors.textFaint }]}>{product.category}</Text>

        <View style={s.footer}>
          <Text style={[type.body, { color: colors.text, fontWeight: "700" }]}>
            {formatPrice(product.price)}
          </Text>
          <Text style={[type.tiny, { color: colors.warning }]}>★ {product.rating}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow(1)
  },
  pressed: { opacity: 0.85 },
  thumb: {
    height: 96,
    backgroundColor: colors.sunk,
    alignItems: "center",
    justifyContent: "center"
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs
  }
});
