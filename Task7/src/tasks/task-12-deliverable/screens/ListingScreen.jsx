import { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, useWindowDimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, type } from "../../../theme";
import { products, categories } from "../../../data";
import ProductCard from "../components/ProductCard";
import CategoryChips from "../components/CategoryChips";

export default function ListingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const columns = width > 600 ? 3 : 2;
  const cardWidth = (width - spacing.lg * 2 - spacing.md * (columns - 1)) / columns;

  const data = useMemo(
    () =>
      products
        .filter(item => (category === "All" ? true : item.category === category))
        .filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [category, query]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ProductCard
        product={item}
        width={cardWidth}
        onPress={() => navigation.navigate("Details", { id: item.id })}
      />
    ),
    [cardWidth, navigation]
  );

  const Header = useCallback(
    () => (
      <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <Text style={[type.display, { color: colors.text }]}>Shop</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products"
            placeholderTextColor={colors.textFaint}
            style={s.search}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>

        {/* Full-bleed, so the chips can scroll off the edge rather than
            stopping at a margin — the padding lives on the content instead */}
        <CategoryChips categories={categories} active={category} onChange={setCategory} />

        <Text style={[type.tiny, { color: colors.textFaint, paddingHorizontal: spacing.lg }]}>
          {data.length} product{data.length === 1 ? "" : "s"}
        </Text>
      </View>
    ),
    [query, category, data.length]
  );

  return (
    <FlatList
      key={columns} /* numColumns can't change on a mounted list — remount instead */
      data={data}
      numColumns={columns}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 30 }}>🔍</Text>
          <Text style={[type.heading, { color: colors.text }]}>No matches</Text>
          <Text style={[type.small, { color: colors.textMuted, textAlign: "center" }]}>
            Try a different search or category.
          </Text>
        </View>
      }
      columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + 96,
        gap: spacing.md,
        flexGrow: 1
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  search: {
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.xxl
  }
});
