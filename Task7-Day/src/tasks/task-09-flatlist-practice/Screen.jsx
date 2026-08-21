import { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from "react-native";
import { PageHeader, SectionCard, Code, Badge, Row, Button, styles as ui } from "../../shared/ui";
import { colors, spacing, radius, type } from "../../theme";
import { products, formatPrice } from "../../data";

/* A bigger list, so the windowing actually has something to window. */
const BIG_LIST = Array.from({ length: 240 }, (_, index) => {
  const base = products[index % products.length];
  return { ...base, id: `${base.id}-${index}`, name: `${base.name} #${index + 1}` };
});

const ROW_HEIGHT = 64;

function Separator() {
  return <View style={s.separator} />;
}

function Empty({ query }) {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 26 }}>🔍</Text>
      <Text style={[type.heading, { color: colors.text }]}>Nothing matches</Text>
      <Text style={[type.small, { color: colors.textMuted, textAlign: "center" }]}>
        {query ? `No product contains "${query}".` : "The list is empty."}
      </Text>
    </View>
  );
}

export default function Screen() {
  const [query, setQuery] = useState("");
  const [renders, setRenders] = useState(0);

  const data = useMemo(
    () => BIG_LIST.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  /* Every one of these is wrapped, because FlatList compares them by identity.
     An inline arrow means a new function each render, which defeats the
     memoisation FlatList is doing internally. */
  const keyExtractor = useCallback(item => item.id, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <Pressable
        style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.sunk }]}
        onPress={() => setRenders(count => count + 1)}
        android_ripple={{ color: colors.border }}
      >
        <Text style={s.rowEmoji}>{item.emoji}</Text>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[type.body, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[type.tiny, { color: colors.textFaint }]}>
            {item.category} · row {index}
          </Text>
        </View>

        <Text style={[type.body, { color: colors.text, fontWeight: "700" }]}>
          {formatPrice(item.price)}
        </Text>
      </Pressable>
    ),
    []
  );

  /* Every row is exactly ROW_HEIGHT tall, so FlatList can compute a scroll
     offset without measuring. Only correct because the height is fixed —
     lying here produces scroll positions that drift. */
  const getItemLayout = useCallback(
    (_data, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
    []
  );

  const Header = useCallback(
    () => (
      <View style={{ gap: spacing.sm, paddingBottom: spacing.md }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Filter 240 rows"
          placeholderTextColor={colors.textFaint}
          style={s.input}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        <Row>
          <Badge label={`${data.length} of ${BIG_LIST.length}`} />
          <Badge label={`${renders} taps`} tone="success" />
        </Row>
      </View>
    ),
    [query, data.length, renders]
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={<Empty query={query} />}
        ListHeaderComponent={Header}
        ListFooterComponent={
          data.length > 0 ? (
            <Text
              style={[
                type.tiny,
                { color: colors.textFaint, textAlign: "center", padding: spacing.lg }
              ]}
            >
              End of list · {data.length} rows
            </Text>
          ) : null
        }
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 48, flexGrow: 1 }}
        /* Keeps the header usable while a long list is being scrolled */
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={9}
        removeClippedSubviews
        ListHeaderComponentStyle={{ zIndex: 1 }}
      />
    </View>
  );
}

/* The prose for this task lives in a second screen so the FlatList above can
   own the whole viewport — nesting a FlatList inside a ScrollView is the
   mistake this task is partly about. */
export function Notes() {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      <PageHeader
        number={9}
        title="FlatList Practice"
        brief="Render large lists using keyExtractor, ListEmptyComponent, ListHeaderComponent, and ItemSeparatorComponent"
        lead="240 rows, rendering about twelve of them. That's the entire reason FlatList exists."
      />

      <SectionCard
        title="Why not .map()"
        note="A ScrollView with 240 mapped rows mounts all 240 — every one of them, before the first paint. FlatList mounts what fits and recycles as you scroll."
      >
        <Code>{`// ❌ mounts 240 views immediately
<ScrollView>
  {items.map(item => <Row key={item.id} item={item} />)}
</ScrollView>

// ✅ mounts ~12, recycles the rest
<FlatList data={items} keyExtractor={i => i.id} renderItem={renderItem} />`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          On a list of ten it makes no difference. On a list of a few hundred with images, the
          ScrollView version takes seconds to appear and then stutters.
        </Text>
      </SectionCard>

      <SectionCard
        title="The four props the task names"
        note="Each one replaces a thing people otherwise hand-roll badly."
      >
        <Code>{`keyExtractor={item => item.id}                 // stable identity, not the index
ItemSeparatorComponent={Separator}             // between rows only, never top or bottom
ListEmptyComponent={<Empty query={query} />}   // shown INSTEAD of the list
ListHeaderComponent={Header}                   // scrolls with the list, not above it`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The separator one is worth noticing: hand-rolling it with a border on every row gives you
          a stray line under the last item.{" "}
          <Text style={ui.codeInline}>ItemSeparatorComponent</Text> renders n−1 times, which is what
          you actually wanted.
        </Text>
      </SectionCard>

      <SectionCard
        title="keyExtractor, and the index trap"
        note="Using the array index as a key means every row's identity changes when the list is filtered or reordered — so RN unmounts and remounts rows that didn't change."
      >
        <Code>{`keyExtractor={(item, index) => String(index)}   // ❌ identity changes on filter
keyExtractor={item => item.id}                  // ✅`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          Type in the filter above. With an index key, any row holding local state — an expanded
          toggle, a text input — would show the wrong row’s state after filtering.
        </Text>
      </SectionCard>

      <SectionCard
        title="The header scrolls with the list"
        note="Putting the search box above the FlatList pins it in place. As ListHeaderComponent it scrolls away, which is usually what a mobile list wants."
      >
        <Code>{`// pinned — takes permanent vertical space
<View><SearchBox /></View>
<FlatList … />

// scrolls away with the content
<FlatList ListHeaderComponent={Header} … />`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          It also has to be wrapped in useCallback. Passing an inline arrow remounts the header on
          every render — which unmounts the TextInput and drops the keyboard mid-typing.
        </Text>
      </SectionCard>

      <SectionCard
        title="getItemLayout"
        note="Tells FlatList where every row is without measuring it. Only valid when the rows are genuinely a fixed height."
      >
        <Code>{`const getItemLayout = useCallback(
  (_data, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
  []
);`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          It makes <Text style={ui.codeInline}>scrollToIndex</Text> instant and the scrollbar
          accurate. Give it a wrong height and the list will happily scroll to the wrong place —
          which is why it’s opt-in rather than automatic.
        </Text>
      </SectionCard>

      <SectionCard
        title="Never nest a FlatList in a ScrollView"
        note="This screen splits the list and the prose for that reason. A vertical FlatList inside a vertical ScrollView loses all windowing, because the ScrollView gives it unbounded height — so it renders every row."
      >
        <Code>{`// ❌ warns, and renders all 240 rows
<ScrollView><FlatList data={items} /></ScrollView>

// ✅ put the surrounding content in the list itself
<FlatList
  data={items}
  ListHeaderComponent={<Intro />}
  ListFooterComponent={<Notes />}
/>`}</Code>
      </SectionCard>

      <SectionCard
        title="Performance props, in order of impact"
        note="Defaults are reasonable. Reach for these when a real device shows blank space while scrolling fast."
      >
        <Code>{`initialNumToRender={12}    // rows in the first paint — keep it to one screenful
maxToRenderPerBatch={12}   // rows added per scroll batch
windowSize={9}             // screens' worth kept mounted either side
removeClippedSubviews      // detaches off-screen rows (Android especially)

// and the big one that isn't a prop:
// memo the row component, and useCallback renderItem`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          Measure before tuning these. A slow list is usually a heavy row component or an unmemoised{" "}
          <Text style={ui.codeInline}>renderItem</Text>, not a windowing setting.
        </Text>
      </SectionCard>

      <SectionCard
        title="FlatList or FlashList"
        note="Shopify's FlashList is a drop-in replacement that recycles views rather than mounting new ones, and is noticeably smoother on long lists with images."
      >
        <Code>{`import { FlashList } from "@shopify/flash-list";

<FlashList data={items} renderItem={renderItem} estimatedItemSize={64} />`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          Worth knowing about. FlatList is built in and fine for most lists; the swap is easy enough
          that it isn’t worth pre-emptively adding a dependency.
        </Text>
      </SectionCard>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  rowEmoji: { fontSize: 22 },
  separator: { height: 1, backgroundColor: colors.border },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xxl
  },
  input: {
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 15
  }
});
