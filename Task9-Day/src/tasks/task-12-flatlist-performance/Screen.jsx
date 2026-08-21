import { memo, useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { PageHeader, SectionCard, Code, Button, Row, Badge } from "../../shared/ui";
import { useTheme } from "../../hooks";
import { spacing, radius, type } from "../../theme";
import { localProducts, formatPrice } from "../../data";

const ROW_HEIGHT = 60;

const DATA = Array.from({ length: 500 }, (_, index) => {
  const base = localProducts[index % localProducts.length];
  return { ...base, id: `${base.id}-${index}`, title: `${base.title} #${index + 1}` };
});

/* memo is the single biggest win in a long list. Without it, every row
   re-renders whenever the parent does — which for a 500-row list means 500
   renders for one state change somewhere else on screen. */
const Row_ = memo(function Row_({ item, selected, onPress, colors }) {
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      android_ripple={{ color: colors.border }}
      style={[
        s.row,
        {
          backgroundColor: selected ? colors.brandSoft : colors.surface,
          borderColor: colors.border
        }
      ]}
    >
      <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
      <Text style={[type.small, { color: colors.text, flex: 1 }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[type.small, { color: colors.textMuted }]}>{formatPrice(item.price)}</Text>
    </Pressable>
  );
});

export default function TaskScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(null);
  const [tuned, setTuned] = useState(true);

  /* Stable identity, or every row's onPress prop changes each render and
     memo compares unequal — which silently undoes the memo entirely. */
  const onPress = useCallback(id => setSelected(current => (current === id ? null : id)), []);

  const keyExtractor = useCallback(item => item.id, []);

  const getItemLayout = useCallback(
    (_data, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
    []
  );

  const renderItem = useCallback(
    ({ item }) => (
      <Row_ item={item} selected={item.id === selected} onPress={onPress} colors={colors} />
    ),
    [selected, onPress, colors]
  );

  const tuning = useMemo(
    () =>
      tuned
        ? {
            initialNumToRender: 10,
            maxToRenderPerBatch: 10,
            windowSize: 7,
            removeClippedSubviews: true
          }
        : {
            initialNumToRender: 500,
            maxToRenderPerBatch: 500,
            windowSize: 21,
            removeClippedSubviews: false
          },
    [tuned]
  );

  const Header = useCallback(
    () => (
      <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
        <PageHeader
          number={12}
          title="FlatList Performance"
          brief="Optimize FlatList with initialNumToRender, windowSize, getItemLayout where appropriate, and memoized rows"
          lead="500 rows. Toggle the tuning and scroll fast — the untuned version mounts all of them at once."
        />

        <Row>
          <Button
            label={tuned ? "Tuned" : "Untuned"}
            size="sm"
            variant={tuned ? "primary" : "danger"}
            onPress={() => setTuned(value => !value)}
          />
          <Badge label={`initialNumToRender: ${tuning.initialNumToRender}`} />
          <Badge label={`windowSize: ${tuning.windowSize}`} />
        </Row>

        <SectionCard
          title="Measure before tuning"
          note="Open the dev menu → Toggle performance monitor. Two FPS counters, and which one drops tells you what kind of problem you have."
        >
          <Code>{`JS thread low, UI fine  → your JavaScript is slow
                           (an unmemoised row, an expensive render)
UI thread low           → the native side struggles
                           (too many views, large images, Android shadows)
Both low                → a huge list rendered without windowing`}</Code>
        </SectionCard>

        <SectionCard
          title="memo + useCallback, together or not at all"
          note="This is the biggest win, and the one that's easiest to accidentally undo."
        >
          <Code>{`const Row = memo(function Row({ item, onPress }) { … });

// ❌ a NEW function every render — memo compares unequal, so every
//    row re-renders anyway and the memo does literally nothing
renderItem={({ item }) => <Row item={item} onPress={id => select(id)} />}

// ✅ stable identity
const onPress = useCallback(id => setSelected(id), []);
const renderItem = useCallback(({ item }) => <Row item={item} onPress={onPress} />, [onPress]);`}</Code>
        </SectionCard>

        <SectionCard
          title="The four props"
          note="Defaults are reasonable. These are for when a real device shows blank space while scrolling fast."
        >
          <Code>{`initialNumToRender={10}     rows in the FIRST paint — one screenful,
                            not more. This is the one that decides how
                            fast the screen appears at all.
maxToRenderPerBatch={10}    rows added per scroll batch. Higher = fewer
                            blank gaps, but longer JS blocks.
windowSize={7}              screens' worth kept mounted either side.
                            21 is the default and is usually too many.
removeClippedSubviews       detaches off-screen views. Big win on
                            Android; occasional clipping bugs on iOS.`}</Code>
        </SectionCard>

        <SectionCard
          title="getItemLayout — only when rows are truly fixed"
          note="It lets FlatList skip measurement entirely, which is what makes scrollToIndex instant."
        >
          <Code>{`const getItemLayout = useCallback(
  (_data, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
  []
);

// Give it a wrong height and the list happily scrolls to the wrong
// place, with no error. That's why it's opt-in rather than automatic.
// Variable-height rows: leave it off.`}</Code>
        </SectionCard>

        <SectionCard
          title="Cheaper rows beat cleverer props"
          note="Four things that cost more per row than any tuning saves."
        >
          <Code>{`// 1. nested Views — flatten the row's tree
// 2. inline style objects — new object every render, breaks memo
//    style={{ padding: 12 }}  →  style={s.row}
// 3. large images without resizing — decode cost per row
// 4. shadows on Android — elevation forces a separate layer per row`}</Code>
        </SectionCard>

        <SectionCard
          title="When FlatList isn't enough"
          note="It mounts and unmounts rows. FlashList recycles them, which is a different cost curve."
        >
          <Code>{`import { FlashList } from "@shopify/flash-list";
<FlashList data={items} renderItem={renderItem} estimatedItemSize={60} />

// Noticeably smoother past a few hundred rows with images.
// FlatList is built in and fine for most lists — the swap is easy
// enough that it isn't worth adding the dependency pre-emptively.`}</Code>
        </SectionCard>

        <Text style={[type.heading, { color: colors.text, paddingTop: spacing.sm }]}>
          500 rows — scroll fast
        </Text>
      </View>
    ),
    [colors, tuned, tuning]
  );

  return (
    <FlatList
      data={DATA}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      ListHeaderComponent={Header}
      ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }}
      showsVerticalScrollIndicator={false}
      {...tuning}
    />
  );
}

const s = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md
  }
});
