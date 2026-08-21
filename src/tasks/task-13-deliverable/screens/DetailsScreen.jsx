import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useApi, useFavorites } from "../../../hooks";
import { getProductById } from "../../../services";
import { spacing, radius, type } from "../../../theme";
import { shadow } from "../../../theme/shadows";
import { formatPrice, titleCase } from "../../../data";
import { ErrorState, SkeletonRow, Badge } from "../../../shared/ui";

export default function DetailsScreen({ route, navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggle } = useFavorites();

  /* Task 5 — the param may be missing entirely if this screen was reached by
     a deep link with a malformed URL. Guard before fetching. */
  const rawId = route.params?.id;
  const id = Number(rawId);
  const valid = rawId !== undefined && !Number.isNaN(id);

  const query = useApi(options => getProductById(id, options), [id], { enabled: valid });

  if (!valid) {
    return (
      <View style={{ flex: 1, justifyContent: "center", paddingTop: insets.top }}>
        <ErrorState
          error={{ message: `No usable product id was passed (got ${JSON.stringify(rawId)}).` }}
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  if (query.loading) {
    return (
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        <SkeletonRow height={180} />
        <SkeletonRow height={28} />
        <SkeletonRow height={80} />
      </View>
    );
  }

  if (query.error) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ErrorState error={query.error} onRetry={query.retry} />
      </View>
    );
  }

  const product = query.data;
  if (!product) return null;
  const saved = isFavorite(product.id);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + 120,
          gap: spacing.lg
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 72 }}>{product.emoji ?? "📦"}</Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[type.tiny, { color: colors.brand, textTransform: "uppercase" }]}>
            {titleCase(product.category ?? "")}
          </Text>
          <Text style={[type.display, { color: colors.text }]}>{product.title}</Text>

          <View
            style={{
              flexDirection: "row",
              gap: spacing.md,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <Text style={[type.title, { color: colors.text }]}>{formatPrice(product.price)}</Text>
            <Badge label={`★ ${product.rating}`} tone="warning" />
            <Badge
              label={product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              tone={product.stock > 0 ? "success" : "danger"}
            />
          </View>

          <Text style={[type.body, { color: colors.textMuted }]}>{product.description}</Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[type.heading, { color: colors.text }]}>Details</Text>
          {[
            ["Brand", product.brand ?? "—"],
            ["Category", titleCase(product.category ?? "")],
            ["Rating", `${product.rating} out of 5`],
            ["Product id", product.id]
          ].map(([label, value]) => (
            <View
              key={label}
              style={[s.detail, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[type.small, { color: colors.textFaint }]}>{label}</Text>
              <Text style={[type.small, { color: colors.text, fontWeight: "600" }]}>
                {String(value)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[type.tiny, { color: colors.textFaint }]}>
          Reached via route params — try the deep link day8://product/{product.id} from task 6.
        </Text>
      </ScrollView>

      <View
        style={[
          s.bar,
          {
            paddingBottom: insets.bottom + spacing.md,
            backgroundColor: colors.surface,
            borderTopColor: colors.border
          },
          shadow(2)
        ]}
      >
        <Pressable
          onPress={() => toggle(product.id)}
          style={[
            s.iconBtn,
            { borderColor: saved ? colors.brand : colors.border, backgroundColor: colors.sunk }
          ]}
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove from favourites" : "Add to favourites"}
          accessibilityState={{ selected: saved }}
        >
          <Text style={{ fontSize: 18 }}>{saved ? "❤️" : "🤍"}</Text>
        </Pressable>

        <Pressable
          style={[s.primary, { backgroundColor: product.stock > 0 ? colors.brand : colors.border }]}
          disabled={product.stock === 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: product.stock === 0 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            {product.stock > 0 ? `Add to cart · ${formatPrice(product.price)}` : "Out of stock"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    height: 180,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  detail: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
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
    borderTopWidth: 1
  },
  iconBtn: {
    width: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  primary: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  }
});
