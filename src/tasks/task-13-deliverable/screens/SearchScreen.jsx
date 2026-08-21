import { useCallback, useState } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useApi, useDebounce } from "../../../hooks";
import { getProducts } from "../../../services";
import { spacing, radius, type } from "../../../theme";
import { ErrorState, EmptyState, SkeletonRow } from "../../../shared/ui";
import ProductRow from "../components/ProductRow";

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 450);

  const query = useApi(
    options => getProducts({ search: debounced, limit: 20 }, options),
    [debounced],
    { enabled: debounced.trim().length > 0 }
  );

  const items = debounced.trim() ? (query.data?.products ?? []) : [];
  const typing = term !== debounced;

  const renderItem = useCallback(
    ({ item }) => (
      <ProductRow product={item} onPress={() => navigation.navigate("Details", { id: item.id })} />
    ),
    [navigation]
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top + spacing.md }}>
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <Text style={[type.display, { color: colors.text }]}>Search</Text>

        <View style={{ justifyContent: "center" }}>
          <TextInput
            value={term}
            onChangeText={setTerm}
            placeholder="Search products"
            placeholderTextColor={colors.textFaint}
            style={[
              s.input,
              { backgroundColor: colors.sunk, borderColor: colors.border, color: colors.text }
            ]}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {(typing || query.loading) && term.length > 0 ? (
            <ActivityIndicator color={colors.brand} style={s.spinner} size="small" />
          ) : null}
        </View>

        <Text style={[type.tiny, { color: colors.textFaint }]}>
          {typing
            ? "typing…"
            : debounced
              ? `${items.length} result${items.length === 1 ? "" : "s"} for “${debounced}”`
              : "Debounced 450ms — one request per pause, not per keystroke."}
        </Text>
      </View>

      {!debounced.trim() ? (
        <EmptyState title="Search the catalogue" message="Results appear once you stop typing." />
      ) : query.loading ? (
        <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonRow key={index} />
          ))}
        </View>
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={query.retry} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState title="No matches" message={`Nothing found for “${debounced}”.`} />
          }
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + 96,
            flexGrow: 1
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15
  },
  spinner: { position: "absolute", right: spacing.md }
});
