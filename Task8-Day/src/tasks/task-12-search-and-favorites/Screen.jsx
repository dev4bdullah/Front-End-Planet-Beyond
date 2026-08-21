import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Screen,
  PageHeader,
  SectionCard,
  Code,
  Button,
  Row,
  Badge,
  EmptyState
} from "../../shared/ui";
import { useTheme, useApi, useDebounce, useFavorites } from "../../hooks";
import { getProducts } from "../../services";
import { spacing, radius, type } from "../../theme";
import { formatPrice } from "../../data";

export default function TaskScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { ids, count, isFavorite, toggle, clear, hydrated } = useFavorites();

  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 450);

  const query = useApi(
    options => getProducts({ search: debounced, limit: 6 }, options),
    [debounced],
    {
      enabled: debounced.trim().length > 0
    }
  );

  const items = debounced.trim() ? (query.data?.products ?? []) : [];

  return (
    <Screen>
      <PageHeader
        number={12}
        title="Search & Favorites"
        brief="Add debounced search, favorite/unfavorite actions, and persistent favorites list"
        lead="Two features that share one lesson: do less work, and remember what the user chose."
      />

      <SectionCard
        title="Debounced search"
        note="Type quickly. The request fires once, when you pause — not once per keystroke."
      >
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
        />

        <Row>
          <Badge label={`typed: ${term.length}`} />
          <Badge
            label={term !== debounced ? "waiting…" : "settled"}
            tone={term !== debounced ? "warning" : "success"}
          />
          <Badge label={`requests: ${debounced ? 1 : 0} per pause`} tone="brand" />
        </Row>

        <View style={{ gap: spacing.sm, minHeight: 120 }}>
          {!debounced.trim() ? (
            <EmptyState title="Type to search" message="Nothing is requested until you pause." />
          ) : query.loading ? (
            <Text style={[type.small, { color: colors.textMuted }]}>Searching…</Text>
          ) : query.error ? (
            <Text style={[type.small, { color: colors.danger }]}>{query.error.message}</Text>
          ) : items.length === 0 ? (
            <EmptyState title="No matches" message={`Nothing found for “${debounced}”.`} />
          ) : (
            items.map(item => {
              const saved = isFavorite(item.id);

              return (
                <View
                  key={item.id}
                  style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={[type.small, { color: colors.text, fontWeight: "600" }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={[type.tiny, { color: colors.textFaint }]}>
                      {formatPrice(item.price)}
                    </Text>
                  </View>

                  <Button
                    label={saved ? "♥ Saved" : "♡ Save"}
                    size="sm"
                    variant={saved ? "primary" : "ghost"}
                    onPress={() => toggle(item.id)}
                  />
                </View>
              );
            })
          )}
        </View>
      </SectionCard>

      <SectionCard
        title="Why debounce matters more here"
        note="On a laptop it saves the server some work. On a phone it saves the user's battery and their data allowance."
      >
        <Code>{`// "keyboard" typed at normal speed = 8 requests without a debounce.
// Seven of them are thrown away before the eighth returns —
// but every one still opened a radio connection.

const debounced = useDebounce(term, 450);
const query = useApi(fn, [debounced], { enabled: debounced.trim().length > 0 });`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The <Text style={{ fontWeight: "700" }}>enabled</Text> flag is the other half: with an
          empty box, no request should be made at all — not a request for everything.
        </Text>
      </SectionCard>

      <SectionCard
        title="Favourites: an array in storage, a Set in memory"
        note="AsyncStorage holds JSON, and a Set doesn't serialise. Deriving the Set on read keeps lookups O(1) without a second source of truth."
      >
        <Code>{`const [ids, setIds] = useAsyncStorage("day8.favorites", []);   // array — JSON-safe

const lookup = useMemo(() => new Set(ids), [ids]);             // Set — fast lookup
const isFavorite = useCallback(id => lookup.has(id), [lookup]);

const toggle = useCallback(id =>
  setIds(current =>
    current.includes(id) ? current.filter(item => item !== id) : [...current, id]
  ), [setIds]);`}</Code>

        <Row>
          <Badge label={`${count} saved`} tone={count > 0 ? "success" : "neutral"} />
          <Badge
            label={hydrated ? "hydrated" : "reading…"}
            tone={hydrated ? "success" : "warning"}
          />
          <Button label="Clear all" size="sm" variant="ghost" onPress={clear} />
          <Button
            label="Open the Saved tab"
            size="sm"
            onPress={() => navigation.navigate("App", { screen: "FavoritesTab" })}
          />
        </Row>

        <Text style={[type.tiny, { color: colors.textFaint }]}>
          stored ids: {ids.length ? ids.join(", ") : "—"}
        </Text>
      </SectionCard>

      <SectionCard
        title="Store ids, not records"
        note="Same argument as route params in task 5, for the same reason."
      >
        <Code>{`// ❌ the stored copy goes stale — prices change, stock changes
setFavorites([...favorites, product]);

// ✅ store the id, fetch the current record
setIds([...ids, product.id]);`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The Saved tab fetches the catalogue once and filters locally rather than requesting each
          id separately. Twenty parallel requests for twenty favourites is worse for a phone than
          one request that was probably cached anyway.
        </Text>
      </SectionCard>

      <SectionCard
        title="Don't flash an empty state before storage answers"
        note="AsyncStorage is async, so `count === 0` is true for the first frame even when the user has fifty favourites."
      >
        <Code>{`if (!hydrated) return <Skeletons />;        // ← the check that matters
if (count === 0) return <EmptyState title="No favourites yet" />;`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Without it, the Saved tab shows “No favourites yet” for a moment on every launch, which
          reads as data loss.
        </Text>
      </SectionCard>
    </Screen>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md
  }
});
