import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { PageHeader, SectionCard, Code, Badge, Row } from "../../shared/ui";
import { useTheme, useApi } from "../../hooks";
import { getProducts } from "../../services";
import { spacing, radius, type } from "../../theme";
import { formatPrice } from "../../data";

/* The list owns the whole screen — RefreshControl belongs to a scrollable,
   and nesting this inside a ScrollView would break both the refresh gesture
   and the windowing. */

export default function TaskScreen() {
  const { colors } = useTheme();
  const query = useApi(options => getProducts({ limit: 12 }, options), []);
  const items = query.data?.products ?? [];

  const renderItem = useCallback(
    ({ item }) => (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing.md
        }}
      >
        <Text style={[type.small, { color: colors.text, flex: 1 }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[type.small, { color: colors.textMuted }]}>{formatPrice(item.price)}</Text>
      </View>
    ),
    [colors]
  );

  const Header = useCallback(
    () => (
      <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
        <PageHeader
          number={9}
          title="Pull To Refresh"
          brief="Implement RefreshControl and reload data without breaking current screen state"
          lead="Pull the list down. The rows stay on screen the whole time — that's the requirement, not a nicety."
        />

        <Row>
          <Badge label={`loading: ${query.loading}`} tone={query.loading ? "warning" : "neutral"} />
          <Badge
            label={`refreshing: ${query.refreshing}`}
            tone={query.refreshing ? "brand" : "neutral"}
          />
          <Badge label={`${items.length} rows`} />
        </Row>

        <SectionCard
          title="Two flags, not one"
          note="Reusing `loading` for a refresh blanks the list and replaces it with skeletons — while the user is looking at the data they just pulled down."
        >
          <Code>{`const [loading, setLoading]       = useState(true);   // first load
const [refreshing, setRefreshing] = useState(false);  // pull-to-refresh

// The refresh path deliberately does NOT touch \`loading\`:
const refresh = useCallback(async () => {
  setRefreshing(true);
  try   { setData(await fetcher()); }
  catch (error) { setError(error); }     // keep the old data on screen
  finally { setRefreshing(false); }
}, []);`}</Code>
        </SectionCard>

        <SectionCard
          title="A failed refresh keeps the old data"
          note="Blanking a working list because a refresh failed is worse than showing data that's thirty seconds stale."
        >
          <Code>{`catch (error) {
  if (mounted.current) setError(error);   // report it
  // …but never setData(null)
}`}</Code>
        </SectionCard>

        <SectionCard
          title="RefreshControl is styled per platform"
          note="iOS draws a spinner tinted by tintColor; Android draws a circle using colors and progressBackgroundColor. Setting only one leaves the other at its default, which usually clashes with a dark theme."
        >
          <Code>{`<FlatList
  refreshControl={
    <RefreshControl
      refreshing={query.refreshing}
      onRefresh={query.refresh}
      tintColor={colors.brand}                 // iOS
      colors={[colors.brand]}                  // Android
      progressBackgroundColor={colors.surface} // Android
    />
  }
/>`}</Code>
        </SectionCard>

        <SectionCard
          title="It has to be on the scrollable itself"
          note="RefreshControl is a prop of ScrollView, FlatList or SectionList. It cannot be attached to a View, and wrapping the list in a ScrollView to get it there breaks the list."
        >
          <Code>{`// ❌ two vertical scrollables — the gesture and the windowing both break
<ScrollView refreshControl={…}>
  <FlatList data={items} />
</ScrollView>

// ✅ one scrollable, with the prose as its header
<FlatList refreshControl={…} ListHeaderComponent={<Prose />} data={items} />`}</Code>
          <Text style={[type.small, { color: colors.textMuted }]}>
            Which is exactly how this screen is built — everything you’re reading is the list’s{" "}
            <Text style={{ fontWeight: "700" }}>ListHeaderComponent</Text>.
          </Text>
        </SectionCard>

        <SectionCard
          title="Refresh, or infinite scroll"
          note="They pair, and they use different props."
        >
          <Code>{`refreshControl={…}          // pull DOWN at the top — replaces the data
onEndReached={loadMore}      // scroll to the BOTTOM — appends
onEndReachedThreshold={0.5}  // fire half a screen early

// onEndReached fires more than once if you don't guard it:
const loadMore = () => { if (!loadingMore && hasMore) fetchNextPage(); };`}</Code>
        </SectionCard>

        <Text style={[type.heading, { color: colors.text, paddingTop: spacing.sm }]}>
          The list — pull it down
        </Text>
      </View>
    ),
    [colors, query.loading, query.refreshing, items.length]
  );

  return (
    <FlatList
      data={items}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      ListHeaderComponent={Header}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64, gap: 0 }}
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
