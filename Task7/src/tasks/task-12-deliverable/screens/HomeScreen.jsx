import { ScrollView, View, Text, Pressable, useWindowDimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, type } from "../../../theme";
import { shadow } from "../../../theme/shadows";
import { products, profile, formatPrice } from "../../../data";
import ProductCard from "../components/ProductCard";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Two columns on a phone, three once there's room — computed, not guessed
  const columns = width > 600 ? 3 : 2;
  const cardWidth = (width - spacing.lg * 2 - spacing.md * (columns - 1)) / columns;

  const featured = products.slice(0, 4);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + 96,
        gap: spacing.lg
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.xs }}>
        <Text style={[type.small, { color: colors.textMuted }]}>Good morning</Text>
        <Text style={[type.display, { color: colors.text }]}>{profile.name.split(" ")[0]}</Text>
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <View style={s.banner}>
          <Text style={[type.title, { color: "#fff" }]}>Desk refresh</Text>
          <Text style={[type.small, { color: "rgba(255,255,255,0.85)" }]}>
            Up to 30% off peripherals this week
          </Text>
          <Pressable
            style={s.bannerBtn}
            onPress={() => navigation.navigate("Listing")}
            accessibilityRole="button"
          >
            <Text style={[type.small, { color: colors.brand, fontWeight: "700" }]}>Browse all</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <View style={s.rowBetween}>
          <Text style={[type.heading, { color: colors.text }]}>Featured</Text>
          <Pressable onPress={() => navigation.navigate("Listing")} accessibilityRole="button">
            <Text style={[type.small, { color: colors.brand, fontWeight: "600" }]}>See all</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          {featured.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              width={cardWidth}
              onPress={() => navigation.navigate("Details", { id: product.id })}
            />
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <Text style={[type.heading, { color: colors.text }]}>Your stats</Text>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          {profile.stats.map(stat => (
            <View key={stat.label} style={s.stat}>
              <Text style={[type.title, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[type.tiny, { color: colors.textFaint }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <Text style={[type.heading, { color: colors.text }]}>Recently viewed</Text>
        {products.slice(4, 7).map(product => (
          <Pressable
            key={product.id}
            style={({ pressed }) => [s.listRow, pressed && { backgroundColor: colors.sunk }]}
            onPress={() => navigation.navigate("Details", { id: product.id })}
            android_ripple={{ color: colors.border }}
          >
            <Text style={{ fontSize: 24 }}>{product.emoji}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={[type.small, { color: colors.text, fontWeight: "600" }]}
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text style={[type.tiny, { color: colors.textFaint }]}>{product.category}</Text>
            </View>
            <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>
              {formatPrice(product.price)}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  banner: {
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: "flex-start",
    ...shadow(2)
  },
  bannerBtn: {
    backgroundColor: "#fff",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: 2
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  }
});
