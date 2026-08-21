import { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, type } from "../../../theme";
import { shadow } from "../../../theme/shadows";
import { products, formatPrice } from "../../../data";

export default function DetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);

  const product = products.find(item => item.id === route.params?.id);

  if (!product) {
    return (
      <View style={[s.missing, { paddingTop: insets.top + spacing.xxl }]}>
        <Text style={{ fontSize: 30 }}>🤔</Text>
        <Text style={[type.heading, { color: colors.text }]}>Product not found</Text>
        <Pressable style={s.primary} onPress={() => navigation.goBack()}>
          <Text style={s.primaryLabel}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + 140,
          gap: spacing.lg
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.hero}>
          <Text style={{ fontSize: 78 }}>{product.emoji}</Text>
        </View>

        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <Text style={[type.tiny, { color: colors.brand, textTransform: "uppercase" }]}>
            {product.category}
          </Text>
          <Text style={[type.display, { color: colors.text }]}>{product.name}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <Text style={[type.title, { color: colors.text }]}>{formatPrice(product.price)}</Text>
            <Text style={[type.small, { color: colors.warning }]}>★ {product.rating}</Text>
            <Text
              style={[type.small, { color: product.stock > 0 ? colors.success : colors.danger }]}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </Text>
          </View>

          <Text style={[type.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {product.blurb}
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <Text style={[type.heading, { color: colors.text }]}>Details</Text>
          {[
            ["Category", product.category],
            ["Rating", `${product.rating} out of 5`],
            ["Availability", product.stock > 0 ? `${product.stock} units` : "Backorder"],
            ["Product id", product.id]
          ].map(([label, value]) => (
            <View key={label} style={s.detailRow}>
              <Text style={[type.small, { color: colors.textFaint }]}>{label}</Text>
              <Text style={[type.small, { color: colors.text, fontWeight: "600" }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <Text style={[type.heading, { color: colors.text }]}>Tags</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {product.tags.map(tag => (
              <View key={tag} style={s.tag}>
                <Text style={[type.tiny, { color: colors.textMuted }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* A pinned action bar — the reason DetailsScreen doesn't just return a
          ScrollView. It sits above the home indicator, not under it. */}
      <View style={[s.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={[s.secondary, saved && { borderColor: colors.brand }]}
          onPress={() => setSaved(value => !value)}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
        >
          <Text style={{ fontSize: 18 }}>{saved ? "❤️" : "🤍"}</Text>
        </Pressable>

        <Pressable
          style={[s.primary, { flex: 1 }, product.stock === 0 && s.disabled]}
          disabled={product.stock === 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: product.stock === 0 }}
        >
          <Text style={s.primaryLabel}>
            {product.stock === 0 ? "Out of stock" : `Add to cart · ${formatPrice(product.price)}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    marginHorizontal: spacing.lg,
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  tag: {
    backgroundColor: colors.sunk,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow(2)
  },
  primary: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryLabel: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondary: {
    width: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sunk,
    alignItems: "center",
    justifyContent: "center"
  },
  disabled: { backgroundColor: colors.border },
  missing: { flex: 1, alignItems: "center", gap: spacing.md, padding: spacing.lg }
});
