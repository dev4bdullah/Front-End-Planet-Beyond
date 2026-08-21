import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useApi, useFavorites } from "../../../hooks";
import { getProducts } from "../../../services";
import { spacing, type } from "../../../theme";
import { ErrorState, EmptyState, SkeletonRow, Badge } from "../../../shared/ui";
import ProductRow from "../components/ProductRow";

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { count } = useFavorites();

  const query = useApi(options => getProducts({ limit: 20 }, options), []);
  const items = query.data?.products ?? [];

  const renderItem = useCallback(
    ({ item }) => (
      <ProductRow product={item} onPress={() => navigation.navigate("Details", { id: item.id })} />
    ),
    [navigation]
  );

  const Header = useCallback(
    () => (
      <View style={{ gap: spacing.xs, paddingBottom: spacing.md }}>
        <Text style={[type.tiny, { color: colors.brand, textTransform: "uppercase" }]}>
          Day 8 deliverable
        </Text>
        <Text style={[type.display, { color: colors.text }]}>Catalogue</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>
          Live from dummyjson.com — pull down to refresh.
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}>
          <Badge label={`${items.length} loaded`} tone="brand" />
          <Badge label={`${count} saved`} tone={count > 0 ? "success" : "neutral"} />
          <Pressable onPress={() => navigation.getParent()?.openDrawer?.()}>
            <Badge label="☰ menu" />
          </Pressable>
        </View>
      </View>
    ),
    [colors, items.length, count, navigation]
  );

  if (query.loading) {
    return (
      <View
        style={{
          flex: 1,
          padding: spacing.lg,
          paddingTop: insets.top + spacing.lg,
          gap: spacing.sm
        }}
      >
        {Array.from({ length: 7 }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </View>
    );
  }

  if (query.error && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", paddingTop: insets.top }}>
        <ErrorState error={query.error} onRetry={query.retry} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <EmptyState title="No products" message="The API returned an empty list." />
      }
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + 96,
        flexGrow: 1
      }}
      refreshControl={
        <RefreshControl
          refreshing={query.refreshing}
          onRefresh={query.refresh}
          tintColor={colors.brand}
          colors={[colors.brand]}
          progressBackgroundColor={colors.surface}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}
