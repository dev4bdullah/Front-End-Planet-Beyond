import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useApi, useFavorites } from "../../../hooks";
import { getProducts } from "../../../services";
import { spacing, type } from "../../../theme";
import { EmptyState, ErrorState, SkeletonRow, Button } from "../../../shared/ui";
import ProductRow from "../components/ProductRow";

export default function FavoritesScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { ids, count, clear, hydrated } = useFavorites();

  /* Fetch the catalogue and filter locally rather than requesting each id.
     Twenty parallel requests for twenty favourites is worse for a phone than
     one request that was probably cached anyway. */
  const query = useApi(options => getProducts({ limit: 100 }, options), [], { enabled: count > 0 });

  const items = (query.data?.products ?? []).filter(product => ids.includes(product.id));

  const renderItem = useCallback(
    ({ item }) => (
      <ProductRow product={item} onPress={() => navigation.navigate("Details", { id: item.id })} />
    ),
    [navigation]
  );

  // Don't flash an empty state before AsyncStorage has answered
  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          padding: spacing.lg,
          paddingTop: insets.top + spacing.lg,
          gap: spacing.sm
        }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </View>
    );
  }

  if (count === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", paddingTop: insets.top }}>
        <EmptyState
          title="No favourites yet"
          message="Tap the heart on any product. They survive an app restart."
          action={
            <Button label="Browse the catalogue" onPress={() => navigation.navigate("HomeTab")} />
          }
        />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      ListHeaderComponent={
        <View style={{ gap: spacing.sm, paddingBottom: spacing.md }}>
          <Text style={[type.display, { color: colors.text }]}>Favourites</Text>
          <Text style={[type.small, { color: colors.textMuted }]}>
            {count} saved · stored in AsyncStorage
          </Text>
          <Button
            label="Clear all"
            variant="ghost"
            size="sm"
            onPress={clear}
            style={{ alignSelf: "flex-start" }}
          />
        </View>
      }
      ListEmptyComponent={
        query.loading ? (
          <View style={{ gap: spacing.sm }}>
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonRow key={index} />
            ))}
          </View>
        ) : query.error ? (
          <ErrorState error={query.error} onRetry={query.retry} />
        ) : (
          <EmptyState
            title="Saved, but not loaded"
            message="Your favourites are stored, but the catalogue couldn't be fetched to show them."
          />
        )
      }
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
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}
